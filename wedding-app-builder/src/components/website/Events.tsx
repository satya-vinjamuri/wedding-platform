'use client';

import { FormState } from "@/types/FormState";
import { CalendarDays, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

export default function Events({ form }: { form: FormState }) {

    const convertTo24Hour = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') hours = '00';
        if (modifier.toLowerCase() === 'pm') hours = (parseInt(hours, 10) + 12).toString();

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    };

    const generateICS = (event: any) => {
        const { date, startTime, endTime } = event;

        if (!date || !startTime || !endTime) {
            console.warn("Missing required event values:", { date, startTime, endTime });
            return;
        }

        const start24 = convertTo24Hour(startTime);
        const end24 = convertTo24Hour(endTime);

        const startDateTimeStr = `${date}T${start24}`;
        const endDateTimeStr = `${date}T${end24}`;

        const startDate = new Date(startDateTimeStr);
        const endDate = new Date(endDateTimeStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn("Invalid date format for:", { startDateTimeStr, endDateTimeStr });
            return;
        }

        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.name}\nDESCRIPTION:${event.dressCode || ''}\nLOCATION:${event.location}\nDTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}\nDTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}\nEND:VEVENT\nEND:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.name.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };




    return (
        <div className="max-w-6xl mx-auto px-6 py-12  text-[#1A1A1A] bg-[#FFFBF8] rounded-3xl shadow-md">
            <div className="flex flex-col md:flex-row items-start gap-10">
                {/* Left side: Event list */}
                <div className="w-full space-y-10">
                    <div className="text-center md:text-center space-y-3">
                        <h2 className="text-5xl font-extrabold text-[#D14D72] tracking-tight">Wedding Events</h2>
                        <p className="text-gray-600 text-lg">
                            Join us in celebrating our special moments
                        </p>
                    </div>

                    <div className="space-y-8">
                        {form.weddingEvents?.map((event, idx) => {
                            const formattedDate = event.date
                                ? format(new Date(event.date), 'EEEE, MMMM d, yyyy')
                                : '';

                            return (
                                <div
                                    key={idx}
                                    className="w-full md:w-full bg-white border border-pink-100 rounded-2xl p-6 shadow-sm"
                                >

                                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{event.name}</h3>

                                    <div className="flex flex-col md:flex-row md:items-center text-gray-700 mb-2 gap-1">
                                        <div className="flex items-center">
                                            <CalendarDays className="w-5 h-5 mr-2 text-pink-500" />
                                            <span className="font-medium">{formattedDate}</span>
                                        </div>
                                        <span className="font-medium">{event.startTime} – {event.endTime}</span>
                                    </div>


                                    <p className="text-gray-700">
                                        <strong>Location:</strong> {event.location}
                                    </p>

                                    {event.dressCode && (
                                        <p className="mt-2 italic text-gray-500">
                                            Dress Code: {event.dressCode}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
