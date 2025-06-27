import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { notFound } from 'next/navigation';
import WeddingSiteTabs from '@/components/website/WeddingSiteTabs';
import { format, parseISO } from 'date-fns';

export default async function WeddingSitePage({ params }: { params: { slug: string } }) {
    const slug = params.slug; // Safe to use like this in app router now
    console.log("✅ Slug:", slug);
    const all = await getDocs(collection(db, 'weddingApps'));

    const q = query(
        collection(db, 'weddingApps'),
        where('websiteSlug', '==', slug)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("❌ No wedding site found for slug:", slug);
        return notFound();
    }

    const data = snapshot.docs[0].data();
    const plainData = JSON.parse(JSON.stringify(data)); // convert to plain object
    const formattedDate = format(parseISO(data.weddingDate), "EEEE, MMMM d, yyyy");
    return (
        <div className="min-h-screen bg-[#FFFDFB] text-gray-800 p-6 font-serif">
            <div className="text-center py-6 mb-12">
                <h1 className="text-5xl font-extrabold tracking-tight">
                    {plainData.brideName} <span className="text-pink-600">&</span> {plainData.groomName}
                </h1>
                <p className="text-lg font-medium text-gray-600">
                    {formattedDate} <span className="mx-2">·</span> {plainData.weddingLocation}
                </p>
            </div>

            <div className=" max-w-4xl mx-auto mt-[-50px]">
                <WeddingSiteTabs data={plainData} />
            </div>
        </div>
    );
}
