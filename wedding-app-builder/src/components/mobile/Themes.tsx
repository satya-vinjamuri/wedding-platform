"use client";

import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { FormState } from "@/types/FormState";
import { Button } from "@/components/ui/button";

type Props = {
    form: FormState;
    goNext: () => void;
    goBack: () => void;
    handleChange: (field: keyof FormState, value: any) => void;
};


const fontOptions = ["Serif", "Sans", "Script"] as const;
const colorOptions = ["#A17956", "#EECAC4", "#B0848B", "#826056", "#3C314D"];
const fontColorOptions = [
    "#D72638", "#F46036", "#FFD23F", "#1B998B",
    "#2E294E", "#5F0F40", "#A4036F", "#048BA8",
];

const presetThemes = [
    { name: "Warm Sunset", bg: "#A17956", font: "#FFD23F" },
    { name: "Blush & Plum", bg: "#EECAC4", font: "#5F0F40" },
    { name: "Midnight Gold", bg: "#3C314D", font: "#FFD23F" },
];

function getLuminance(hex: string): number {
    const rgb = hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16) / 255);
    const [r, g, b] = rgb.map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

const Themes: React.FC<Props> = ({ form, goNext, goBack, handleChange }) => {
    const selectedFont = form.selectedFont || "Script";
    const selectedColor = form.selectedColor || colorOptions[0];
    const selectedFontColor = form.selectedFontColor || fontColorOptions[0];

    const generateAIImage = async (prompt: string): Promise<string> => {
        await new Promise((res) => setTimeout(res, 1000));
        return "https://source.unsplash.com/800x600/?floral,wedding";
    };

    const contrast = getContrast(selectedColor, selectedFontColor);

    return (
        <div>
            <h2 className="text-2xl font-semibold text-pink-400">Customize my App!</h2>
            <p className="mt-4 text-sm text-red-600 font-bold italic bg-petal px-4 py-2 rounded-md border max-w-xl">
                Please remember this is just a preview and not what your app will actually look like!
            </p>

            <h3 className="text-2xl font-semibold text-pink-500 pt-6" style={{ fontSize: 14 }}>
                Pick and choose your color scheme and aesthetics!
            </h3>

            <div className="flex flex-col lg:flex-row py-2 gap-4">
                {/* Left Column */}
                <div className="flex-1 max-w-2xl bg-petal p-6 rounded-xl space-y-6">
                    {/* Background Image Selection */}
                    {/* <div>
                        <p className="mb-2 text-black font-medium text-lg">App Background</p>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block mb-1 text-black font-medium">Upload Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        // handleChange("backgroundImage", file as unknown as string | boolean);
                                    }}
                                    className="text-black bg-white border font-seif rounded-md p-2"
                                    disabled={form.isSubmitted}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-black font-medium">Or use AI to generate</label>
                                <Button
                                    onClick={async () => {
                                        const prompt = "Floral wedding background in soft pastels";
                                        const generatedImageUrl = await generateAIImage(prompt);
                                        // handleChange("backgroundImage", generatedImageUrl);
                                    }}
                                    className="bg-white text-black px-4 py-2 rounded-md hover:brightness-110"
                                    disabled={form.isSubmitted}
                                >
                                    Generate AI Background
                                </Button>
                            </div>

                            {form.backgroundImage && (
                                <div className="mt-4">
                                    <p className="text-black font-medium">Selected Background:</p>
                                    <img
                                        src={
                                            typeof form.backgroundImage === "string"
                                                ? form.backgroundImage
                                                : URL.createObjectURL(form.backgroundImage)
                                        }
                                        alt="Selected Background"
                                        className="w-full h-auto max-h-64 mt-2 rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div> */}
                    {/* Font Selector */}
                    <div>
                        <p className="mb-2 font-medium text-black text-lg">Font Style & Color</p>
                        <div className="flex gap-4 flex-wrap">
                            {fontOptions.map((font) => (
                                <Button
                                    key={font}
                                    className={classNames(
                                        "px-4 py-2 rounded-md border font-medium transition",
                                        selectedFont === font
                                            ? "border-mauve bg-white text-cocoa"
                                            : "border-gray-300 hover:border-mauve"
                                    )}
                                    onClick={() => handleChange("selectedFont", font)}
                                    disabled={form.isSubmitted}
                                >
                                    <span className={font === "Script" ? "italic" : ""}>{font}</span>
                                </Button>
                            ))}
                        </div>
                        <div className="flex gap-4 flex-wrap pt-4">
                            {fontColorOptions.map((color) => (
                                <Button
                                    key={color}
                                    className={classNames(
                                        "w-8 h-8 rounded-full border-2 transition-all",
                                        form.selectedFontColor === color
                                            ? "border-white shadow-lg"
                                            : "border-gray-300 hover:border-mauve"
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleChange("selectedFontColor", color)}
                                    disabled={form.isSubmitted}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Background Color Picker */}
                    <div>
                        <p className="mb-2 font-medium text-black text-lg">Background Color</p>
                        <div className="flex gap-4">
                            {colorOptions.map((color) => (
                                <Button
                                    key={color}
                                    className={classNames(
                                        "w-8 h-8 rounded-full border-2 transition-all",
                                        selectedColor === color
                                            ? "border-white shadow-lg"
                                            : "border-gray-300 hover:border-mauve"
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleChange("selectedColor", color)}
                                    disabled={form.isSubmitted}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Preset Themes */}
                    <div>
                        <p className="mb-2 font-medium text-black text-lg">Choose a preset theme</p>
                        <div className="flex flex-wrap gap-4">
                            {presetThemes.map(({ name, bg, font }) => (
                                <Button
                                    key={name}
                                    className="p-2 border rounded-md hover:brightness-110 transition-all"
                                    style={{ backgroundColor: bg, color: font }}
                                    onClick={() => {
                                        handleChange("selectedColor", bg);
                                        handleChange("selectedFontColor", font);
                                    }}
                                    disabled={form.isSubmitted}
                                >
                                    {name}
                                </Button>
                            ))}
                        </div>
                        <div className="flex justify-start gap-4 pt-20">
                            <Button
                                onClick={goBack}
                                className="border border-mauve text-cocoa font-bold px-4 py-2 rounded-md hover:text-black transition"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={goNext}
                                className="bg-pink-400 text-white font-bold px-4 py-2 rounded-md hover:brightness-110 transition"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column – Preview */}
                <div className="flex flex-col items-center justify-start">
                    {/* Contrast Warning */}
                    {contrast < 4.5 && (
                        <div className="text-red-500 font-bold text-sm text-center pt-4 max-w-xs">
                            ⚠️ This font color may be hard to read on the selected background.
                        </div>
                    )}
                    <div
                        className="relative shadow-2xl rounded-[40px] w-[300px] h-[600px] overflow-hidden border-[6px] border-gray-200 text-black"
                        style={{ backgroundColor: selectedColor, color: selectedFontColor }}
                    >
                        <div className="p-6 pt-8 overflow-y-auto pb-20 h-full">
                            <div className="flex flex-col items-center text-center">
                                <p
                                    className={classNames(
                                        selectedFont === "Script"
                                            ? "italic font-medium"
                                            : selectedFont === "Sans"
                                                ? "font-sans"
                                                : "font-medium",
                                        "text-2xl py-20"
                                    )}
                                >
                                    {form.brideName} & {form.groomName}
                                </p>
                                <p className="text-xl ">
                                    Our special date: <br />
                                    {new Date(`${form.weddingDate}T00:00:00`).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                                <p className="text-xl">Location: {form.weddingLocation}</p>
                                {form.saveTheDateImage && (
                                    <div className="flex justify-center">
                                        <img
                                            src={URL.createObjectURL(form.saveTheDateImage)}
                                            alt="Save the Date Preview"
                                            className="w-32 h-32 object-cover rounded"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Themes;
