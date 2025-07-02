'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { generateSlug } from '@/lib/generateSlug';

export default function SearchForWeddingSite() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        brideName: '',
        groomName: '',
        weddingMonth: '',
        weddingYear: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { brideName, groomName, weddingMonth, weddingYear } = form;
        console.log(brideName, groomName, weddingMonth, weddingYear);

        if (!brideName || !groomName || !weddingMonth || !weddingYear) return;
        const weddingDate = `${weddingYear}-${weddingMonth}`;
        const slug = generateSlug(brideName, groomName, weddingDate);
        console.log("slug", slug);
        router.push(`/site/${slug}`);
    };

    return (
        <main className="bg-[#0D0208] text-[#E4D7DE] font-sans min-h-screen overflow-x-hidden">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0D0208] w-full flex justify-between font-bold items-center px-12 py-6 border-b border-pink-500">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-2xl">
                    <div className="w-6 h-6 border-[2.5px] border-pink-500 rounded-full" />
                    <Link href="/">WedDesigner</Link>
                </div>
                <Button className="lg:hidden text-pink-400" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </Button>
                <nav className="hidden lg:flex gap-8 text-sm font-bold">
                    <Link href="/">Home</Link>
                    <Link href="/features">Features</Link>
                    <Link href="/contact-us">Contact</Link>
                </nav>
                <div className="hidden lg:flex gap-6 items-center font-bold">
                    <button
                        className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => router.push('/log-in')}
                    >Log in</button>
                    <button className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm">Try it free</button>
                </div>
                {menuOpen && (
                    <div className="absolute top-full left-0 w-full bg-[#0D0208] border-t border-pink-500 py-6 px-6 flex flex-col gap-4 lg:hidden z-50">
                        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link href="/features" onClick={() => setMenuOpen(false)}>Features</Link>
                        <Link href="/contact-us" onClick={() => setMenuOpen(false)}>Contact</Link>
                        <hr className="border-gray-600" />
                        <Link href="/log-in" className="text-sm" onClick={() => setMenuOpen(false)}>Log in</Link>
                        <Button onClick={() => setMenuOpen(false)} className="bg-pink-500 text-black px-4 py-2 rounded-md text-sm mt-2">Try it free</Button>
                    </div>
                )}
            </header>

            {/* Search Section */}
            <section className="w-full flex justify-center px-6 py-20 bg-[#0D0208] text-[#E4D7DE]">
                <div className="w-full max-w-2xl bg-[#1C0E0E] p-8 rounded-lg shadow-lg">
                    <h3 className="text-3xl font-bold mb-4 text-pink-400">Find a couple's site and app</h3>
                    <form onSubmit={handleSubmit} className="flex flex-wrap sm:flex-nowrap gap-4 items-center">
                        <input
                            type="text"
                            name="brideName"
                            placeholder="Bride name"
                            value={form.brideName}
                            onChange={handleChange}
                            required
                            className="flex-1 min-w-[150px] bg-white text-black px-4 py-2 rounded-md border border-gray-300"
                        />
                        <input
                            type="text"
                            name="groomName"
                            placeholder="Groom name"
                            value={form.groomName}
                            onChange={handleChange}
                            required
                            className="flex-1 min-w-[150px] bg-white text-black px-4 py-2 rounded-md border border-gray-300"
                        />
                        <select
                            name="weddingMonth"
                            value={form.weddingMonth}
                            onChange={handleSelectChange}
                            required
                            className="flex-1 min-w-[120px] bg-white text-black px-4 py-2 rounded-md border border-gray-300"
                        >
                            <option value="">Month</option>
                            {[
                                '01', '02', '03', '04', '05', '06',
                                '07', '08', '09', '10', '11', '12'
                            ].map((month, i) => (
                                <option key={month} value={month}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            name="weddingYear"
                            value={form.weddingYear}
                            onChange={handleSelectChange}
                            required
                            className="flex-1 min-w-[100px] bg-white text-black px-4 py-2 rounded-md border border-gray-300"
                        >
                            <option value="">Year</option>
                            {['2024', '2025', '2026'].map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-pink-500 hover:bg-pink-400 transition text-white font-bold px-6 py-2 rounded-full"
                        >
                            Search
                        </button>
                    </form>

                </div>
            </section>

        </main>
    );
}
