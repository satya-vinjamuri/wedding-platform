'use client';

import { FormState } from "@/types/FormState";

export default function Contact({ form }: { form: FormState }) {

    function formatPhoneNumber(phone: string) {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 10) {
            const areaCode = cleaned.slice(0, 3);
            const prefix = cleaned.slice(3, 6);
            const lineNumber = cleaned.slice(6);
            return `+1 (${areaCode})-${prefix}-${lineNumber}`;
        }

        return phone; // fallback if not valid 10-digit number
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 rounded-3xl  text-[#1A1A1A] space-y-16 ">
            {/* Contact Info */}
            {form.contactInfo && form.contactInfo.length > 0 && (
                <section className="text-center space-y-6">
                    <h2 className="text-4xl font-extrabold tracking-wide text-[#D14D72]">
                        Need Help with Travel, Details, or Questions? We’re Here!
                    </h2>
                    <ul className="space-y-6">
                        {form.faqs.map((faq, idx) => (
                            <li
                                key={idx}
                                className="bg-white border border-pink-300 rounded-xl p-5 shadow-sm"
                            >
                                <p className="font-semibold text-lg mb-2">{faq.question}</p>
                                <p className="text-gray-700">{faq.answer}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {/* FAQs */}
            {form.faqs && form.faqs.length > 0 && (
                <section className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-wide text-[#D14D72]">
                        Call/Text for help!
                    </h2>
                    {form.contactInfo.map((contact, idx) => (
                        <div key={idx} className="text-lg">
                            <p className="font-semibold">{contact.name}: <span className="font-normal"><a href={`tel:${contact.phone}`} className="font-normal">
                                {formatPhoneNumber(contact.phone)}
                            </a>
                            </span></p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
