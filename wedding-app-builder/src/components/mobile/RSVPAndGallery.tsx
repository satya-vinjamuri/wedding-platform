// components/steps/RSVPAndGallery.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RSVPAndGallery({ form, handleChange, goNext, goBack }: any) {
    const isSubmitted = form.isSubmitted;
    return (
        <div className="max-w-xxl space-y-4">
            <h2 className="text-2xl font-semibold text-pink-400">Gallery</h2>
            {form.enableGallery && (
                <div>
                    <div className="flex items-center gap-2">
                        <Label className="text-black font-bold pb-6 pt-6 text-lg">Gallery Google Drive Folder Link</Label>
                        <div className="relative group cursor-pointer">
                            <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                            <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                Paste the shared link to your Drive folder. Set it to “Anyone with the link can view” so guests can see your wedding gallery.
                            </div>
                        </div>
                    </div>

                    <Input
                        value={form.galleryDriveUrl}
                        onChange={(e) => handleChange("galleryDriveUrl", e.target.value)}
                        className="w-full bg-beige text-black border border-pink-300 px-4 py-2"
                        disabled={isSubmitted || form?.zipGenerated}
                    />
                </div>
            )}
            <div className="flex justify-start gap-4 pt-4">
                <Button variant="outline" className="font-bold" onClick={goBack}>Back</Button>
                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>Next</Button>
            </div>
        </div>
    );
}
