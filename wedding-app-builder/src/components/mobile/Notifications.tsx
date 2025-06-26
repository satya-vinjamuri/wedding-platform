"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Notification } from "@/types/FormState";
import { generateEventNotification } from "@/lib/generateEventNotification"
import { differenceInDays, addDays, format } from "date-fns";
import { X } from "lucide-react";

type NotificationsProps = {
    form: {
        enableRSVPNotification: boolean;
        enableEventNotification: boolean;
        enablePlannerUpdates: boolean;
        rsvpDeadline?: string;
        notifications?: Notification[];
    };
    handleChange: (field: string, value: any) => void;
};


const customNotificationHeader = [
    "Note from the couple",
    "Venue change for event",
    "Time change for event",
    "Custom no title"
];

export default function Notifications({
    form,
    handleChange,
}: NotificationsProps) {
    const [customNotifications, setCustomNotifications] = useState<
        { title: string; message: string; customTitle?: string }[]
    >(() => {
        const plannerNotifications = (form.notifications || []).filter(
            (n) => n.type === "PlannerOrCoupleUpdates"
        );

        return plannerNotifications.map((n) => ({
            title: customNotificationHeader.includes(n.title) ? n.title : "Custom no title",
            message: n.message,
            customTitle: customNotificationHeader.includes(n.title) ? "" : n.title,
        })) || [{ title: customNotificationHeader[0], message: "", customTitle: "" }];
    });




    useEffect(() => {
        if (form.enableRSVPNotification && form.rsvpDeadline) {
            const deadlineDate = new Date(form.rsvpDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // strip time

            const totalDays = differenceInDays(deadlineDate, today);
            if (totalDays <= 0) return; // Deadline already passed

            const idPrefix = "rsvp-week";
            const notifications: Notification[] = [];

            // Remove existing RSVP-type notifications
            const existing = (form.notifications || []).filter(n => n.type !== "RSVP");

            // Generate weekly notifications from today → deadline
            let i = 0;
            while (true) {
                const notifyDate = addDays(today, i);
                if (notifyDate >= deadlineDate) break;

                notifications.push({
                    id: `${idPrefix}-${format(notifyDate, "yyyyMMdd")}`,
                    title: `RSVP Reminder`,
                    message: `Don't forget to RSVP by ${format(deadlineDate, "MMMM d")}.`,
                    date: format(notifyDate, "yyyy-MM-dd"),
                    type: "RSVP",
                    relatedEventId: "rsvp-id",
                });

                i += 7;
            }

            // Add one final reminder the day before
            const finalReminderDate = addDays(deadlineDate, -1);
            if (finalReminderDate > today) {
                notifications.push({
                    id: `${idPrefix}-final`,
                    title: `Final RSVP Reminder`,
                    message: `Final call! RSVP deadline is tomorrow (${format(deadlineDate, "MMMM d")}).`,
                    date: format(finalReminderDate, "yyyy-MM-dd"),
                    type: "RSVP",
                    relatedEventId: "rsvp-id",
                });
            }

            // Replace RSVP notifications
            form.notifications = [...existing, ...notifications];
        }
    }, [form.rsvpDeadline]);



    const filteredNotifications = form.notifications?.filter((n) => {
        if (n.type === "RSVP" && form.enableRSVPNotification) return true;
        if (n.type === "WeddingEvents" && form.enableEventNotification) return true;
        if (n.type === "PlannerOrCoupleUpdates" && form.enablePlannerUpdates) return true;
        return false;
    });


    const handleTitleChange = (
        field: "title" | "paragraph",
        value: string
    ) => {
        const updated = [...(form.notifications || [])];
        //updated[index][field] = value;
    };

    useEffect(() => {
        if (!form.enablePlannerUpdates) return;

        const plannerNotifications: Notification[] = customNotifications
            .filter((n) => n.message.trim() !== "")
            .map((n, i) => ({
                id: `planner-${i}-${Date.now()}`,
                title: n.title === "Custom no title" ? n.customTitle || "Custom Notification" : n.title,
                message: n.message,
                date: new Date().toISOString().split("T")[0], // today
                type: "PlannerOrCoupleUpdates",
                relatedEventId: "planner-id",
            }));

        // Keep existing non-planner notifications
        const existing = (form.notifications || []).filter(n => n.type !== "PlannerOrCoupleUpdates");

        // Update form.notifications with merged
        form.notifications = [...existing, ...plannerNotifications];
    }, [customNotifications, form.enablePlannerUpdates]);


    console.log(form.notifications);

    return (
        <div className="w-full">
            <div>
                <h2 className="text-2xl font-bold text-pink-400">Push Notifications</h2>
                <p className="text-sm text-mauve mt-2">
                    Choose which updates you'd like your guests to receive.
                </p>
            </div>

            <div className="flex flex-row lg:flex-row gap-4 mt-4">
                {/* Left: Notification Settings Form */}
                <div className="bg-petal p-6 rounded-lg text-cocoa space-y-6 w-full lg:w-1/2">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={form.enableRSVPNotification}
                                    onChange={(e) =>
                                        handleChange("enableRSVPNotification", e.target.checked)
                                    }
                                    className="accent-pink-500 w-4 h-4"
                                />
                                <span className="text-cocoa font-medium">RSVP Notifications</span>
                            </label>

                            {form.enableRSVPNotification && (
                                <div className="ml-6">
                                    <label className="block text-sm font-medium mb-1 text-cocoa">
                                        RSVP Deadline Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.rsvpDeadline || ""}
                                        onChange={(e) =>
                                            handleChange("rsvpDeadline", e.target.value)
                                        }
                                        className="px-3 py-2 border border-mauve rounded-md bg-white text-cocoa"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={form.enableEventNotification}
                                onChange={(e) =>
                                    handleChange("enableEventNotification", e.target.checked)
                                }
                                className="accent-pink-500 w-4 h-4"
                            />
                            <span className="text-cocoa font-medium">Wedding Event Notifications</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Scheduled Notifications */}
            {filteredNotifications && filteredNotifications.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-cocoa mb-4">Scheduled Notifications</h3>

                    {form.enableRSVPNotification && form.rsvpDeadline && (
                        <div className="bg-white p-4 rounded shadow text-sm text-cocoa border border-mauve mb-4">
                            <div className="font-medium mb-1">RSVP Reminders Active</div>
                            <div>
                                Weekly RSVP reminders will be sent to guests until{" "}
                                <strong>{new Date(form.rsvpDeadline).toLocaleDateString()}</strong>.
                            </div>
                        </div>
                    )}

                    <ul className="space-y-2">
                        {filteredNotifications
                            .filter((n) => n.type !== "RSVP")
                            .map((n) => (
                                <li
                                    key={n.id}
                                    className="bg-white p-3 rounded shadow text-sm text-cocoa border border-mauve"
                                >
                                    <div className="font-medium">{n.title}</div>
                                    <div>{n.message}</div>
                                    <div className="text-xs text-gray-500">
                                        Scheduled for: {n.date}
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
