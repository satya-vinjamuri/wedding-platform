import { subDays, format } from "date-fns";
import { Notification } from "@/types/FormState";

export function generateEventNotification(
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    eventTime?: string,
    type: "WeddingEvents" | "RSVP" | "PlannerOrCoupleUpdates" = "WeddingEvents"
): Notification {
    const notificationDate = subDays(eventDate, 1);
    return {
        id: eventId,
        title: `Upcoming: ${eventTitle}`,
        message: `Reminder: "${eventTitle}" is scheduled for ${format(eventDate, "MMMM d")} at ${eventTime || "TBD"}.`,
        date: format(notificationDate, "yyyy-MM-dd"),
        type,
        relatedEventId: eventId,
    };
}


