import { FormState } from "@/types/FormState";

export const validateRequiredFields = (
    form: FormState,
    setErrorMessages: (errors: string[]) => void
): string[] => {
    const errors: string[] = [];

    // Basic Info
    if (!form.brideName.trim()) errors.push("Bride name");
    if (!form.groomName.trim()) errors.push("Groom name");
    if (!form.weddingDate.trim()) errors.push("Wedding date");
    if (!form.weddingLocation.trim()) errors.push("Wedding location");
    if (!form.appName.trim()) errors.push("App name");

    // Save the Date
    if (form.enableSaveDate && !form.saveTheDateImageUrl) {
        errors.push("Please choose an image for your Save The Date screen");
    }

    // Story
    if (form.enableStory) {
        if (!form.storySections || form.storySections.length === 0) {
            errors.push("At least one story section is required");
        } else {
            const hasParagraph = form.storySections.some((section) => section.paragraph.trim() !== "");
            const hasImage = form.storySections.some((section) => section.image !== null);
            if (!hasParagraph) errors.push("At least one story paragraph is required");
            if (!hasImage) errors.push("At least one story image is required");
        }
    }


    // Travel
    if (form.enableTravel) {
        if (!Array.isArray(form.hotelDetails) || form.hotelDetails.length === 0) {
            errors.push("Hotel details required if Travel is enabled");
        }
        if (!Array.isArray(form.venueDetails) || form.venueDetails.length === 0) {
            errors.push("Venue details required if Travel is enabled");
        }
    }

    // Settings
    if (form.enableSettings) {
        if (form.faqs.length === 0 && form.contactInfo.length === 0) {
            errors.push("Must enter settings form details if Settings is enabled");
        }
    }

    // Wedding Party
    if (form.enableWeddingParty) {
        const hasBrideParty = form.weddingParty.bride.some(member => member.name.trim());
        const hasGroomParty = form.weddingParty.groom.some(member => member.name.trim());
        if (!hasBrideParty && !hasGroomParty) {
            errors.push("At least one Wedding Party member must be added if Wedding Party is enabled");
        }
    }

    // Events
    if (
        (!Array.isArray(form.weddingEvents) || form.weddingEvents.length === 0) &&
        (!Array.isArray(form.brideEvents) || form.brideEvents.length === 0) &&
        (!Array.isArray(form.groomEvents) || form.groomEvents.length === 0)
    ) {
        errors.push("At least one Wedding, Bride, or Groom Event is required");
    }

    // Registry (optional toggle)
    if (form.enableRegistry && form.registries.length === 0) {
        errors.push("Registry is enabled but no registry links have been added");
    }

    setErrorMessages(errors);
    return errors;
};
