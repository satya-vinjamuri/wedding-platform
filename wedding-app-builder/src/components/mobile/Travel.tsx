"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormState } from "@/types/FormState";
import { X } from "lucide-react";

interface TravelProps {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    goNext: () => void;
    goBack: () => void;
}

const Travel: React.FC<TravelProps> = ({ form, setForm, goNext, goBack }) => {
    const isSubmitted = form.isSubmitted;
    const [hotels, setHotels] = useState<string[]>(form.hotelDetails || [""]);
    const [venues, setVenues] = useState<string[]>(form.venueDetails || [""]);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            hotelDetails: hotels,
            venueDetails: venues,
        }));
    }, [hotels, venues, setForm]);

    const handleAddHotel = () => setHotels([...hotels, ""]);
    const handleAddVenue = () => setVenues([...venues, ""]);

    const handleHotelChange = (index: number, value: string) => {
        const updated = [...hotels];
        updated[index] = value;
        setHotels(updated);
    };

    const handleVenueChange = (index: number, value: string) => {
        const updated = [...venues];
        updated[index] = value;
        setVenues(updated);
    };

    const handleRemoveHotel = (index: number) => {
        const updated = [...hotels];
        updated.splice(index, 1);
        setHotels(updated);
    };

    const handleRemoveVenue = (index: number) => {
        const updated = [...venues];
        updated.splice(index, 1);
        setVenues(updated);
    };

    return (
        <div className="max-w-2xl space-y-8 text-cocoa">
            <h2 className="text-2xl font-semibold text-pink-400">Travel & Accommodations</h2>

            <div className="space-y-4">
                <h3 className="text-lg text-mauve font-bold">Venue Details</h3>
                {venues.map((venue, idx) => (
                    <div key={idx} className="relative">
                        <Textarea
                            value={venue}
                            onChange={(e) => handleVenueChange(idx, e.target.value)}
                            placeholder={`Venue ${idx + 1}`}
                            className="w-full bg-petal text-cocoa border border-pink-300 pr-10"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        {!isSubmitted && (
                            <button
                                onClick={() => handleRemoveVenue(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                aria-label="Remove venue"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
                <Button onClick={handleAddVenue} className="bg-pink-400 text-white font-bold" disabled={isSubmitted || form?.zipGenerated}>
                    + Add Venue
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg text-mauve font-bold">Hotel Block Info</h3>
                {hotels.map((hotel, idx) => (
                    <div key={idx} className="relative">
                        <Textarea
                            value={hotel}
                            onChange={(e) => handleHotelChange(idx, e.target.value)}
                            placeholder={`Hotel ${idx + 1}`}
                            className="w-full bg-petal text-cocoa border border-pink-300 pr-10"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        {!isSubmitted && (
                            <button
                                onClick={() => handleRemoveHotel(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                aria-label="Remove hotel"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
                <Button onClick={handleAddHotel} className="bg-pink-400 text-white font-bold" disabled={isSubmitted || form?.zipGenerated}>
                    + Add Hotel
                </Button>
            </div >

            <div className="flex justify-start gap-4 pt-12">
                <Button variant="outline" onClick={goBack} className="font-bold">
                    Back
                </Button>
                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>
                    Next
                </Button>
            </div>
        </div >
    );
};

export default Travel;
