"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    Home as HomeIcon,
    Image,
    Settings,
    Users,
    PartyPopper,
} from "lucide-react";

const steps = [
    "App Info",
    "RSVP & Gallery",
    "Our Family",
    "Itinerary",
    "Settings",
    "Wedding Party",
    "Preview",
];

export default function Home() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        coupleName: "",
        weddingDate: "",
        weddingLocation: "",
        enableRSVP: true,
        rsvpSheetUrl: "",
        enableGallery: true,
        galleryDriveUrl: "",
        enableFamily: true,
        familyDetails: { bride: [], groom: [], pets: [] },
        enableItinerary: true,
        itineraryWedding: "",
        itineraryBride: "",
        itineraryGroom: "",
        enableSettings: true,
        faqs: "",
        contactInfo: "",
        enableWeddingParty: true,
        weddingParty: "",
    });

    const goNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
    const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

    const handleChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const addFamilyMember = (side: "bride" | "groom", name = "", relation = "") => {
        setForm((prev) => {
            const updated = [...prev.familyDetails[side], { name, relation, image: null }];
            return {
                ...prev,
                familyDetails: { ...prev.familyDetails, [side]: updated },
            };
        });
    };

    const removeFamilyMember = (side: "bride" | "groom", index: number) => {
        setForm((prev) => {
            const updated = [...prev.familyDetails[side]];
            updated.splice(index, 1);
            return {
                ...prev,
                familyDetails: { ...prev.familyDetails, [side]: updated },
            };
        });
    };

    const updateFamilyMember = (
        side: "bride" | "groom",
        index: number,
        field: string,
        value: any
    ) => {
        setForm((prev) => {
            const updated = [...prev.familyDetails[side]];
            updated[index] = { ...updated[index], [field]: value };
            return {
                ...prev,
                familyDetails: { ...prev.familyDetails, [side]: updated },
            };
        });
    };
    return (
        <main className="min-h-screen bg-zinc-100 text-black flex">
            <aside className="w-60 bg-white border-r p-4 space-y-3">
                <h1 className="text-xl font-bold mb-4">Wedding App Builder</h1>
                {steps.map((label, idx) => (
                    <Button
                        key={label}
                        variant={step === idx ? "default" : "ghost"}
                        onClick={() => setStep(idx)}
                        className="w-full justify-start"
                    >
                        {label}
                    </Button>
                ))}
            </aside>

            <section className="flex-1 p-10 space-y-6">
                {step === 0 && (
                    <div className="max-w-xl space-y-6">
                        <h2 className="text-2xl font-semibold">Basic App Info</h2>
                        <div>
                            <Label>Couple Name</Label>
                            <Input
                                value={form.coupleName}
                                onChange={(e) => handleChange("coupleName", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Wedding Date</Label>
                            <Input
                                type="date"
                                value={form.weddingDate}
                                onChange={(e) => handleChange("weddingDate", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Wedding Location</Label>
                            <Input
                                value={form.weddingLocation}
                                onChange={(e) => handleChange("weddingLocation", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Enable RSVP</Label>
                                <Switch
                                    checked={form.enableRSVP}
                                    onCheckedChange={(val) => handleChange("enableRSVP", val)}
                                />
                            </div>
                            <div>
                                <Label>Enable Gallery</Label>
                                <Switch
                                    checked={form.enableGallery}
                                    onCheckedChange={(val) => handleChange("enableGallery", val)}
                                />
                            </div>
                            <div>
                                <Label>Our Family Section</Label>
                                <Switch
                                    checked={form.enableFamily}
                                    onCheckedChange={(val) => handleChange("enableFamily", val)}
                                />
                            </div>
                            <div>
                                <Label>Wedding Itinerary</Label>
                                <Switch
                                    checked={form.enableItinerary}
                                    onCheckedChange={(val) => handleChange("enableItinerary", val)}
                                />
                            </div>
                            <div>
                                <Label>Settings (FAQs)</Label>
                                <Switch
                                    checked={form.enableSettings}
                                    onCheckedChange={(val) => handleChange("enableSettings", val)}
                                />
                            </div>
                            <div>
                                <Label>Wedding Party</Label>
                                <Switch
                                    checked={form.enableWeddingParty}
                                    onCheckedChange={(val) => handleChange("enableWeddingParty", val)}
                                />
                            </div>
                        </div>
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-2xl font-semibold">RSVP & Gallery</h2>
                        {form.enableRSVP && (
                            <div>
                                <Label>RSVP Google Sheet Link</Label>
                                <Input
                                    value={form.rsvpSheetUrl}
                                    onChange={(e) => handleChange("rsvpSheetUrl", e.target.value)}
                                />
                            </div>
                        )}
                        {form.enableGallery && (
                            <div>
                                <Label>Gallery Google Drive Folder Link</Label>
                                <Input
                                    value={form.galleryDriveUrl}
                                    onChange={(e) => handleChange("galleryDriveUrl", e.target.value)}
                                />
                            </div>
                        )}
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}


                {step === 2 && form.enableFamily && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Our Family Section</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {(["bride", "groom"] as const).map((side) => (
                                <div key={side} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold">{side === "bride" ? "Bride's Side" : "Groom's Side"}</h3>
                                        <Button size="sm" onClick={() => addFamilyMember(side)}>+ Add</Button>
                                    </div>
                                    {form.familyDetails[side].map((member, index) => (
                                        <div key={index} className="relative border rounded p-3">
                                            <Input
                                                placeholder="Name"
                                                value={member.name}
                                                onChange={(e) => updateFamilyMember(side, index, "name", e.target.value)}
                                                className="mb-2"
                                            />
                                            <Input
                                                placeholder="Relation"
                                                value={member.relation}
                                                onChange={(e) => updateFamilyMember(side, index, "relation", e.target.value)}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => updateFamilyMember(side, index, "image", e.target.files?.[0] || null)}
                                            />
                                            <button
                                                onClick={() => removeFamilyMember(side, index)}
                                                className="absolute top-2 right-2 text-xs text-red-500"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Pets</h3>
                            <Input placeholder="e.g. Max - Dog" />
                        </div>
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}

                {step === 3 && form.enableItinerary && (
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-2xl font-semibold">Wedding Itinerary</h2>
                        <Label>Wedding Events</Label>
                        <Input
                            placeholder="Main wedding schedule..."
                            value={form.itineraryWedding}
                            onChange={(e) => handleChange("itineraryWedding", e.target.value)}
                        />
                        <Label>Bride Events (Optional)</Label>
                        <Input
                            placeholder="Bride's events..."
                            value={form.itineraryBride}
                            onChange={(e) => handleChange("itineraryBride", e.target.value)}
                        />
                        <Label>Groom Events (Optional)</Label>
                        <Input
                            placeholder="Groom's events..."
                            value={form.itineraryGroom}
                            onChange={(e) => handleChange("itineraryGroom", e.target.value)}
                        />
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}

                {step === 4 && form.enableSettings && (
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-2xl font-semibold">Settings</h2>
                        <Label>FAQs</Label>
                        <Input
                            placeholder="e.g. Is there a dress code?"
                            value={form.faqs}
                            onChange={(e) => handleChange("faqs", e.target.value)}
                        />
                        <Label>Contact Information</Label>
                        <Input
                            placeholder="e.g. wedding planner email or phone..."
                            value={form.contactInfo}
                            onChange={(e) => handleChange("contactInfo", e.target.value)}
                        />
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}

                {step === 5 && form.enableWeddingParty && (
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-2xl font-semibold">Wedding Party</h2>
                        <Label>Wedding Party Details</Label>
                        <Input
                            placeholder="List names and roles..."
                            value={form.weddingParty}
                            onChange={(e) => handleChange("weddingParty", e.target.value)}
                        />
                        <Button onClick={goNext}>Next</Button>
                    </div>
                )}

                {step === 6 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Preview</h2>
                        <div className="bg-white shadow-xl rounded-xl p-6 w-[300px] h-[600px] space-y-2">
                            <div className="text-center space-y-2">
                                <p className="text-xl font-serif font-bold">{form.coupleName}</p>
                                <p className="text-sm text-gray-700">{form.weddingDate}</p>
                                <p className="text-sm text-gray-700">{form.weddingLocation}</p>
                                {form.enableRSVP && <p className="text-xs text-green-700">📋 RSVP Enabled</p>}
                                {form.enableGallery && <p className="text-xs text-blue-700">🖼️ Gallery Enabled</p>}
                                {form.enableFamily && <p className="text-xs text-purple-700">👪 Family Section</p>}
                                {form.enableItinerary && <p className="text-xs text-orange-700">📅 Itinerary Included</p>}
                                {form.enableSettings && <p className="text-xs text-gray-700">⚙️ Settings/FAQs</p>}
                                {form.enableWeddingParty && <p className="text-xs text-pink-700">🎉 Wedding Party</p>}
                            </div>
                            <div className="bg-neutral-100 mt-4 p-2 rounded-lg flex justify-around text-gray-600 text-xs">
                                <div className="flex flex-col items-center">
                                    <HomeIcon size={18} />
                                    <span>Home</span>
                                </div>
                                {form.enableGallery && (
                                    <div className="flex flex-col items-center">
                                        <Image size={18} />
                                        <span>Gallery</span>
                                    </div>
                                )}
                                {form.enableFamily && (
                                    <div className="flex flex-col items-center">
                                        <Users size={18} />
                                        <span>Family</span>
                                    </div>
                                )}
                                {form.enableItinerary && (
                                    <div className="flex flex-col items-center">
                                        <CalendarDays size={18} />
                                        <span>Itinerary</span>
                                    </div>
                                )}
                                {form.enableSettings && (
                                    <div className="flex flex-col items-center">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </div>
                                )}
                            </div>
                            <Button className="w-full mt-4">Generate App</Button>
                        </div>
                    </div>
                )}

                {step > 0 && <Button variant="outline" onClick={goBack}>Back</Button>}
            </section>
        </main>
    );
}
