"use client";
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import RSVP from '@/components/website/RSVP';
import { useAuth } from "@/context/AuthContext";
import Home from './Home';
import Contact from './Contact';
import Events from './Events';
import Admin from './Admin';

const EVENT_CODE_MAP: Record<string, string> = {
    W: 'Wedding Ceremony',
    R: 'Reception',
    S: 'Sangeet',
    M: 'Mehndi',
    BH: 'Bride Haldi',
    GH: 'Groom Haldi',
    E: 'All Events'
};

export default function WeddingSiteTabs({ data }: { data: any }) {
    const [activeTab, setActiveTab] = useState("saveTheDate");
    const [menuOpen, setMenuOpen] = useState(false);
    const [rsvpSheetUrl, setRSVPUrl] = useState<string>('');
    const [eventSummary, setEventSummary] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (data?.rsvpSheetUrl) {
            setRSVPUrl(data.rsvpSheetUrl);
        }
    }, [data?.rsvpSheetUrl]);

    useEffect(() => {
        fetchRSVPData();
    }, []);

    useEffect(() => {
        const savedTab = localStorage.getItem("activeTab");
        if (savedTab) setActiveTab(savedTab);
    }, []);

    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
    }, [activeTab]);

    const tabs = [
        data.enableSaveDate && { id: 'saveTheDate', label: 'Home' },
        data.enableStory && { id: 'story', label: 'Our Story' },
        data.enableWeddingParty && { id: 'weddingParty', label: 'Wedding Party' },
        data.enableRSVP && { id: 'rsvp', label: 'RSVP' },
        data.enableItinerary && { id: 'events', label: 'Events' },
        data.contactInfo?.length > 0 && { id: 'contact', label: 'Contact' },
        data.enableRegistry && { id: 'registry', label: 'Registry' },
        user && { id: 'admin', label: 'Admin' },
    ].filter(Boolean);


    const fetchRSVPData = async () => {
        try {
            function extractSheetId(url: string): string | null {
                const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                return match ? match[1] : null;
            }

            const id = extractSheetId(data.rsvpSheetUrl);
            const res = await fetch(`/api/rsvp/lookup?sheetId=${id}`);
            const rawData = await res.json();

            const summaryMap: Record<string, { confirmed: number; notResponded: number; notAttending: number }> = {};

            for (const guest of rawData) {
                const codes = (guest.EventsConfirmed || '').split(',').map((code: string) => code.trim());
                const status = guest.RSVPStatus;
                const guestsAttending = parseInt(guest.GuestsAttending, 10) || 0;
                const allowedGuests = parseInt(guest.AllowedGuests, 10) || 0;

                let expandedCodes = codes.includes('E')
                    ? Object.keys(EVENT_CODE_MAP).filter(k => k !== 'E')
                    : codes;

                const missingGuests = allowedGuests - guestsAttending;

                for (const code of expandedCodes) {
                    const name = EVENT_CODE_MAP[code] || code;
                    if (!summaryMap[name]) {
                        summaryMap[name] = { confirmed: 0, notResponded: 0, notAttending: 0 };
                    }

                    if (status === 'Confirmed') {
                        summaryMap[name].confirmed += guestsAttending;
                        if (missingGuests > 0) {
                            summaryMap[name].notAttending += missingGuests;
                        }
                    } else if (status === 'Not Responded') {
                        summaryMap[name].notResponded += allowedGuests;
                    } else if (status === 'Not Attending') {
                        summaryMap[name].notAttending += allowedGuests;
                    }
                }
            }


            const summaryArray = Object.entries(summaryMap).map(([eventName, counts]) => ({ eventName, ...counts }));
            setEventSummary(summaryArray);
        } catch (err) {
            alert('Failed to fetch RSVP data.');
        }
    };

    return (
        <div className="w-full min-h-screen max-w-4xl mx-auto font-serif">
            {/* Responsive Nav */}
            <div className="border-b mb-4">
                {/* Desktop Tabs */}
                <div className="hidden md:flex justify-around">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-black' : 'text-gray-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Mobile Hamburger */}
                <div className="flex md:hidden justify-between items-center px-4 py-3">
                    <h2 className="text-lg font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {menuOpen && (
                    <div className="md:hidden flex flex-col px-4 pb-3 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setMenuOpen(false);
                                }}
                                className={`text-left text-sm ${activeTab === tab.id ? 'text-black font-semibold' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'saveTheDate' && data.enableSaveDate && <Home form={data} />}
                {activeTab === 'rsvp' && data.enableRSVP && <RSVP rsvpSheetUrl={rsvpSheetUrl} />}
                {activeTab === 'events' && data.enableItinerary && <Events form={data} />}
                {activeTab === 'story' && data.enableStory && (
                    <div className="space-y-4">
                        {data.storySections.map((s: any, i: number) => (
                            <div key={i}>
                                <h3 className="text-xl font-bold">{s.title}</h3>
                                <p>{s.paragraph}</p>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'weddingParty' && data.enableWeddingParty && (
                    <div className="space-y-4">
                        {data.weddingParty.map((p: any, i: number) => (
                            <div key={i}>
                                <h3 className="text-xl font-bold">{p.name}</h3>
                                <p>{p.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'contact' && data.contactInfo?.length > 0 && <Contact form={data} />}
                {activeTab === 'admin' && user && (
                    <Admin
                        rsvpSheetUrl={rsvpSheetUrl}
                        eventSummary={eventSummary}
                        refreshRSVP={fetchRSVPData}
                    />
                )}




            </div>
        </div>
    );
}
