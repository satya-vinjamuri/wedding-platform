// TextBlast.js
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextBlastProps {
    onSend: (message: string, group: string) => void;
    groups: string[];
}

export default function TextBlast({ onSend, groups }: TextBlastProps) {
    const [messageType, setMessageType] = useState('');
    const [messageTitle, setMessageTitle] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [targetGroup, setTargetGroup] = useState('');
    const [sending, setSending] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const handleSendTextBlast = async () => {
        setSending(true);
        try {
            await onSend(`${messageTitle}\n\n${messageBody}`, targetGroup);
            alert('Text blast sent!');
        } catch (err) {
            alert('Failed to send text blast.');
        }
        setSending(false);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Send Text Blast</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <label className="block text-sm font-medium mb-2">Message Type:</label>
                    <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                        className="block w-full p-2 pl-10 text-sm text-black rounded-lg border border-black focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a message type</option>
                        <option value="save-the-date">Save the Date</option>
                        <option value="wedding-invitation">Wedding Invitation</option>
                        <option value="reminder">Reminder</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="w-full md:w-1/2 ml-4">
                    <label className="block text-sm font-medium mb-2">Message Title:</label>
                    <input
                        type="text"
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        placeholder="Enter message title"
                        className="block w-full p-2 text-sm text-black rounded-lg border border-black focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <label className="block text-sm font-medium mb-2">Target Group:</label>
                    <select
                        value={targetGroup}
                        onChange={(e) => setTargetGroup(e.target.value)}
                        className="block w-full p-2 pl-10 text-sm text-black rounded-lg border border-black focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a target group</option>
                        <option key="all" value="all">All Guests</option>
                        {groups.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-1/2 ml-4">
                    <label className="block text-sm font-medium mb-2">Attach Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                        className="block w-full p-2 text-sm text-black rounded-lg border border-black focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Enter your message"
                className="w-full border-black text-black"
            />
            <Button onClick={handleSendTextBlast} disabled={sending} className="w-full border border-black text-black sm:w-auto">
                {sending ? 'Sending...' : 'Send Text Blast'}
            </Button>
            <Button onClick={handleSendTextBlast} disabled={sending} className="w-full ml-2 border border-black text-black sm:w-auto">
                View Previous Text Blasts
            </Button>
        </div>
    );
}