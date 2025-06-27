'use client';

import { useEffect, useState } from 'react';

export default function RSVPForm({ rsvpSheetUrl }: { rsvpSheetUrl: string }) {
    const [name, setName] = useState('');
    const [sheetId, setSheetId] = useState('');
    const [phone, setPhone] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isFound, setIsFound] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allowedGuests, setAllowedGuests] = useState<number | null>(null);
    const [selectedGuestCount, setSelectedGuestCount] = useState(1);
    const [attendanceChoice, setAttendanceChoice] = useState<string | null>(null);
    const [invitedEvents, setInvitedEvents] = useState<string[]>([]);
    const [eventRSVPChoices, setEventRSVPChoices] = useState<Record<string, string>>({});

    useEffect(() => {
        function extractSheetId(url: string): string | null {
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : null;
        }

        const id = extractSheetId(rsvpSheetUrl);
        setSheetId(id || '');
    }, [rsvpSheetUrl]);

    const lookupGuest = async () => {
        setLoading(true);
        setIsFound(false);
        setStatusMessage('');

        try {
            const res = await fetch(`/api/rsvp/lookup?sheetId=${sheetId}`);
            const data = await res.json();

            const guest = data.find((user: any) =>
                user.Name?.toLowerCase().trim() === name.toLowerCase().trim() &&
                user.Phone?.toString().replace(/\s+/g, '') === phone.replace(/\s+/g, '')
            );

            if (guest) {
                const events = guest.Events.toString().includes('AllEvents')
                    ? ['Wedding Ceremony', 'Reception', 'Sangeet', 'Mehndi', 'Bride Haldi', 'Groom Haldi']
                    : guest.Events.split(',').map((e: string) => e.trim());

                const choices: Record<string, string> = {};
                events.forEach((e: string) => (choices[e] = ''));

                setIsFound(true);
                setAllowedGuests(parseInt(guest.AllowedGuests));
                setInvitedEvents(events);
                setEventRSVPChoices(choices);
            } else {
                setStatusMessage('Guest not found. Please check your details.');
            }
        } catch (err) {
            setStatusMessage('Error looking up guest.');
        } finally {
            setLoading(false);
        }
    };

    const submitRSVP = async () => {
        const confirmedEvents = Object.entries(eventRSVPChoices)
            .filter(([_, val]) => val === 'yes')
            .map(([key]) => key);

        const payload = {
            sheetId,
            name,
            phone,
            rsvp: confirmedEvents.length > 0,
            guestsAttending: confirmedEvents.length > 0 ? selectedGuestCount : 0,
            events: confirmedEvents,
        };

        await fetch('/api/rsvp/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        setIsConfirmed(true);
    };

    return (
        <div className="max-w-2xl mx-auto p-8 font-sans text-gray-800 bg-white shadow-xl rounded-3xl transition-all duration-300">
            <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">RSVP</h1>

            {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
            ) : (
                <>
                    {!isFound && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                lookupGuest();
                            }}
                            className="space-y-5"
                        >
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:outline-none text-lg"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:outline-none text-lg"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md font-semibold transition"
                            >
                                Look Up Invitation
                            </button>
                            {statusMessage && (
                                <p className="text-center text-red-600 font-medium">{statusMessage}</p>
                            )}
                        </form>
                    )}

                    {isFound && allowedGuests && !isConfirmed && (
                        <div className="space-y-6 mt-6">
                            <p className="text-xl font-semibold text-center">
                                {name.trim()} {allowedGuests > 1 ? 'and family' : ''}
                            </p>

                            {invitedEvents.map((event) => (
                                <div key={event} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                    <p className="font-medium mb-2">Will you attend <span className="italic">{event}</span>?</p>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={event}
                                                value="yes"
                                                checked={eventRSVPChoices[event] === 'yes'}
                                                onChange={() =>
                                                    setEventRSVPChoices((prev) => ({
                                                        ...prev,
                                                        [event]: 'yes',
                                                    }))
                                                }
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={event}
                                                value="no"
                                                checked={eventRSVPChoices[event] === 'no'}
                                                onChange={() =>
                                                    setEventRSVPChoices((prev) => ({
                                                        ...prev,
                                                        [event]: 'no',
                                                    }))
                                                }
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>
                            ))}

                            <div>
                                <label className="block mb-1 font-medium">Guests Attending</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400"
                                    value={selectedGuestCount}
                                    onChange={(e) => setSelectedGuestCount(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: allowedGuests }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-md font-bold transition"
                                onClick={submitRSVP}
                                disabled={Object.values(eventRSVPChoices).every((v) => v === '')}
                            >
                                Submit RSVP
                            </button>
                        </div>
                    )}

                    {isConfirmed && (
                        <div className="text-center mt-10 space-y-4">
                            <p className="text-lg font-semibold text-green-700">
                                ✅ Thank you for confirming your RSVP!
                            </p>
                            <button
                                className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-md"
                                onClick={() => {
                                    setIsConfirmed(false);
                                    setEventRSVPChoices({});
                                }}
                            >
                                Change RSVP
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

}
