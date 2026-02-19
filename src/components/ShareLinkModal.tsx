'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Mail, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { createClient } from '@/lib/supabaseClient';

interface Memorial {
    id: string;
    name: string;
    creator_relationship?: string;
    family_password?: string;
}

interface ShareLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    memorials: Memorial[];
    isPaid: boolean;
    onUpdate?: (id: string, updates: Partial<Memorial>) => void;
}

export default function ShareLinkModal({ isOpen, onClose, memorials, isPaid, onUpdate }: ShareLinkModalProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [tempRelationship, setTempRelationship] = useState('');
    const supabase = createClient();

    const handleCopy = (id: string) => {
        const url = `${window.location.origin}/memorial/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Readable chars
        return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    const handleUpdateRelationship = async (id: string) => {
        if (!tempRelationship) {
            toast.error('Please select your relationship');
            return;
        }

        const generatedPass = generatePassword();
        const toastId = toast.loading('Saving relationship...');
        try {
            const { error } = await supabase
                .from('memorials')
                .update({
                    creator_relationship: tempRelationship,
                    family_password: generatedPass
                })
                .eq('id', id);

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success('Relationship and Password generated!');
            if (onUpdate) onUpdate(id, {
                creator_relationship: tempRelationship,
                family_password: generatedPass
            });
            setUpdatingId(null);
            // We don't clear tempRelationship yet so we can show the password in the UI
        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error('Failed to update relationship. Please ensure the database schema is up to date.');
            console.error('Update relationship error:', error.message || error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-memorial-surface dark:bg-memorialDark-surface rounded-memorial-lg p-6 max-w-lg w-full shadow-2xl border border-memorial-border dark:border-memorialDark-border relative animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-memorial-textTertiary hover:text-memorial-text dark:text-memorialDark-textTertiary dark:hover:text-memorialDark-text transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-memorial-accent/10 flex items-center justify-center text-memorial-accent">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">Share Invitation Links</h2>
                        <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">Invite friends and family to your digital archive</p>
                    </div>
                </div>

                {!isPaid ? (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-memorial-border rounded-memorial">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-memorial-accent/5 flex items-center justify-center">
                            <Heart size={24} className="text-memorial-accent/40" />
                        </div>
                        <h3 className="text-lg font-serif mb-2">Upgrade Required</h3>
                        <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6 max-w-xs mx-auto">
                            Sharing invitation links is a premium feature. Upgrade to Eternal Echo or Paws plan to unlock it.
                        </p>
                        <Link
                            href="/pricing"
                            className="btn-primary"
                            onClick={onClose}
                        >
                            View Plans
                        </Link>
                    </div>
                ) : memorials.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-memorial-textSecondary">You haven't created any memorials yet.</p>
                        <Link href="/create-memorial" className="text-memorial-accent font-medium mt-2 inline-block" onClick={onClose}>
                            Create your first memorial
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {memorials.map((memorial) => (
                            <div
                                key={memorial.id}
                                className="p-4 rounded-memorial border border-memorial-border/50 bg-memorial-bg/50 dark:bg-memorialDark-bg/30 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1 overflow-hidden pr-4">
                                        <span className="font-semibold text-sm truncate">{memorial.name}</span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-memorial-textTertiary uppercase tracking-widest">
                                                {memorial.creator_relationship ? `Your Relation: ${memorial.creator_relationship}` : '⚠️ Relationship Missing'}
                                            </span>
                                            {memorial.creator_relationship && memorial.family_password && (
                                                <span className="text-[10px] text-memorial-accent font-medium">
                                                    Key for {memorial.creator_relationship === 'Mom' ? 'Dad' : 'Mom'}: <code className="bg-memorial-accent/10 px-1 rounded">{memorial.family_password}</code>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/memorial/${memorial.id}`}
                                        target="_blank"
                                        className="p-2 text-memorial-textSecondary hover:text-memorial-accent transition-colors shrink-0"
                                        title="Preview"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>

                                {memorial.creator_relationship ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleCopy(memorial.id)}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-memorial text-sm font-medium transition-all ${copiedId === memorial.id
                                                ? 'bg-green-500 text-white'
                                                : 'bg-memorial-accent text-white hover:opacity-90'
                                                }`}
                                        >
                                            {copiedId === memorial.id ? <Check size={16} /> : <Copy size={16} />}
                                            {copiedId === memorial.id ? 'Copied URL' : 'Copy Invitation Link'}
                                        </button>
                                        {memorial.family_password && (
                                            <p className="text-[10px] text-memorial-textTertiary text-center italic">
                                                Share the key above with the other family member.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2 border-t border-memorial-border/20">
                                        <p className="text-[11px] text-memorial-textSecondary italic">
                                            Select your relationship to this person to generate a shared family key.
                                        </p>
                                        <div className="flex gap-2">
                                            <select
                                                value={updatingId === memorial.id ? tempRelationship : ''}
                                                onChange={(e) => {
                                                    setUpdatingId(memorial.id);
                                                    setTempRelationship(e.target.value);
                                                }}
                                                className="flex-1 bg-white dark:bg-memorialDark-surface border border-memorial-border dark:border-memorialDark-border rounded-memorial px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-memorial-accent appearance-none"
                                            >
                                                <option value="">Select Role...</option>
                                                <option value="Mom">I am the Mom</option>
                                                <option value="Dad">I am the Dad</option>
                                            </select>
                                            <button
                                                onClick={() => handleUpdateRelationship(memorial.id)}
                                                className="px-4 py-2 bg-memorial-accent text-white rounded-memorial text-xs font-medium hover:opacity-90 shadow-sm"
                                            >
                                                Save & Generate
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-memorial-border/30">
                    <p className="text-[11px] text-memorial-textTertiary leading-relaxed">
                        Tip: You can print these links on QR codes for memorial services or share them via WhatsApp and social media.
                    </p>
                </div>
            </div>
        </div>
    );
}
