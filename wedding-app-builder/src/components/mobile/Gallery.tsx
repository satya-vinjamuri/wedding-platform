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
                        {/* ✅ 1. Clearer Label */}
                        <Label className="text-black font-bold text-lg flex items-center gap-2">
                            Gallery Folder (Google Drive Only)
                            {/* ✅ 6. Drive Icon */}
                            <img
                                src="https://www.gstatic.com/images/icons/material/system/1x/description_black_24dp.png"
                                alt="Google Drive"
                                className="w-4 h-4"
                            />
                        </Label>

                        {/* ✅ 4. Tooltip Help */}
                        <div className="relative group cursor-pointer">
                            <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                            <div className="absolute z-10 hidden group-hover:block w-72 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                Paste a shared Google Drive **folder** link for your photo gallery.<br />
                                ✅ Must be a Google Drive folder URL<br />
                                ✅ Set sharing to "Anyone with the link can view"<br /><br />
                                📄 Guests will be able to view uploaded photos in this folder.
                            </div>
                        </div>
                    </div>

                    <div className="py-4" />

                    {/* ✅ 2. Placeholder for clarity, ✅ 3. Ready for validation */}
                    <Input
                        placeholder="e.g. https://drive.google.com/drive/folders/your-folder-id"
                        value={form.galleryDriveUrl}
                        onChange={(e) => handleChange("galleryDriveUrl", e.target.value)}
                        className="bg-beige text-black border border-pink-300 px-4 py-2"
                        style={{ width: "550px" }}
                        disabled={isSubmitted || form?.zipGenerated}
                    />

                    {/* Optional inline validation */}
                    {form.galleryDriveUrl && !form.galleryDriveUrl.includes("drive.google.com/drive/folders") && (
                        <p className="text-sm text-red-600 mt-2">Please enter a valid Google Drive folder link.</p>
                    )}
                </div>
            )}

        </div>
    );
}
