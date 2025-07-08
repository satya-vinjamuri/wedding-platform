"use client";

import {
    Calendar as BigCalendar,
    momentLocalizer,
    SlotInfo,
    Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { View } from "react-big-calendar";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { EventDetails, FormState } from "@/types/FormState";
import { generateEventNotification } from "@/lib/generateEventNotification";
import { Notification } from "@/types/FormState";

const localizer = momentLocalizer(moment);



type CalendarEvent = {
    id: string;
    start: Date;
    end: Date;
    title: string;
    type: "weddingEvents" | "brideEvents" | "groomEvents";
    location: string;
    dressCode: string;
    time: string;
    endTime: string;
};

type CalendarPageProps = {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
};

export default function CalendarPage({ form, setForm }: CalendarPageProps) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);
    
    const [eventTitle, setEventTitle] = useState("");
    const [eventType, setEventType] = useState<CalendarEvent["type"]>("weddingEvents");
    const [eventLocation, setEventLocation] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [eventDressCode, setEventDressCode] = useState("");
    const [isMobile, setIsMobile] = useState(false);





    const getInitialDate = () => {
        if (form.weddingEvents.length > 0) {
            const first = form.weddingEvents[0];
            return new Date(`${first.date}T12:00:00`);
        }
        return new Date();
    };

    const [currentDate, setCurrentDate] = useState(getInitialDate);
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);



    const months = moment.months();
    const years = Array.from({ length: 10 }, (_, i) => 2020 + i);



    const handleSelectSlot = ({ start, end }: SlotInfo) => {
        setSlotInfo({ start, end });
        setEditingId(null);
        setEventTitle("");
        setEventLocation("");
        setEventTime("");
        setEndTime("");
        setEventDressCode("");
        setEventType("weddingEvents");
        setModalOpen(true);

        console.log(start, end);

        console.log(start, end);
    };

    useEffect(() => {
        const convertToCalendar = (type: CalendarEvent["type"]) => (event: EventDetails): CalendarEvent => ({
            id: event.id,
            start: parseTime(new Date(`${event.date}T12:00:00`), event.startTime),
            end: parseTime(new Date(`${event.date}T12:00:00`), event.endTime),
            title: event.name,
            location: event.location,
            dressCode: event.dressCode,
            time: event.startTime,
            endTime: event.endTime,
            type,
        });


        const allEvents: CalendarEvent[] = [
            ...form.weddingEvents.map(convertToCalendar("weddingEvents")),
            ...form.brideEvents.map(convertToCalendar("brideEvents")),
            ...form.groomEvents.map(convertToCalendar("groomEvents")),
        ];

        setEvents(allEvents);
    }, [form]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640); // sm breakpoint
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const parseTime = (date: Date, timeStr?: string): Date => {
        if (!timeStr) return date; // or throw an error or return a fallback value

        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const newDate = new Date(date);
        newDate.setHours(hours, minutes);
        return newDate;
    };


    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = "#38a169"; // default green for wedding

        if (event.type === "brideEvents") backgroundColor = "#ed64a6"; // pink
        if (event.type === "groomEvents") backgroundColor = "#4299e1"; // blue

        return {
            style: {
                backgroundColor,
                borderRadius: "6px",
                color: "white",
                border: "none",
                display: "block",
            },
        };
    };

    const handleAddOrUpdateEvent = () => {
        if (!eventTitle || !slotInfo || !eventTime || !endTime) return;

        const startDate = parseTime(slotInfo.start, eventTime);
        const endDate = parseTime(slotInfo.start, endTime);

        const id = editingId ?? uuidv4();

        const newFormEvent: EventDetails = {
            id,
            name: eventTitle,
            date: format(slotInfo.start, "yyyy-MM-dd"),
            startTime: eventTime,
            endTime,
            location: eventLocation,
            dressCode: eventDressCode,
        };

        const newCalendarEvent: CalendarEvent = {
            ...newFormEvent,
            id,
            title: eventTitle,
            start: startDate,
            end: endDate,
            time: eventTime,
            type: eventType,
        };

        const formList = form[eventType];

        const hasConflict = events.some((ev) => {
            if (ev.type !== eventType || ev.id === id) return false;
            return (
                (startDate >= ev.start && startDate < ev.end) ||
                (endDate > ev.start && endDate <= ev.end) ||
                (startDate <= ev.start && endDate >= ev.end)
            );
        });

        if (hasConflict) {
            alert("Time conflict detected with another event of the same type.");
            return;
        }

        const updatedFormArray = editingId
            ? formList.map((e) => (e.id === editingId ? newFormEvent : e))
            : [...formList, newFormEvent];

        // Clone current form
        const updatedForm = { ...form, [eventType]: updatedFormArray };

        // Set weddingDate and weddingLocation if event is "wedding ceremony"
        if (eventTitle.trim().toLowerCase() === "wedding ceremony") {
            console.log(slotInfo.start);
            console.log(slotInfo.start.toString());
            updatedForm.weddingDate = format(slotInfo.start, "yyyy-MM-dd");
            updatedForm.weddingLocation = eventLocation;
        }

        // inside handleAddOrUpdateEvent
        const notification = generateEventNotification(
            id,
            eventTitle,
            slotInfo.start,
            eventTime
        );

        setNotifications((prev) => [...prev, notification]);
        const updatedNotifications = editingId
            ? (form.notifications || []).filter((n) => n.relatedEventId !== id)
            : form.notifications || [];

        updatedForm.notifications = [...updatedNotifications, notification];

        setForm(updatedForm);

        console.log(form)

        setEditingId(null);
        setModalOpen(false);
        setEventTitle("");
        setEventLocation("");
        setEventTime("");
        setEndTime("");
        setEventDressCode("");
    };

    type EventKey = "weddingEvents" | "brideEvents" | "groomEvents";

    const handleDeleteEvent = (eventId: string, type: EventKey) => {
        console.log(form.weddingEvents);
        console.log("eventId ", eventId);
        const updatedEvents = form[type].filter((event) => event.id !== eventId);
        console.log('event', updatedEvents);
        setForm((prevForm) => ({
            ...prevForm,
            [type]: updatedEvents,
        }));
        setModalOpen(false);
        console.log("updatee form", form.weddingEvents);
    };

    const handleMobileSlotSelect = ({ start, end }: SlotInfo) => {
        setSlotInfo({ start, end });
        setEditingId(null);
        setEventTitle("");
        setEventLocation("");
        setEventTime("");
        setEndTime("");
        setEventDressCode("");
        setEventType("weddingEvents");
        setModalOpen(true);

        console.log(start, end);

        console.log(start, end);
    }
    console.log("form.issubmitted", form.isSubmitted);
    return (
        <div className="py-6 bg-[#FFF5F7] w-[345px]">
            <div className="flex items-center gap-2 mb-2 relative">
                <Label className="text-black font-bold text-lg">Wedding Event Calendar</Label>
                <button
                    type="button"
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold"
                >
                    ?
                </button>

                {showTooltip && (
                    <div className="absolute left-0 mt-[-150px] sm:mt-1 sm:left-auto sm:right-0 z-10 w-[90vw] sm:w-[280px] p-3 bg-black text-white text-sm rounded shadow-lg whitespace-pre-line break-words">
                    Enter all your wedding festivities! Remember to highlight the actual wedding ceremony as event name "Wedding Ceremony"
                    Customize your Events as you please! Set your own start and end time, dress code, and location.
                    </div>
                )}
            </div>

            {isMobile ? (
                <div className="flex flex-col gap-4 w-[300px]">
                    {/* Native iOS date picker or react-datepicker */}
                    <label className="text-lg font-bold">Select Date & Enter your Wedding Festivities!</label>
                    <input
                        type="date"
                        value={format(currentDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          handleMobileSlotSelect({ start: selectedDate, end: selectedDate } as SlotInfo);
                          setCurrentDate(selectedDate); // keep date in sync
                        }}
                        //disabled={form.isSubmitted}
                        className="border p-2 rounded bg-[#FFF5F7] border-pink-300"
                    />
                </div>
                ) : (
                    <>
                        {/* DESKTOP-ONLY: calendar controls and BigCalendar */}
                        <div className="flex flex-wrap gap-2 mb-6 items-center">
                            <select
                                value={currentDate.getMonth()}
                                onChange={(e) => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(parseInt(e.target.value));
                                setCurrentDate(newDate);
                                }}
                                className="border p-2 bg-[#FFF5F7] rounded border-pink-300"
                                disabled={form.isSubmitted}
                            >
                                {months.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                                ))}
                        </select>

                            <select
                                value={currentDate.getFullYear()}
                                onChange={(e) => {
                                const newDate = new Date(currentDate);
                                newDate.setFullYear(parseInt(e.target.value));
                                setCurrentDate(newDate);
                                }}
                                className="border bg-[#FFF5F7] border border-pink-300 p-2 rounded"
                                disabled={form.isSubmitted}
                            >
                                {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-[343px] sm:overflow-x-visible">
                        <div className="min-w-[600px] sm:min-w-0">
                            <BigCalendar
                                localizer={localizer}
                                selectable={!form.isSubmitted}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                view={currentView}
                                views={["month", "week", "day"]}
                                onView={setCurrentView}
                                date={currentDate}
                                onNavigate={setCurrentDate}
                                style={{ height: 400, width: "100%" }}
                                popup
                                onSelectSlot={handleSelectSlot}
                                onSelectEvent={(event: CalendarEvent) => {
                                    setSlotInfo({ start: event.start, end: event.end });
                                    setEventTitle(event.title);
                                    setEventType(event.type);
                                    setEventLocation(event.location);
                                    setEventTime(event.time);
                                    setEndTime(event.endTime);
                                    setEventDressCode(event.dressCode);
                                    setEditingId(event.id);
                                    setModalOpen(true);
                                }}
                                eventPropGetter={eventStyleGetter}
                            />
                        </div>
                        </div>
                    </>
                )}
                {isMobile && (
                    <div className="flex flex-col gap-4 w-[300px] py-4">
                        {form.groomEvents.length > 0 && (
                        <div className="flex flex-col gap-4 w-[300px]">
                            <label className="text-xl font-bold">Groom Events</label>
                            {form.groomEvents.map((event) => (
                                <div key={event.id}>
                                    <p>{format(new Date(event.date), "MM/dd/yyyy")} {event.name}</p>
                                </div>
                                
                            ))}
                        </div>  
                        )}
                        {form.brideEvents.length > 0 && (
                            <div className="flex flex-col gap-4 w-[300px]">
                                <label className="text-xl font-bold">Bride Events</label>
                                {form.brideEvents.map((event) => (
                                    <div key={event.id}>
                                        <p>{format(new Date(event.date), "MM/dd/yyyy")} {event.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {form.weddingEvents.length > 0 && (
                            <div className="flex flex-col gap-4 w-[300px]">
                                <label className="text-xl font-bold">Wedding Events</label>
                                {form.weddingEvents.map((event) => (
                                    <div key={event.id}>
                                        <p>{format(new Date(event.date), "MM/dd/yyyy")} {event.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}                        
                    </div>
                )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="space-y-4 max-w-xl bg-[#FFF5F7] text-black !bg-opacity-100 !backdrop-blur-none shadow-xl border border-gray-300 rounded-xl">
                    <DialogTitle className="text-lg font-bold text-center">{editingId ? "Update Event" : "Add New Event"}</DialogTitle>

                    {slotInfo && (
                        <p className="text-sm text-center text-gray-600">
                            {format(slotInfo.start, "PPP p")} — {format(slotInfo.end, "p")}
                            {format(slotInfo.start, "PPP p")} — {format(slotInfo.end, "p")}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Event Name</Label>
                            <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} disabled={form.isSubmitted} />
                        </div>

                        <div>
                            <Label>Event Type</Label>
                            <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value as CalendarEvent["type"])}
                                className="w-full border rounded-md px-2 py-2 bg-[#FFF5F7] text-black"
                                disabled={form.isSubmitted}
                            >
                                <option value="weddingEvents">Wedding</option>
                                <option value="brideEvents">Bride</option>
                                <option value="groomEvents">Groom</option>
                            </select>
                        </div>
                        <div>
                            <Label>Start Time</Label>
                            <input
                                type="time"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                disabled={form.isSubmitted}
                                className="w-full border rounded-md px-2 py-2 bg-[#FFF5F7] text-black"
                            />
                            </div>
                            <div>
                            <Label>End Time</Label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                disabled={form.isSubmitted}
                                className="w-full border rounded-md px-2 py-2 bg-[#FFF5F7] text-black"
                            />
                        </div>

                        {/* <div>
                            <Label>Start Time</Label>
                            <Input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="e.g. 5:00 PM" disabled={form.isSubmitted} />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="e.g. 5:00 PM" disabled={form.isSubmitted} />
                        </div> */}

                        <div>
                            <Label>Location</Label>
                            <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} disabled={form.isSubmitted} />
                        </div>

                        <div className="sm:col-span-2">
                            <Label>Dress Code</Label>
                            <Input value={eventDressCode} onChange={(e) => setEventDressCode(e.target.value)} disabled={form.isSubmitted} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        {editingId && (
                            <Button variant="outline" className="text-sm border border-red-500 text-red-500 hover:bg-red-900 px-4 py-2 rounded-md"
                                onClick={() => handleDeleteEvent(editingId, eventType)} disabled={form.isSubmitted}>Delete Event</Button>
                        )}
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddOrUpdateEvent} className="bg-pink-500 text-white font-bold" disabled={form.isSubmitted}>
                            {editingId ? "Update Event" : "Add Event"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

