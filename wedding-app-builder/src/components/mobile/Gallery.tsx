// components/steps/RSVPAndGallery.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Gallery({ form, handleChange }: any) {
    const isSubmitted = form.isSubmitted;
    return (
        <div className="max-w-xxl">
            {form.enableGallery && (
                <div>
                    <div className="flex items-center gap-2">
                        <Label className="text-black font-bold text-lg">Gallery Google Drive Folder Link</Label>
                        <div className="relative group cursor-pointer">
                            <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                            <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                Paste the shared link to your Drive folder. Set it to “Anyone with the link can view” so guests can see your wedding gallery.
                            </div>
                        </div>
                    </div>
                    <div className="py-4" />
                    <Input
                        value={form.galleryDriveUrl}
                        onChange={(e) => handleChange("galleryDriveUrl", e.target.value)}
                        className="bg-beige text-black border border-pink-300 px-4 py-2"
                        style={{ width: "550px" }}
                        disabled={isSubmitted || form?.zipGenerated}
                    />
                </div>
            )}
        </div>
    );
}
