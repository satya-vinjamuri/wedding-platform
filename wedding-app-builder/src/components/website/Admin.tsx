'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TextBlast from '../utilities/TextBlast';
import { useRouter } from "next/navigation";
import { User } from 'lucide-react';

interface EventSummaryItem {
    eventName: string;
    confirmed: number;
    notResponded: number;
    notAttending: number;
}

interface AdminProps {
    eventSummary: EventSummaryItem[];
    refreshRSVP: () => Promise<void>;
    rsvpSheetUrl: string;
    eventList: any[];
}

export default function Admin({ eventSummary, rsvpSheetUrl, refreshRSVP, eventList }: AdminProps) {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendTextBlast = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/sendTextBlast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });
            await res.json();
            alert('Text blast sent!');
        } catch (err) {
            alert('Failed to send text blast.');
        }
        setSending(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 text-[#1A1A1A]">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-[#D14D72]">Site Settings</h1>
                <Button
                    variant="outline"
                    className="text-black border border-gray-500 hover:bg-gray-100 text-sm font-bold"
                    onClick={() => {
                        router.push("/designer-settings");
                    }}
                >
                    <User size={16} className="mr-2" /> Account
                </Button>
            </div>

            {/* Text Blast */}
            <TextBlast onSend={handleSendTextBlast} groups={eventList} />

            {/* RSVP Viewer */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">View RSVP Summary</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center ml-[-20px]">
                    <Button
                        variant="outline"
                        onClick={refreshRSVP}
                        className="w-full border border-black font-bold sm:w-auto sm:mx-4 mb-2 sm:mb-0"
                    >
                        Refresh RSVP Data
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(rsvpSheetUrl, '_blank')}
                        className="w-full border border-black font-bold sm:w-auto sm:mx-4"
                    >
                        View Guest List
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-black rounded-md">
                        <thead className="bg-gray-100 border-b border-black">
                            <tr className='border-b border-black'>
                                <th className="px-4 py-2 text-left text-pink-700 border-r border-black">Event</th>
                                <th className="px-4 py-2 text-left border-r border-black">Attending</th>
                                <th className="px-4 py-2 text-left border-r border-black">Not Attending</th>
                                <th className="px-4 py-2 text-left border-r border-black">No Response</th>
                            </tr>
                        </thead>
                        <tbody className="border-r border-black">
                            {eventSummary.map((item, idx) => (
                                <tr key={idx} className="border-t border-black">
                                    <td className="px-4 py-2 font-bold text-pink-700 border-r border-black">{item.eventName}</td>
                                    <td className="px-4 py-2 border-r border-black">{item.confirmed}</td>
                                    <td className="px-4 py-2 border-r border-black">{item.notAttending}</td>
                                    <td className="px-4 py-2 border-r border-black">{item.notResponded}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
