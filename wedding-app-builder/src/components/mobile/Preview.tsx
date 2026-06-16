// Preview.tsx (Cleaned Up)
"use client";

import React, { useState, useEffect } from "react";
import { FormState } from "@/types/FormState";
import { WorkStatus } from "@/types/WorkStatus";
import { Button } from "@/components/ui/button";
import {
    Home, BookOpen, Users2, CalendarDays, Settings, CalendarIcon, ChevronDown, ChevronUp
} from "lucide-react";
import {
    collection, query, orderBy, limit, getFirestore, doc, setDoc, getDoc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import Countdown from "@/components/utilities/Countdown";
import { saveFormToFirestore } from "@/lib/saveFormToFirestore";
import AppPreviewRenderer from "@/components/utilities/AppPreviewRenderer";
import { validateRequiredFields } from "@/components/utilities/FormValidation";
import { generateSlug } from "@/lib/generateSlug";

const db = getFirestore();

type Props = {
    form: FormState;
    goBack: () => void;
    isSubmitted: boolean;
    navigateToSection: (sectionId: string) => void; // 🆕

};

export default function Preview({ form, goBack, navigateToSection, isSubmitted }: Props) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("home");
    //const [isSubmitted, setIsSubmitted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        const checkSubmissionStatus = async () => {
            if (!user) return;
            const docRef = doc(db, "weddingApps", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().zipGenerated) isSubmitted = true;
        };
        checkSubmissionStatus();
    }, [user]);

    const handleGenerateApp = async () => {
        if (!user) return false;

        const errors = validateRequiredFields(form, setErrorMessages);
        if (errors.length > 0) {
            setShowErrorModal(true);
            return false;
        }

        try {
            await saveFormToFirestore(user, form);
            isSubmitted = true;

            const webSlug = generateSlug(form.brideName, form.groomName, form.weddingDate);

            await setDoc(doc(db, "weddingApps", user.uid), {
                isSubmitted: true,
                zipGenerated: false, // TODO: remove zip-related fields later
                websiteSlug: webSlug,
                formCompleted: true,
                feedbackReceived: false,
                published: false,
                generatedAt: serverTimestamp(),
            }, { merge: true });

            const latestSnap = await getDocs(query(
                collection(db, "workRequests"),
                orderBy("__name__", "desc"),
                limit(1)
            ));
            const newId = latestSnap.empty ? 1 : parseInt(latestSnap.docs[0].id) + 1;

            await setDoc(doc(db, "workRequests", newId.toString()), {
                assignee: "Satya Vinjamuri",
                userId: user.uid,
                coupleName: `${form.brideName}&${form.groomName}`,
                zipFileUrl: "", // TODO: remove zip-related fields later
                authStatus: WorkStatus.Submitted,
                feedback: "",
                dateCreated: serverTimestamp(),
                dateCompleted: null,
            });

            await fetch('/api/send-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'App Submission Request' })
            });
            isSubmitted = true;
            return true;
        } catch (error) {
            console.error("Error submitting app:", error);
            return false;
        }
    };


    const tabs = [
        { id: "home", label: "Home", icon: <Home size={18} /> },
        ...(form.enableStory ? [{ id: "story", label: "Our Story", icon: <BookOpen size={18} /> }] : []),
        ...(form.enableWeddingParty ? [{ id: "party", label: "Wedding Party", icon: <Users2 size={18} /> }] : []),
        ...(form.enableItinerary ? [{ id: "itinerary", label: "Itinerary", icon: <CalendarDays size={18} /> }] : []),
        ...(form.enableSettings ? [{ id: "settings", label: "Settings", icon: <Settings size={18} /> }] : []),
    ];

    return (
        <div>

            {isSubmitted ? (
                <div className="mt-4 pb-6">
                    <h2 className="text-2xl font-semibold text-pink-400">Thank you for your submission!</h2>
                    <p className="mt-4 text-sm text-black font-bold italic bg-petal py-2 max-w-2xl">
                        We will review your app and get back to you within 24 hours! Please be patient, you will be able to make more changes to your app after we review it!
                    </p>
                </div>
            ) : (

                <div className="pb-6">
                    <h2 className="text-2xl font-semibold text-pink-400">Preview of your Mobile View</h2>
                    <p className="mt-4 text-sm text-red-500 font-bold italic bg-petal px-4 py-2 rounded-md border max-w-2xl">
                        Please remember this is just a preview and not what your app will actually look like!
                    </p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-12">
                <div className="relative shadow-2xl rounded-[40px] w-[300px] h-[600px] overflow-hidden scrollbar-hide border-[6px] border-gray-200 text-black" style={{ backgroundColor: form.selectedColor }}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-300 rounded-b-xl z-10" />
                    <div className="p-6 pt-8 overflow-y-scroll scrollbar-hide pb-20 max-h-[600px]">
                        <AppPreviewRenderer form={form} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-neutral-100 p-2 rounded-b-[40px] flex justify-around text-xs border-t">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center w-[60px] text-center ${activeTab === tab.id ? "text-blue-600 font-semibold" : "text-gray-600"}`}
                            >
                                {tab.icon}
                                <span className="text-[11px] leading-tight truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pb-12">

                    {!isSubmitted && (
                        <div>
                            <h2 className="text-2xl font-semibold text-black">{form.appName}</h2>
                            <Button className="w-[200px] bg-pink-400 text-white font-bold" onClick={() => setShowConfirmModal(true)} disabled={isSubmitted || form?.zipGenerated}>
                                Publish Site & Mobile
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" className="w-[200px] font-bold" onClick={goBack}>
                        Back
                    </Button>
                </div>


            </div>

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="bg-[#f5f5dc] text-black">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>You won't be able to make changes after this step.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                setShowConfirmModal(false);
                                const success = await handleGenerateApp();
                                if (success) setShowSuccessModal(true);
                            }}
                        >
                            Yes, Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="bg-[#f5f5dc] text-black">
                    <DialogHeader>
                        <DialogTitle>Thank you!</DialogTitle>
                        <DialogDescription>
                            You will receive an email with instructions in the next 24 hours on how you can download your personal wedding mobile app.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent className="bg-[#f5f5dc] text-black">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 font-bold">Submission Error</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-black px-1 pb-2">
                        These fields are required and must be filled before submission:
                        <ul className="list-disc mt-2 ml-6 space-y-1">
                            {errorMessages.map((msg, index) => (
                                <li
                                    key={index}
                                    className="text-blue-700 underline cursor-pointer hover:text-blue-900 transition"
                                    onClick={() => {
                                        setShowErrorModal(false);
                                        if (msg.toLowerCase().includes("save the date")) {
                                            navigateToSection("saveDate");
                                        } else if (msg.toLowerCase().includes("story")) {
                                            navigateToSection("saveDate");
                                        } else if (msg.toLowerCase().includes("hotel") || msg.toLowerCase().includes("venue")) {
                                            navigateToSection("travel");
                                        } else if (msg.toLowerCase().includes("settings")) {
                                            navigateToSection("settings");
                                        } else if (msg.toLowerCase().includes("registry")) {
                                            navigateToSection("registry");
                                        }
                                    }}
                                >
                                    {msg}
                                </li>
                            ))}
                        </ul>


                        {/* <ul className="list-disc mt-2 ml-6">
                            {errorMessages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul> */}
                        <p className="text-red-500 font-bold font-italic">Please fill out the complete form to get the best experience!</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowErrorModal(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
