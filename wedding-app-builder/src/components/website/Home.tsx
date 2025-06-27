'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FormState, defaultFormState } from "@/types/FormState";
import Countdown from '../utilities/Countdown';

export default function Home({ form }: { form: FormState }) {
    console.log(form);

    return (
        <div className="max-w-2xl mx-auto p-8 font-sans text-gray-800 rounded-3xl transition-all duration-300">
            <div className="mt-5 text-center text-[45px]">
                <h2>Welcome to our wedding!</h2>
            </div>
            <div className="mt-4 flex justify-center">
                <img
                    src={
                        typeof form.saveTheDateImageUrl === "string"
                            ? form.saveTheDateImageUrl
                            : form.saveTheDateImageUrl
                                ? URL.createObjectURL(form.saveTheDateImageUrl)
                                : ""
                    }
                    alt="Save the Date"
                    className="w-48 h-auto rounded border mt-2"
                />
            </div>
            <div className="mt-4">


                <Countdown weddingDate={form.weddingDate} />
            </div>
        </div>
    );

}
