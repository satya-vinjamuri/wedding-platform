// WeddingParty.tsx (Fix: preserve details before changing sides)
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { FormState } from "@/types/FormState";
import { weddingPartyRoles } from "@/types/WeddingParty";
import Image from "next/image";
import { Trash2 } from "lucide-react";

type WeddingProps = {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    goNext: () => void;
    goBack: () => void;
};

type Side = "bride" | "groom";

const ModalCard = ({ member }: any) => (
    <div className="text-center space-y-2">
        {member.image && typeof member.image !== "string" ? (
            <Image
                src={URL.createObjectURL(member.image)}
                alt={member.name || "Preview"}
                width={80}
                height={80}
                className="mx-auto rounded-full object-cover"
            />
        ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                No Photo
            </div>
        )}
        {member.name ? (
            <p className="font-semibold text-lg text-pink-900">{member.name}</p>
        ) : (
            <br />
        )}

        {member.role ? (
            <p className="text-sm text-black italic font-bold">{member.role}</p>
        ) : (
            <br />
        )}

        {member.relation ? (
            <p className="text-sm text-red-500 font-bold">{member.relation}</p>
        ) : (
            <br />
        )}


    </div>
);

const WeddingParty: React.FC<WeddingProps> = ({ form, setForm, goNext, goBack }) => {
    const isSubmitted = form.isSubmitted;
    const [openModalIndex, setOpenModalIndex] = useState<{ side: Side; index: number } | null>(null);
    const [selectSideOpen, setSelectSideOpen] = useState(false);
    const [originallyEmptyMemberIndex, setOriginallyEmptyMemberIndex] = useState<{ side: Side; index: number } | null>(null);

    const addMember = (side: Side) => {
        const newMember = { name: "", role: "", relation: "", image: null };
        setForm((prev) => {
            const updated = [...prev.weddingParty[side], newMember];
            return {
                ...prev,
                weddingParty: {
                    ...prev.weddingParty,
                    [side]: updated,
                },
            };
        });
        setTimeout(() => {
            const index = form.weddingParty[side].length;
            setOpenModalIndex({ side, index });
            setOriginallyEmptyMemberIndex({ side, index }); // track empty state
        }, 0);
    };


    const removeMember = (side: Side, index: number) => {
        if (openModalIndex?.side === side && openModalIndex.index === index) {
            setOpenModalIndex(null);
        }
        setForm((prev) => {
            const updated = [...prev.weddingParty[side]];
            updated.splice(index, 1);
            return {
                ...prev,
                weddingParty: {
                    ...prev.weddingParty,
                    [side]: updated,
                },
            };
        });
    };

    const updateMember = (
        side: Side,
        index: number,
        field: keyof FormState["weddingParty"]["bride"][0],
        value: string | File | null
    ) => {
        setForm((prev) => {
            const updated = [...prev.weddingParty[side]];
            updated[index] = { ...updated[index], [field]: value };
            return {
                ...prev,
                weddingParty: {
                    ...prev.weddingParty,
                    [side]: updated,
                },
            };
        });
    };


    const renderPartySide = (side: Side, label: string) => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">{label}</h3>
            <div className="grid grid-cols-2 gap-4">
                {form.weddingParty[side].map((member, index) => {
                    const isOpen = openModalIndex?.side === side && openModalIndex.index === index;
                    return (
                        <Dialog key={index} open={isOpen} onOpenChange={(open) => {
                            if (!open) {
                                // Check if modal was for a newly added (empty) member
                                const wasNew = originallyEmptyMemberIndex?.side === side && originallyEmptyMemberIndex.index === index;
                                const member = form.weddingParty[side][index];
                                const isEmpty = !member.name && !member.role && !member.relation && !member.image;

                                if (wasNew && isEmpty) {
                                    removeMember(side, index);
                                }

                                setOpenModalIndex(null);
                                setOriginallyEmptyMemberIndex(null);
                            }
                        }}>
                            <div className="relative">
                                <DialogTrigger asChild>
                                    <div
                                        className="cursor-pointer border rounded-lg p-4 bg-white hover:shadow-md"
                                        onClick={() => setOpenModalIndex({ side, index })}
                                    >
                                        <ModalCard member={member} />
                                        {!isSubmitted && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeMember(side, index);
                                                }}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="space-y-4 max-w-xl bg-[#FFF5F7] text-black shadow-xl border border-gray-300 rounded-xl">
                                    <DialogTitle className="text-lg font-bold text-center">Add Wedding Party Member</DialogTitle>
                                    <div className="space-y-3">
                                        <Label>Name</Label>
                                        <Input value={member.name} onChange={(e) => updateMember(side, index, "name", e.target.value)} disabled={isSubmitted || form?.zipGenerated} />
                                        <Label>Role</Label>
                                        <select
                                            value={member.role}
                                            onChange={(e) => updateMember(side, index, "role", e.target.value)}
                                            disabled={isSubmitted || form?.zipGenerated}
                                            className="w-full bg-[#FFF5F7] border border-gray-300 rounded px-3 py-2 text-sm text-black"
                                        >
                                            <option value="">Select a role</option>
                                            {weddingPartyRoles.map((group) => (
                                                <optgroup key={group.label} label={group.label}>
                                                    {group.options.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <Label>Relation</Label>
                                        <Input value={member.relation} onChange={(e) => updateMember(side, index, "relation", e.target.value)} disabled={isSubmitted || form?.zipGenerated} />
                                        <Label>Photo</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateMember(side, index, "image", e.target.files?.[0] || null)}
                                            disabled={isSubmitted || form?.zipGenerated}
                                        />
                                        <div className="flex gap-2 pt-2 flex-wrap">
                                            <Button onClick={() => setOpenModalIndex(null)} className="bg-pink-400 text-white text-xs font-bold hover:bg-pink-500" disabled={isSubmitted || form?.zipGenerated}>
                                                Done
                                            </Button>
                                            <Button onClick={() => { setOpenModalIndex(null); addMember(side); }} className="bg-green-500 text-white text-xs font-bold hover:bg-green-600" disabled={isSubmitted || form?.zipGenerated}>
                                                Add Another
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </div>
                        </Dialog >
                    );
                })}
            </div >
        </div >
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-pink-400">Wedding Party</h2>
            <h2 className="text-2xl font-semibold text-black">Our Close Friends & Family</h2>
            <div className="flex justify-start gap-4">
                <Dialog open={selectSideOpen} onOpenChange={setSelectSideOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-pink-400 text-white font-bold" disabled={isSubmitted || form?.zipGenerated}>+ Add</Button>
                    </DialogTrigger>
                    <DialogContent className="space-y-4 max-w-xl bg-[#FFF5F7] text-black shadow-xl border border-gray-300 rounded-xl">
                        <DialogTitle>Select a Side</DialogTitle>
                        <p className="text-sm">Who is this person representing?</p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => { setSelectSideOpen(false); addMember("bride"); }} className="bg-pink-400 text-white font-bold">
                                Bride's Side
                            </Button>
                            <Button onClick={() => { setSelectSideOpen(false); addMember("groom"); }} className="bg-blue-400 text-white font-bold">
                                Groom's Side
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderPartySide("bride", "Bride's Side")}
                {renderPartySide("groom", "Groom's Side")}
            </div>
            <div className="flex justify-start gap-4 pt-4 pb-4">
                <Button variant="outline" className="font-bold" onClick={goBack}>Back</Button>
                <Button className="bg-pink-400 text-white font-bold" onClick={goNext}>Next</Button>
            </div>
        </div >
    );
};

export default WeddingParty;
