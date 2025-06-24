import { FormState } from "@/types/FormState";

export type ScreenToggle = { label: string; field: keyof FormState };

export const requiredScreens: ScreenToggle[] = [
    { label: "RSVP", field: "enableRSVP" },
    { label: "Save The Date", field: "enableSaveDate" },
    { label: "Wedding Itinerary", field: "enableItinerary" },
    { label: "Settings (FAQs)", field: "enableSettings" },
];

export const screenToggles: ScreenToggle[] = [
    { label: "Our Story", field: "enableStory" },
    //{ label: "Gallery", field: "enableGallery" },
    { label: "Wedding Party", field: "enableWeddingParty" },
    { label: "Wedding Registry", field: "enableRegistry" },
    { label: "Travel", field: "enableTravel" },
];

export type SidebarItem = {
    label: string;
    key: string;
    condition?: boolean;
};

export const getSidebarItems = (form: FormState): SidebarItem[] => [
    { label: "Getting Started", key: "appInfo" },
    { label: "App Home Page", key: "saveDate", condition: form.enableSaveDate },
    { label: "Wedding Party", key: "weddingParty", condition: form.enableWeddingParty },
    { label: "Registry", key: "registry", condition: form.enableRegistry },
    { label: "Travel", key: "travel", condition: form.enableTravel },
    { label: "Settings", key: "settings", condition: form.enableSettings },
    { label: "App Themes", key: "themes" },
    { label: "Preview", key: "preview" },
].filter(item => item.condition !== false);
