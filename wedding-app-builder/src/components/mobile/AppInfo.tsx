"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SaveTheDate from "@/components/mobile/SaveTheDate";
import WeddingParty from "@/components/mobile/WeddingParty";
import Travel from "@/components/mobile/Travel";
import Settings from "@/components/mobile/Settings";
import Preview from "@/components/mobile/Preview";
import Themes from "@/components/mobile/Themes";
import { FormState, defaultFormState } from "@/types/FormState";
import { useRouter } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { saveFormToFirestore } from "@/lib/saveFormToFirestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Registry from "./Registry";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CalendarPage from "@/components/utilities/Calendar";
import { requiredScreens, screenToggles, getSidebarItems } from "@/types/ScreenTypes";


export default function Home() {
    const [step, setStep] = useState(0);
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialIndex, setTutorialIndex] = useState(0);
    const tutorialImages = ["/tutorial/step1.png", "/tutorial/step2.png", "/tutorial/step3.png", "/tutorial/step4.png"];


    const [form, setForm] = useState<FormState>(defaultFormState);
    const sidebarItems = useMemo(() => getSidebarItems(form), [form]);


    useEffect(() => {
        const fetchSavedForm = async () => {
            if (!user) return;

            try {
                // 1. Fetch form data from weddingApps
                const appRef = doc(db, "weddingApps", user.uid);
                const appSnap = await getDoc(appRef);
                if (appSnap.exists()) {
                    const data = appSnap.data();
                    setForm(prev => ({ ...prev, ...data }));
                    if (data?.zipGenerated || data.isSubmitted) setIsSubmitted(true);
                }

                // 2. Fetch user metadata from users collection
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
                    const today = new Date();

                    if (
                        createdAt.getFullYear() === today.getFullYear() &&
                        createdAt.getMonth() === today.getMonth() &&
                        createdAt.getDate() === today.getDate() &&
                        !userData.watchedTutorial
                    ) {
                        setShowTutorial(true);
                    }
                }
            } catch (err) {
                console.error("Failed to load form or user data:", err);
            }
        };

        fetchSavedForm();
    }, [user]);


    useEffect(() => {
        const fetchSavedForm = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "weddingApps", user.uid);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setForm(prev => ({ ...prev, ...data }));
                    if (data?.zipGenerated || data.isSubmitted) setIsSubmitted(true);
                }
            } catch (err) {
                console.error("Failed to load form:", err);
            }
        };
        fetchSavedForm();
    }, [user]);




    // useEffect(() => {
    //     if (!user) return;

    //     const shouldSave = () => {
    //         // Check that at least some essential fields are filled
    //         return (
    //             form.brideName.trim() !== "" ||
    //             form.groomName.trim() !== "" ||
    //             form.weddingDate.trim() !== "" ||
    //             form.appName.trim() !== ""
    //         );
    //     };

    //     const interval = setInterval(() => {
    //         if (
    //             shouldSave() &&
    //             !form.isSubmitted
    //         ) {
    //             saveFormToFirestore(user, form).catch(console.error);
    //         }
    //     }, 5 * 60 * 1000);

    //     return () => clearInterval(interval);
    // }, [user, form]);


    const handleChange = (field: string, value: string | boolean) => {
        if (!isSubmitted) setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLogout = async () => {
        if (user) await saveFormToFirestore(user, form);
        router.push("/");
        await signOut(auth);
    };

    const goNext = () => setStep(prev => Math.min(prev + 1, sidebarItems.length - 1));
    const goBack = () => setStep(prev => Math.max(prev - 1, 0));

    const handleToggle = (field: keyof FormState) => {
        if (isSubmitted) return;
        setForm(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleNextTutorial = () => setTutorialIndex((prev) => Math.min(prev + 1, tutorialImages.length - 1));
    const handlePrevTutorial = () => setTutorialIndex((prev) => Math.max(prev - 1, 0));

    const tutorialWatched = async () => {
        setShowTutorial(false);
        if (!user) return;
        console.log(user);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                watchedTutorial: true,
            });
        } catch (error) {
            console.error("Failed to update tutorial status:", error);
        }
    };

    console.log(form);
    return (
        <main className="min-h-screen bg-[#FFF5F7] text-[#4B2E2E] flex flex-col lg:flex-row">
            <div className="pb-10">
                <Button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 fixed top-3 left-3 z-50 bg-pink-500 rounded-md text-black shadow-md"
                >
                    {sidebarOpen ? <X size={16} /> : <Menu size={20} />}
                </Button>
            </div>

            <aside
                className={`fixed z-40 lg:static top-0 left-0 w-64 h-screen min-h-screen transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    bg-[#fdf6f1] border-r border-gray-300 text-black shadow-lg lg:shadow-none`}
            >
                <div className="p-4 space-y-4 flex flex-col h-full pt-12 lg:pt-4">
                    <h1 className="text-xl font-bold text-pink-500">My WedDesigner</h1>

                    <div className="space-y-2">
                        {sidebarItems.map((item, idx) => (
                            <Button
                                key={item.key}
                                variant={step === idx ? "default" : "ghost"}
                                onClick={() => {
                                    setStep(idx);
                                    setSidebarOpen(false); // Close after selecting on mobile
                                }}
                                className={`w-full justify-start text-black text-sm ${step === idx
                                    ? "bg-purple-500 text-white font-semibold"
                                    : "font-semibold hover:text-pink-400"
                                    }`}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="text-black border border-gray-500 hover:bg-gray-100 text-sm font-bold"
                            onClick={() => {
                                setSidebarOpen(false);
                                router.push("/designer-settings");
                            }}
                        >
                            <User size={16} className="mr-2" /> Account
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="bg-pink-400 text-black px-4 py-2 font-bold text-sm"
                        >
                            Log Out
                        </Button>
                        <div className="py-6" />
                        <Button
                            variant="outline"
                            className="text-black border border-gray-500 hover:bg-gray-100 text-sm hover:font-bold"
                            onClick={() => {
                                setSidebarOpen(false);
                                router.push("/help-request");
                            }}
                        >
                            Need help?
                        </Button>
                        {/* <Button
                            variant="outline"
                            className="text-black border border-gray-500 hover:bg-gray-100 text-sm hover:font-bold"
                            onClick={() => {
                                setSidebarOpen(false);
                                router.push("/tutorials");
                            }}
                        >
                            Watch Example
                        </Button> */}
                    </div>
                </div>
            </aside>

            <section className="flex-1 px-4 sm:px-6 md:px-8 pt-10 lg:pt-10 ">

                {/* {showTutorial && (
                    <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white w-full max-w-2xl p-10 rounded-2xl shadow-2xl text-black relative"
                        >

                            <Button
                                onClick={tutorialWatched}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </Button>

                            <h2 className="text-xl font-bold mb-4 text-center">Tutorial</h2>

                            <div className="mb-4">
                                {tutorialIndex === 0 ? (
                                    <video
                                        controls
                                        width="100%"
                                        className="rounded-lg"
                                        src="/tutorials/Tutorial1.mp4"
                                    />
                                ) : (
                                    <Image
                                        src={tutorialImages[tutorialIndex]}
                                        alt={`Step ${tutorialIndex + 1}`}
                                        width={300}
                                        height={600}
                                        className="rounded-xl mx-auto"
                                    />
                                )}
                            </div>

                            <div className="flex justify-center items-center gap-3">
                                <Button
                                    size="icon"
                                    onClick={handlePrevTutorial}
                                    disabled={tutorialIndex === 0}
                                >
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={handleNextTutorial}
                                    disabled={tutorialIndex === tutorialImages.length - 1}
                                >
                                    <ChevronRight />
                                </Button>
                                <Button variant="destructive" onClick={tutorialWatched}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )} */}

                {sidebarItems[step]?.key === "appInfo" && (
                    <div className="flex flex-col lg:flex-row gap-10 items-start w-full">
                        {/* Left Column: Couple Name + Calendar */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-semibold text-pink-400 pb-6">Wedding Details</h2>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Bride */}
                                <div className="flex-1">
                                    <Label className="text-black font-bold text-lg block mb-2">Bride's Name</Label>
                                    <Input
                                        required
                                        className="w-full max-w-md bg-beige text-black border border-pink-300 px-4 py-2" value={form.brideName}
                                        onChange={(e) => handleChange("brideName", e.target.value)}
                                        disabled={isSubmitted || form?.zipGenerated}
                                    />
                                </div>

                                {/* Groom */}
                                <div className="flex-1">
                                    <Label className="text-black font-bold text-lg block mb-2">Groom's Name</Label>
                                    <Input
                                        required
                                        className="w-full max-w-md bg-beige text-black border border-pink-300 px-4 py-2" value={form.groomName}
                                        onChange={(e) => handleChange("groomName", e.target.value)}
                                        disabled={isSubmitted || form?.zipGenerated}
                                    />
                                </div>
                            </div>


                            <CalendarPage form={form} setForm={setForm} />
                        </div>

                        {/* Right Column: App Name + Toggles */}
                        <div className="flex-1 min-w-0 my-14">
                            <div className="flex items-center gap-2 mb-2">
                                <Label className="text-black font-bold text-lg">Name of App</Label>
                                <div className="relative group cursor-pointer">
                                    <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                                    <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                        Enter the name you would want for your wedding app.
                                    </div>
                                </div>
                            </div>

                            <Input
                                required
                                className="w-full max-w-md bg-beige text-black border border-pink-300 px-4 py-2"
                                value={form.appName}
                                onChange={(e) => handleChange("appName", e.target.value)}
                                disabled={isSubmitted || form?.zipGenerated}
                            />

                            <div className="font-bold text-lg pb-6 pt-6">
                                These screens are essential to ensure your app is easy to use and looks great.
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {requiredScreens.map(({ label, field }) => (
                                    <Button
                                        key={field}
                                        className={`px-4 py-2 rounded-full border text-sm font-bold transition 
        ${form[field]
                                                ? "bg-pink-400 text-white border-white"
                                                : "bg-transparent text-black border-[#6B5A7A] hover:border-white"}`}

                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                            <div className="font-bold text-lg pb-6 pt-6">
                                Select from the available screens below to personalize and enhance your app experience.
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-12 gap-4">
                                {screenToggles.map(({ label, field }) => (
                                    <label
                                        key={field}
                                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-pink-300 text-black font-medium cursor-pointer"
                                    >
                                        <Input
                                            type="checkbox"
                                            checked={!!form[field]}
                                            onChange={() => handleToggle(field)}
                                            disabled={isSubmitted || form?.zipGenerated}
                                            className="form-checkbox h-5 w-5 text-pink-500"
                                        />
                                        {label}
                                    </label>
                                ))}

                            </div>

                            <div className="mt-10">
                                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>Next</Button>
                            </div>
                        </div>
                    </div>
                )}


                {sidebarItems[step]?.key === "saveDate" && (
                    <SaveTheDate setForm={setForm} handleChange={handleChange} goNext={goNext} goBack={goBack} form={form} />
                )}

                {sidebarItems[step]?.key === "weddingParty" && (
                    <WeddingParty form={form} setForm={setForm} goNext={goNext} goBack={goBack} />
                )}

                {sidebarItems[step]?.key === "registry" && (
                    <Registry form={form} setForm={setForm} goNext={goNext} goBack={goBack} />
                )}

                {sidebarItems[step]?.key === "travel" && (
                    <Travel form={form} setForm={setForm} goNext={goNext} goBack={goBack} />
                )}

                {sidebarItems[step]?.key === "settings" && (
                    <Settings form={form} handleChange={handleChange} goNext={goNext} goBack={goBack} />
                )}
                {sidebarItems[step]?.key === "themes" && (
                    <Themes form={form} handleChange={handleChange} goNext={goNext} goBack={goBack} />
                )}
                {sidebarItems[step]?.key === "preview" && (
                    <Preview form={form} goBack={goBack} isSubmitted={form.isSubmitted} navigateToSection={(key) => {
                        const index = sidebarItems.findIndex((item) => item.key === key);
                        if (index !== -1) setStep(index);
                    }}
                    />
                )}
            </section>
        </main >
    );
}


