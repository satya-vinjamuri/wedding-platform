'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EventSummaryItem {
    eventName: string;
    confirmed: number;
    notResponded: number;
    notAttending: number;
}

interface AdminProps {
    eventSummary: EventSummaryItem[];
    refreshRSVP: () => void;
    rsvpSheetUrl: string;
}

export default function Admin({ eventSummary, rsvpSheetUrl, refreshRSVP }: AdminProps) {
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 font-serif text-[#1A1A1A]">
            <h1 className="text-3xl font-extrabold text-[#D14D72]">Couple Settings</h1>

            {/* Text Blast */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Send Text Blast</h2>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full"
                />
                <Button onClick={handleSendTextBlast} disabled={sending} className="w-full sm:w-auto">
                    {sending ? 'Sending...' : 'Send Text Blast'}
                </Button>
            </div>

            {/* RSVP Viewer */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">View RSVP Summary</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    <Button
                        variant="outline"
                        onClick={refreshRSVP}
                        className="w-full sm:w-auto sm:mx-4 mb-2 sm:mb-0"
                    >
                        Refresh RSVP Data
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(rsvpSheetUrl, '_blank')}
                        className="w-full sm:w-auto sm:mx-4"
                    >
                        View Guest List
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-pink-700">Event</th>
                                <th className="px-4 py-2 text-left">Attending</th>
                                <th className="px-4 py-2 text-left">Not Attending</th>
                                <th className="px-4 py-2 text-left">No Response</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventSummary.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="px-4 py-2 font-medium text-pink-700">{item.eventName}</td>
                                    <td className="px-4 py-2">{item.confirmed}</td>
                                    <td className="px-4 py-2">{item.notAttending}</td>
                                    <td className="px-4 py-2">{item.notResponded}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
