"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormState } from "@/types/FormState";
import OurStory from "./OurStory";
import Gallery from "@/components/mobile/Gallery";

interface SaveTheDateProps {
    goNext: () => void;
    goBack: () => void;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    handleChange: (field: keyof FormState, value: any) => void;
}

const CustomSwitch = ({
    checked,
    onToggle,
    disabled = false,
}: {
    checked: boolean;
    onToggle: () => void;
    disabled: boolean;
}) => (
    <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${checked ? "bg-pink-500" : "bg-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
        }
    >
        <span
            className={`inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"
                }`}
        />
    </button>
);

const SaveTheDate: React.FC<SaveTheDateProps> = ({
    goNext,
    goBack,
    form,
    setForm,
    handleChange,
}) => {
    const isSubmitted = form.isSubmitted;
    const handleToggle = (field: keyof SaveTheDateProps["form"]) => {
        setForm((prev: { [x: string]: any }) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleImageChange = (file: File | null) => {
        setForm((prev: any) => ({ ...prev, saveTheDateImage: file }));
    };

    const screenToggles: { label: string; field: keyof typeof form; tooltip: string; }[] = [
        { label: "Enable Countdown", field: "enableCountdown", tooltip: "This will enable a countdown widget to appear on home screen of app  " },
    ];

    return (
        <div className="max-w-6xl space-y-8 text-[#E4D7DE]">
            <h2 className="text-2xl font-semibold text-pink-400">Home Page</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Save the Date Upload */}
                    <div>
                        <h2 className="text-2xl font-semibold text-black">Save the Date</h2>
                        <Label className="text-black pb-6 pt-6 font-bold text-lg">Upload an Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                            className="bg-beige text-black border border-pink-300 w-full"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        {(form.saveTheDateImage || form.saveTheDateImageUrl) && (
                            <div className="mt-4">
                                <p className="text-black font-medium">Current Image:</p>
                                <img
                                    src={
                                        form.saveTheDateImage
                                            ? URL.createObjectURL(form.saveTheDateImage)
                                            : form.saveTheDateImageUrl
                                    }
                                    alt="Save the Date"
                                    className="w-48 h-auto rounded border mt-2"
                                />
                            </div>
                        )}

                        {/* {form.saveTheDateImage && (
                            <div className="mt-4">
                                <p className="text-black font-medium">Current Image:</p>
                                <img
                                    src={URL.createObjectURL(form.saveTheDateImage)}
                                    alt="Selected"
                                    className="w-48 h-auto rounded border mt-2"
                                />
                            </div>
                        )} */}
                    </div>

                    {/* Enable Countdown Button */}
                    <div>
                        <Label className="text-black font-semibold text-lg">Optional Home Screen Feature</Label>
                        <div className="flex flex-wrap gap-4 pt-6">
                            {screenToggles.map(({ label, field, tooltip }) => (
                                <div key={field} className="relative group">
                                    <Button
                                        className={`px-4 py-2 rounded-full border text-sm font-bold transition ${form[field]
                                            ? "bg-pink-400 text-white border-white"
                                            : "bg-transparent text-black border-[#6B5A7A] hover:border-white"
                                            }`}
                                        onClick={() => handleToggle(field)}
                                        disabled={isSubmitted || form?.zipGenerated}
                                    >
                                        {label}
                                    </Button>
                                    <div className="absolute z-10 hidden group-hover:block w-32 p-2 bg-gray-500 text-white text-xs rounded shadow-lg top-full left-1/2 -translate-x-1/2 mt-1 text-center">
                                        {tooltip}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8 py-8">
                    {/* RSVP Google Sheet */}
                    {form.enableRSVP && (
                        <div>
                            <div className="flex items-center gap-2">
                                {/* ✅ 1. Updated Label */}
                                <Label className="text-black font-bold text-lg pb-6 pt-6 flex items-center gap-2">
                                    RSVP Link (Google Sheets Only)
                                    {/* ✅ 6. Google Sheets Icon */}
                                    <img
                                        src="https://www.gstatic.com/images/icons/material/system/1x/description_black_24dp.png"
                                        alt="Google Sheets"
                                        className="w-4 h-4"
                                    />
                                </Label>

                                {/* ✅ 4. Popover Help Tooltip */}
                                <div className="relative group cursor-pointer">
                                    <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                                    <div className="absolute z-10 hidden group-hover:block w-80 p-3 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                        Paste a link to your RSVP Google Sheet.<br />
                                        ✅ Must be a Google Sheet URL<br />
                                        ✅ Set sharing to "Anyone with the link can view"<br /><br />

                                        <strong>Event Code Key:</strong><br />
                                        E = Everything<br />
                                        W = Wedding Ceremony<br />
                                        R = Reception<br />
                                        S = Sangeet<br />
                                        M = Mehndi<br />
                                        BH = Bride's Haldi<br />
                                        GH = Groom's Haldi<br /><br />

                                        📄 Example: <em>WRSM</em> = Wedding, Reception, Sangeet, Mehndi<br /><br />

                                        <a
                                            href="/sample-rsvp-template.csv"
                                            download
                                            className="underline text-pink-300 hover:text-pink-100"
                                        >
                                            Download RSVP Template
                                        </a>
                                    </div>

                                </div>
                            </div>

                            {/* ✅ 2. Placeholder Guidance, ✅ 3. Validation-ready */}
                            <Input
                                placeholder="e.g. https://docs.google.com/spreadsheets/d/your-sheet-id"
                                value={form.rsvpSheetUrl}
                                onChange={(e) => handleChange("rsvpSheetUrl", e.target.value)}
                                className="bg-beige text-black border border-pink-300 px-4 py-2 w-full"
                                disabled={isSubmitted || form?.zipGenerated}
                            />

                            {/* Optional: Validation message if needed */}
                            {form.rsvpSheetUrl && !form.rsvpSheetUrl.includes("docs.google.com/spreadsheets") && (
                                <p className="text-sm text-red-600 mt-2">Please enter a valid Google Sheets URL.</p>
                            )}
                        </div>
                    )}

                    {/* Gallery Google Drive */}
                    {form.enableGallery && (
                        <Gallery form={form} setForm={setForm} />
                    )}
                </div>
            </div>

            {/* Our Story below both columns */}
            {
                form.enableStory && (
                    <div>
                        <OurStory form={form} setForm={setForm} />
                    </div>
                )
            }

            {/* Navigation Buttons */}
            <div className="flex justify-start gap-4 pt-6 pb-4">
                <Button variant="outline" onClick={goBack} className="text-black font-bold">Back</Button>
                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>Next</Button>
            </div>
        </div >

    );
};

export default SaveTheDate;