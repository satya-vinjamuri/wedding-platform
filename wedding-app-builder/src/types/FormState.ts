export interface EventDetails {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    dressCode: string;
}

export interface PartyMember {
    name: string;
    role: string;
    relation: string;
    image: File | null;
}

export interface FormState {
    // Core Info
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingLocation: string;
    appName: string;

    // RSVP & Gallery
    enableRSVP: boolean;
    rsvpSheetUrl: string;
    enableGallery: boolean;
    galleryDriveUrl: string;

    // Save the Date
    enableSaveDate: boolean;
    saveTheDateImage: File | null;
    saveTheDateImageUrl?: string;

    // Story
    enableStory: boolean;

    storySections?: {
        title: string;
        paragraph: string;
        image: File | null;
    }[];


    // Travel
    enableTravel: boolean;
    hotelDetails: string[];
    venueDetails: string[];


    // Settings
    enableSettings: boolean;
    faqs: { question: string; answer: string, customQuestion: string, }[];
    contactInfo: { name: string; phone: string; email: string }[];

    // Wedding Party
    enableWeddingParty: boolean;
    weddingParty: {
        bride: PartyMember[];
        groom: PartyMember[];
    };

    // Events
    enableItinerary: boolean;
    weddingEvents: EventDetails[];
    brideEvents: EventDetails[];
    groomEvents: EventDetails[];

    // Password Protection
    enablePassword: boolean;
    appPassword?: string;
    enableAdminPassword: boolean;
    adminAppPassword?: string;

    // UI Preferences
    selectedFont: "Serif" | "Sans" | "Script";
    selectedColor: string;
    selectedFontColor: string;
    backgroundImage: string | File | null;

    // Misc Features
    enableCountdown: boolean;
    isHomeScreen: boolean;
    showRSVPButton: boolean;
    enableRegistry: boolean;
    enableRSVPNotification: boolean;
    enableEventNotification: boolean;
    enablePlannerUpdates: boolean;
    rsvpDeadline?: string;
    registries: { label: string; url: string }[];

    // Submission State
    isSubmitted: boolean;
}

export const defaultFormState: FormState = {
    // Core Info
    brideName: "",
    groomName: "",
    weddingDate: "",
    weddingLocation: "",
    appName: "",

    // RSVP & Gallery
    enableRSVP: true,
    rsvpSheetUrl: "",
    enableGallery: false,
    galleryDriveUrl: "",

    // Save the Date
    enableSaveDate: true,
    saveTheDateImage: null,

    // Story
    enableStory: false,

    // Travel
    enableTravel: false,
    hotelDetails: [],
    venueDetails: [],

    // Itinerary
    enableItinerary: true,
    weddingEvents: [],
    brideEvents: [],
    groomEvents: [],

    // Settings
    enableSettings: true,
    faqs: [],
    contactInfo: [],

    // Wedding Party
    enableWeddingParty: false,
    weddingParty: {
        bride: [],
        groom: [],
    },

    // Registry
    enableRegistry: false,
    registries: [],

    // Passwords
    enablePassword: false,
    enableAdminPassword: false,

    // UI & Visuals
    selectedFont: "Serif",
    selectedColor: "",
    selectedFontColor: "",
    backgroundImage: "",

    // Flags & Toggles
    enableCountdown: true,
    isHomeScreen: true,
    showRSVPButton: true,
    isSubmitted: false,
    enableRSVPNotification: false,
    enableEventNotification: false,
    enablePlannerUpdates: false,
};
