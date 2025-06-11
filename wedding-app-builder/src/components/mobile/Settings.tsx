"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormState } from "@/types/FormState";
import { X } from "lucide-react";
import Notifications from "./Notifications";

interface FAQItem {
    question: string;
    answer: string;
    customQuestion: string;
}

interface ContactInfo {
    name: string;
    phone: string;
}

type Props = {
    form: FormState;
    handleChange: (field: keyof FormState, value: any) => void;
    goNext: () => void;
    goBack: () => void;
};

const Settings: React.FC<Props> = ({ form, handleChange, goNext, goBack }) => {
    const isSubmitted = form.isSubmitted;
    if (!form.enableSettings) return null;

    const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
        const newFAQs = [...(form.faqs || [])];
        newFAQs[index] = { ...newFAQs[index], [field]: value };
        handleChange("faqs", newFAQs);
    };

    const addFAQ = () => {
        const newFAQs = [...(form.faqs || []), { question: "", answer: "" }];
        handleChange("faqs", newFAQs);
    };

    const removeFAQ = (index: number) => {
        const newFAQs = [...(form.faqs || [])];
        newFAQs.splice(index, 1);
        handleChange("faqs", newFAQs);
    };

    const updateContact = (index: number, field: keyof ContactInfo, value: string) => {
        const newContacts = [...(form.contactInfo || [])];
        newContacts[index] = { ...newContacts[index], [field]: value };
        handleChange("contactInfo", newContacts);
    };

    const addContact = () => {
        const newContacts = [...(form.contactInfo || []), { name: "", phone: "" }];
        handleChange("contactInfo", newContacts);
    };

    const removeContact = (index: number) => {
        const newContacts = [...(form.contactInfo || [])];
        newContacts.splice(index, 1);
        handleChange("contactInfo", newContacts);
    };

    return (
        <div className="max-w-2xl space-y-6 text-cocoa">
            <h2 className="text-2xl font-bold text-pink-400">Settings</h2>

            <div>
                <Label className="text-mauve pb-2 text-lg font-semibold">FAQs</Label>
                {(form.faqs || []).map((faq, index) => (
                    <div key={index} className="relative p-4 rounded-md border border-mauve bg-petal mb-4 space-y-2">

                        {!isSubmitted && (
                            <Button
                                onClick={() => removeFAQ(index)}
                                className="absolute top-1 left-1 text-red-500 hover:text-red-700"
                                aria-label="Remove FAQ"
                            >
                                <X size={16} />
                            </Button>
                        )}
                        <br />
                        <div className="space-y-2">

                            <select
                                value={faq.question}
                                onChange={(e) => updateFAQ(index, "question", e.target.value)}
                                disabled={isSubmitted || form?.zipGenerated}
                                className="bg-white text-cocoa border border-mauve px-3 py-2 rounded w-full"
                            >
                                <option value="">Select a common question</option>
                                <option value="What time should we arrive?">What time should we arrive?</option>
                                <option value="Is there a dress code?">Is there a dress code?</option>
                                <option value="Will there be parking available?">Will there be parking available?</option>
                                <option value="Are kids allowed?">Are kids allowed?</option>
                                <option value="What's the venue address?">What's the venue address?</option>
                                <option value="type your own">My own question</option>
                            </select>

                            {faq.question === "type your own" && (
                                <Input
                                    type="text"
                                    placeholder="Enter your question..."
                                    value={faq.customQuestion || ""}
                                    onChange={(e) => updateFAQ(index, "customQuestion", e.target.value)}
                                    className="bg-white text-cocoa border border-mauve w-full"
                                    disabled={isSubmitted || form?.zipGenerated}
                                />
                            )}
                        </div>

                        <Textarea
                            placeholder="Answer"
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                            className="bg-white text-cocoa border border-mauve"
                            disabled={isSubmitted || form?.zipGenerated}
                        />

                    </div>
                ))}
                {!isSubmitted && (
                    <Button type="button" className="bg-pink-400 text-white font-bold" onClick={addFAQ}>
                        + Add FAQ
                    </Button>
                )}
            </div>

            <div>
                <Label className="text-mauve pb-2 font-semibold text-lg">Contact Information</Label>
                {(form.contactInfo || []).map((contact, index) => (
                    <div key={index} className="relative p-4 rounded-md border border-mauve bg-petal mb-4 space-y-2">
                        <Input
                            type="text"
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) => updateContact(index, "name", e.target.value)}
                            className="bg-white text-cocoa border border-mauve"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        <Input
                            type="text"
                            placeholder="Phone Number"
                            value={contact.phone}
                            onChange={(e) => updateContact(index, "phone", e.target.value)}
                            className="bg-white text-cocoa border border-mauve"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        {!isSubmitted && (
                            <button
                                onClick={() => removeContact(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                aria-label="Remove contact"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
                {!isSubmitted && (
                    <Button type="button" className="bg-pink-400 text-white font-bold" onClick={addContact}>
                        + Add Contact
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-8">
                <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-2">
                        <Label className="text-black font-bold text-lg">App Password Protection</Label>
                        <div className="relative group cursor-pointer">
                            <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                            <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                Enable this to require a password before any of your guests can access the app and wedding details.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="enablePassword"
                            checked={form.enablePassword || false}
                            onChange={(e) => handleChange("enablePassword", e.target.checked)}
                            className="w-4 h-4"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        <label htmlFor="enablePassword" className="text-cocoa">
                            Enable password for app access
                        </label>
                    </div>
                    {form.enablePassword && (
                        <div className="mt-4">
                            <Label htmlFor="appPassword" className="text-mauve font-semibold">Password</Label>
                            <Input
                                type="text"
                                id="appPassword"
                                placeholder="Enter app password"
                                value={form.appPassword || ""}
                                onChange={(e) => handleChange("appPassword", e.target.value)}
                                className="mt-1 bg-white text-cocoa border border-mauve"
                                disabled={isSubmitted || form?.zipGenerated}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-2">
                        <Label className="text-black font-bold text-lg">Admin App Password Protection</Label>
                        <div className="relative group cursor-pointer">
                            <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
                            <div className="absolute z-10 hidden group-hover:block w-70 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
                                Enable this to require a password before accessing the admin area of your app.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="enableAdminPassword"
                            checked={form.enableAdminPassword || false}
                            onChange={(e) => handleChange("enableAdminPassword", e.target.checked)}
                            className="w-4 h-4"
                            disabled={isSubmitted || form?.zipGenerated}
                        />
                        <label htmlFor="enableAdminPassword" className="text-cocoa">
                            Enable password for administrator access
                        </label>
                    </div>
                    {form.enableAdminPassword && (
                        <div className="mt-4">
                            <Label htmlFor="adminAppPassword" className="text-mauve font-semibold">Password</Label>
                            <Input
                                type="text"
                                id="adminAppPassword"
                                placeholder="Enter admin app password"
                                value={form.adminAppPassword || ""}
                                onChange={(e) => handleChange("adminAppPassword", e.target.value)}
                                className="mt-1 bg-white text-cocoa border border-mauve"
                                disabled={isSubmitted || form?.zipGenerated}
                            />
                        </div>
                    )}
                </div>
                <Notifications form={form} handleChange={handleChange as (field: string, value: any) => void} />
            </div>

            <div className="flex justify-start gap-4 pt-4 pb-4">
                <Button variant="outline" className="font-bold" onClick={goBack}>
                    Back
                </Button>
                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>
                    Next
                </Button>
            </div>
        </div >
    );
};

export default Settings;


// "use client";

// import React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { FormState } from "@/types/FormState";

// interface FAQItem {
//     question: string;
//     answer: string;
// }

// interface ContactInfo {
//     name: string;
//     phone: string;
// }

// type Props = {
//     form: FormState;
//     handleChange: (field: keyof FormState, value: any) => void;
//     goNext: () => void;
//     goBack: () => void;
// };

// const Settings: React.FC<Props> = ({ form, handleChange, goNext, goBack }) => {
//     const isSubmitted = form.isSubmitted;
//     if (!form.enableSettings) return null;

//     const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
//         const newFAQs = [...(form.faqs || [])];
//         newFAQs[index] = { ...newFAQs[index], [field]: value };
//         handleChange("faqs", newFAQs);
//     };

//     const addFAQ = () => {
//         const newFAQs = [...(form.faqs || []), { question: "", answer: "" }];
//         handleChange("faqs", newFAQs);
//     };

//     const removeFAQ = (index: number) => {
//         const newFAQs = [...(form.faqs || [])];
//         newFAQs.splice(index, 1);
//         handleChange("faqs", newFAQs);
//     };

//     const updateContact = (index: number, field: keyof ContactInfo, value: string) => {
//         const newContacts = [...(form.contactInfo || [])];
//         newContacts[index] = { ...newContacts[index], [field]: value };
//         handleChange("contactInfo", newContacts);
//     };

//     const addContact = () => {
//         const newContacts = [...(form.contactInfo || []), { name: "", phone: "" }];
//         handleChange("contactInfo", newContacts);
//     };

//     const removeContact = (index: number) => {
//         const newContacts = [...(form.contactInfo || [])];
//         newContacts.splice(index, 1);
//         handleChange("contactInfo", newContacts);
//     };

//     return (
//         <div className="max-w-xxl space-y-6">
//             <h2 className="text-2xl font-semibold text-pink-400">Settings</h2>

//             <div>
//                 <Label className="text-pink-500 pb-2 font-semibold">FAQs</Label>
//                 {(form.faqs || []).map((faq, index) => (
//                     <div key={index} className="mb-4 p-4 bg-[#1A1A1A] rounded-md space-y-2">
//                         <Input
//                             type="text"
//                             placeholder="Question"
//                             value={faq.question}
//                             onChange={(e) => updateFAQ(index, "question", e.target.value)}
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         <Textarea
//                             placeholder="Answer"
//                             value={faq.answer}
//                             onChange={(e) => updateFAQ(index, "answer", e.target.value)}
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         {!isSubmitted && (
//                             <Button
//                                 type="button"
//                                 variant="ghost"
//                                 className="text-red-400 hover:text-red-600"
//                                 onClick={() => removeFAQ(index)}
//                             >
//                                 Remove
//                             </Button>
//                         )}
//                     </div>
//                 ))}
//                 {!isSubmitted && (
//                     <Button type="button" className="bg-pink-500 text-black font-bold" onClick={addFAQ}>
//                         Add FAQ
//                     </Button>
//                 )}
//             </div>

//             <div>
//                 <Label className="text-pink-500 pb-2 font-semibold">Contact Information</Label>
//                 {(form.contactInfo || []).map((contact, index) => (
//                     <div key={index} className="mb-4 p-4 bg-[#1A1A1A] rounded-md space-y-2">
//                         <Input
//                             type="text"
//                             placeholder="Name"
//                             value={contact.name}
//                             onChange={(e) => updateContact(index, "name", e.target.value)}
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         <Input
//                             type="text"
//                             placeholder="Phone Number"
//                             value={contact.phone}
//                             onChange={(e) => updateContact(index, "phone", e.target.value)}
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         {!isSubmitted && (
//                             <Button
//                                 type="button"
//                                 variant="ghost"
//                                 className="text-red-400 hover:text-red-600"
//                                 onClick={() => removeContact(index)}
//                             >
//                                 Remove
//                             </Button>
//                         )}
//                     </div>
//                 ))}
//                 {!isSubmitted && (
//                     <Button type="button" className="bg-pink-500 text-black font-bold" onClick={addContact}>
//                         Add Contact
//                     </Button>
//                 )}
//             </div>

//             <div className="flex flex-wrap gap-8">
//                 <div className="flex-1 min-w-[300px]">
//                     <div className="flex items-center gap-2">
//                         <Label className="text-pink-500 font-semibold">App Password Protection</Label>
//                         <div className="relative group cursor-pointer">
//                             <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
//                             <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
//                                 Enable this to require a password before any of your guests can access the app and wedding details.
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-2 mt-2">
//                         <input
//                             type="checkbox"
//                             id="enablePassword"
//                             checked={form.enablePassword || false}
//                             onChange={(e) => handleChange("enablePassword", e.target.checked)}
//                             className="w-4 h-4"
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         <label htmlFor="enablePassword" className="text-white-500">
//                             Enable password for app access
//                         </label>
//                     </div>
//                     {form.enablePassword && (
//                         <div className="mt-4">
//                             <Label htmlFor="appPassword" className="text-pink-500 font-semibold">Password</Label>
//                             <Input
//                                 type="text"
//                                 id="appPassword"
//                                 placeholder="Enter app password"
//                                 value={form.appPassword || ""}
//                                 onChange={(e) => handleChange("appPassword", e.target.value)}
//                                 className="mt-1"
//                                 disabled={isSubmitted || form?.zipGenerated}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 <div className="flex-1 min-w-[300px]">
// <div className="flex items-center gap-2">
//     <Label className="text-pink-500 font-semibold">Admin App Password Protection</Label>
//     <div className="relative group cursor-pointer">
//         <span className="text-white bg-gray-500 rounded-full px-2 text-xs font-bold">?</span>
//         <div className="absolute z-10 hidden group-hover:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg top-full mt-1">
//             Enable this to require a password before accessing the admin area of your app.
//         </div>
//     </div>
// </div>
//                     <div className="flex items-center gap-2 mt-2">
//                         <input
//                             type="checkbox"
//                             id="enableAdminPassword"
//                             checked={form.enableAdminPassword || false}
//                             onChange={(e) => handleChange("enableAdminPassword", e.target.checked)}
//                             className="w-4 h-4"
//                             disabled={isSubmitted || form?.zipGenerated}
//                         />
//                         <label htmlFor="enableAdminPassword" className="text-white-500">
//                             Enable password for administrator access
//                         </label>
//                     </div>
//                     {form.enableAdminPassword && (
//                         <div className="mt-4">
//                             <Label htmlFor="adminAppPassword" className="text-pink-500 font-semibold">Password</Label>
//                             <Input
//                                 type="text"
//                                 id="adminAppPassword"
//                                 placeholder="Enter admin app password"
//                                 value={form.adminAppPassword || ""}
//                                 onChange={(e) => handleChange("adminAppPassword", e.target.value)}
//                                 className="mt-1"
//                                 disabled={isSubmitted || form?.zipGenerated}
//                             />
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div className="flex justify-start gap-4 pt-4">
//                 <Button variant="outline" className="font-bold" onClick={goBack}>Back</Button>
//                 <Button className="bg-purple-500 text-black font-bold" onClick={goNext}>Next</Button>
//             </div>
//         </div>
//     );
// };

// export default Settings;