"use client";

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { notFound } from 'next/navigation';
import WeddingSiteTabs from '@/components/website/WeddingSiteTabs';
import { format, parseISO } from 'date-fns';
import { useParams } from 'next/navigation';

export default async function WeddingSitePage() {
    const params = useParams();
    const slug = params.slug; console.log("✅ Slug:", slug);

    const q = query(collection(db, 'weddingApps'), where('websiteSlug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("❌ No wedding site found for slug:", slug);
        return notFound();
    }

    const data = snapshot.docs[0].data();
    const plainData = JSON.parse(JSON.stringify(data));
    const formattedDate = format(parseISO(data.weddingDate), "EEEE, MMMM d, yyyy");

    return (
        <div
            className="min-h-screen text-gray-800 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/backgrounds/floral-bg-1.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/75 z-0" />
            <div className="relative z-10 px-6 pb-12">
                <div className="text-center py-10">
                    <h1 className="text-5xl font-extrabold tracking-tight text-[#3B3B3B] drop-shadow">
                        {plainData.brideName} <span className="text-pink-600">&</span> {plainData.groomName}
                    </h1>
                    <p className="text-lg font-medium text-gray-700 mt-2">
                        {formattedDate} <span className="mx-2">·</span> {plainData.weddingLocation}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mt-[-30px]">
                    <WeddingSiteTabs data={plainData} />
                </div>
            </div>
        </div>
    );
}
