'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { X, Key, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface JoinMemorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function JoinMemorialModal({ isOpen, onClose, onSuccess }: JoinMemorialModalProps) {
    const [key, setKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const supabase = createClient();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (key.length !== 6) {
            toast.error('Family Key must be 6 characters');
            return;
        }

        setIsVerifying(true);
        const toastId = toast.loading('Verifying Family Key...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Please log in to join a memorial');

            // 1. Find the memorial with this family key
            const { data: memorial, error: fetchError } = await supabase
                .from('memorials')
                .select('id, creator_relationship, name')
                .eq('family_password', key.toUpperCase())
                .single();

            if (fetchError || !memorial) {
                throw new Error('Invalid Family Key or memorial not found');
            }

            // 2. Determine the collaborator role
            const role = memorial.creator_relationship === 'Mom' ? 'Dad' : 'Mom';

            // 3. Link user to memorial in memorial_access
            const { error: accessError } = await supabase
                .from('memorial_access')
                .upsert({
                    memorial_id: memorial.id,
                    user_id: session.user.id,
                    role: role
                });

            if (accessError) throw accessError;

            toast.dismiss(toastId);
            toast.success(`Successfully joined ${memorial.name}'s memorial!`);
            setKey('');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.dismiss(toastId);
            const errorMessage = error.message || 'Failed to join memorial';
            toast.error(errorMessage);
            console.error('Join error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-memorial-surface dark:bg-memorialDark-surface rounded-memorial-lg p-6 max-w-md w-full shadow-2xl border border-memorial-border dark:border-memorialDark-border relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-memorial-textSecondary hover:bg-memorial-bg dark:hover:bg-memorialDark-bg rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 bg-memorial-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Key className="text-memorial-accent" size={24} />
                    </div>
                    <h2 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">Join Family Memorial</h2>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-2">
                        Enter the 6-character Family Key shared with you by the creator.
                    </p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter 6-char key (e.g. ABC123)"
                            value={key}
                            onChange={(e) => setKey(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="w-full bg-white dark:bg-memorialDark-bg border border-memorial-border dark:border-memorialDark-border rounded-memorial px-4 py-3 text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-memorial-accent transition-all uppercase"
                            disabled={isVerifying}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying || key.length !== 6}
                        className="w-full bg-memorial-accent text-white py-3 rounded-memorial font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                    >
                        {isVerifying ? 'Verifying...' : (
                            <>
                                <Check size={18} />
                                Claim Family Access
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-memorial-border/20">
                    <p className="text-[11px] text-memorial-textTertiary text-center leading-relaxed">
                        Joining gives you specialized "Mom" or "Dad" access to post private letters and view them in your dashboard. You will not have editing permissions.
                    </p>
                </div>
            </div>
        </div>
    );
}
