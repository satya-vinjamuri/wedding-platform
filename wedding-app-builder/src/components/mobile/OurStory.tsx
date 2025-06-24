"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormState, StorySection } from "@/types/FormState";
import { X } from "lucide-react";

interface OurStoryProps {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

const storyTitleOptions = [
    "Our Story",
    "How It All Began",
    "The Journey So Far",
    "Our Timeline",
    "The Story of Us",
    "From Then to Now",
    "About Us",
    "Together Through Time",
    "Our Path",
    "Shared Moments",
];

const OurStory: React.FC<OurStoryProps> = ({ form, setForm }) => {
    const isSubmitted = form.isSubmitted || form?.zipGenerated;

    const handleAddSection = () => {
        setForm((prev) => ({
            ...prev,
            storySections: [
                ...(prev.storySections || []),
                {
                    title: "Our Story",
                    paragraph: "",
                    image: null,
                    imageUrl: "",
                },
            ],
        }));
    };

    const handleRemoveSection = (index: number) => {
        const updated = [...(form.storySections || [])];
        updated.splice(index, 1);
        setForm((prev) => ({
            ...prev,
            storySections: updated,
        }));
    };

    const handleSectionChange = (
        index: number,
        field: "title" | "paragraph",
        value: string
    ) => {
        const updated = [...(form.storySections || [])];
        updated[index][field] = value;
        setForm((prev) => ({ ...prev, storySections: updated }));
    };

    const handleImageChange = (index: number, file: File | null) => {
        const updated = [...(form.storySections || [])];
        updated[index].image = file;
        setForm((prev) => ({ ...prev, storySections: updated }));
    };

    return (
        <div className="max-w-6xl space-y-8 text-[#E4D7DE]">
            <h2 className="text-2xl font-semibold text-black">Our Story</h2>

            <Button
                onClick={handleAddSection}
                className="bg-pink-400 text-white font-bold"
                disabled={isSubmitted}
            >
                + Add Story Section
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(form.storySections || []).map((section, idx) => (
                    <div
                        key={idx}
                        className="p-4 border border-pink-200 rounded-lg relative bg-white text-black space-y-3"
                    >
                        {!isSubmitted && (
                            <Button
                                onClick={() => handleRemoveSection(idx)}
                                className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full"
                                style={{ padding: "2px", zIndex: 10 }}
                            >
                                <X size={16} />
                            </Button>
                        )}

                        <Label className="text-black font-semibold">Section Title</Label>
                        <select
                            value={section.title}
                            onChange={(e) =>
                                handleSectionChange(idx, "title", e.target.value)
                            }
                            disabled={isSubmitted}
                            className="bg-[#FFF5F7] border border-pink-300 rounded px-3 py-2 text-black w-full"
                        >
                            {storyTitleOptions.map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>

                        <Textarea
                            className="bg-beige text-black border border-pink-300"
                            style={{ width: "100%", height: "200px" }}
                            value={section.paragraph}
                            onChange={(e) =>
                                handleSectionChange(idx, "paragraph", e.target.value)
                            }
                            placeholder={`Paragraph ${idx + 1}`}
                            disabled={isSubmitted}
                        />

                        <div>
                            <Label className="text-bold pb-2">Optional Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    handleImageChange(idx, e.target.files?.[0] || null)
                                }
                                className="bg-beige text-black border border-pink-300"
                                disabled={isSubmitted}
                            />

                            {(section.image || section.imageUrl) && (
                                <div className="mt-4">
                                    <p className="text-black font-medium">Current Image:</p>
                                    <img
                                        src={
                                            section.image
                                                ? URL.createObjectURL(section.image)
                                                : section.imageUrl
                                        }
                                        alt={`Story Section ${idx + 1}`}
                                        className="w-48 h-auto rounded border mt-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OurStory;
