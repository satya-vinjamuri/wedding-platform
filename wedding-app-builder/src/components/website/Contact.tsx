'use client';

import { FormState } from "@/types/FormState";

export default function Contact({ form }: { form: FormState }) {
    return (
        <div className="max-w-3xl mx-auto px-6 py-10 bg-[#FFFBF8] rounded-3xl font-serif text-[#1A1A1A] space-y-16 shadow-md">
            {/* Contact Info */}
            {form.contactInfo && form.contactInfo.length > 0 && (
                <section className="text-center space-y-6">
                    <h2 className="text-4xl font-extrabold tracking-wide text-[#D14D72]">Stay in Touch</h2>
                    <div className="flex flex-col gap-4 items-center">
                        {form.contactInfo.map((contact, idx) => (
                            <div key={idx} className="text-lg">
                                <p className="font-semibold">{contact.name}</p>
                                <p className="text-gray-600">{contact.phone}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FAQs */}
            {form.faqs && form.faqs.length > 0 && (
                <section className="space-y-8">
                    <h2 className="text-4xl font-extrabold tracking-wide text-center text-[#D14D72]">Frequently Asked</h2>
                    <ul className="space-y-6">
                        {form.faqs.map((faq, idx) => (
                            <li
                                key={idx}
                                className="bg-white border border-pink-100 rounded-xl p-5 shadow-sm"
                            >
                                <p className="font-semibold text-lg mb-2">{faq.question}</p>
                                <p className="text-gray-700">{faq.answer}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
