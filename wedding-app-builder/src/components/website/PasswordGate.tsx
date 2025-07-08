"use client";

import { useState, useEffect } from "react";
import WeddingSiteTabs from "./WeddingSiteTabs";

export default function PasswordGate({ plainData, formattedDate }: { plainData: any; formattedDate: string }) {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`access-${plainData.websiteSlug}`);
    if (cached && Date.now() < Number(cached)) {
      setUnlocked(true);
    }
  }, [plainData.websiteSlug]);

  const handleUnlock = () => {
    if (input === plainData.appPassword) {
      sessionStorage.setItem(`access-${plainData.websiteSlug}`, (Date.now() + 30 * 60 * 1000).toString());
      setUnlocked(true);
    } else {
      alert("Incorrect password");
    }
  };

  if (!unlocked) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative flex flex-col items-center justify-center text-black"
        style={{ backgroundImage: "url('/backgrounds/floral-bg-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/75 z-0" />
        <div className="relative z-10 text-center px-6">
          <h2 className="text-xl mb-6">
            Please enter the password to access the wedding site of{" "}
            <span className="font-bold">{plainData.brideName}</span>{" "}
            <span className="text-pink-600 font-bold">&</span>{" "}
            <span className="font-bold">{plainData.groomName}</span>
          </h2>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Password"
            className="px-4 py-2 rounded-lg border border-gray-400 text-black text-lg w-64 mb-4"
          />
          <button
            onClick={handleUnlock}
            className="ml-4 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

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
