'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, X, MessageCircle, Users, Mail, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Available roles - Only Mom, Dad, Stranger
const ROLES = [
    { value: 'Mom', label: 'Mom', unique: true },
    { value: 'Dad', label: 'Dad', unique: true },
    { value: 'Stranger', label: 'Guest / Friend', unique: false },
];

// Envelope SVG Component
function EnvelopeIcon({ isOpen }) {
    return (
        <svg
            viewBox="0 0 80 60"
            className="w-16 h-12 md:w-20 md:h-16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Envelope Body */}
            <rect
                x="2"
                y="15"
                width="76"
                height="43"
                rx="2"
                className="fill-memorial-surface dark:fill-memorialDark-surface stroke-memorial-accent dark:stroke-memorialDark-accent"
                strokeWidth="2"
            />
            {/* Envelope Flap (closed or open) */}
            {isOpen ? (
                <>
                    {/* Open flap */}
                    <path
                        d="M2 17L40 2L78 17"
                        className="stroke-memorial-accent dark:stroke-memorialDark-accent fill-memorial-surfaceAlt dark:fill-memorialDark-surfaceAlt"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    {/* Letter peeking out */}
                    <rect
                        x="12"
                        y="8"
                        width="56"
                        height="30"
                        rx="1"
                        className="fill-white dark:fill-gray-200 stroke-memorial-border dark:stroke-memorialDark-border"
                        strokeWidth="1"
                    />
                    {/* Letter lines */}
                    <line x1="18" y1="16" x2="62" y2="16" className="stroke-memorial-accent/30 dark:stroke-memorialDark-accent/30" strokeWidth="2" />
                    <line x1="18" y1="22" x2="52" y2="22" className="stroke-memorial-accent/30 dark:stroke-memorialDark-accent/30" strokeWidth="2" />
                    <line x1="18" y1="28" x2="45" y2="28" className="stroke-memorial-accent/30 dark:stroke-memorialDark-accent/30" strokeWidth="2" />
                    {/* Decorative flower */}
                    <circle cx="40" cy="5" r="3" className="fill-memorial-accent dark:fill-memorialDark-accent" />
                </>
            ) : (
                <>
                    {/* Closed flap */}
                    <path
                        d="M2 17L40 40L78 17"
                        className="stroke-memorial-accent dark:stroke-memorialDark-accent"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    {/* Seal */}
                    <circle cx="40" cy="35" r="6" className="fill-memorial-accent dark:fill-memorialDark-accent" />
                    <Heart size={8} className="absolute" style={{ left: '37px', top: '32px' }} />
                </>
            )}
        </svg>
    );
}

// Single Envelope Card Component
function EnvelopeCard({ role, messages, onOpen, isVerified }) {
    const [isHovered, setIsHovered] = useState(false);
    const messageCount = messages.length;
    const isLocked = (role === 'Mom' || role === 'Dad') && !isVerified;

    // Get display label
    const getLabel = () => {
        if (role === 'Mom') return 'From: Mom';
        if (role === 'Dad') return 'From: Dad';
        return `From: Guests (${messageCount})`;
    };

    return (
        <motion.button
            onClick={onOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-between gap-3 p-4 md:p-6 rounded-memorial border border-memorial-border dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface hover:border-memorial-accent dark:hover:border-memorialDark-accent transition-all duration-300 cursor-pointer group w-[140px] md:w-[200px] h-[180px] md:h-[220px]"
        >
            <div className="relative flex-1 flex items-center justify-center">
                <EnvelopeIcon isOpen={isHovered} />
                {isLocked && (
                    <div className="absolute top-0 right-0 p-1 bg-black/10 dark:bg-white/10 rounded-full">
                        <X size={12} className="text-memorial-accent rotate-45" />
                    </div>
                )}
                {messageCount > 0 && role === 'Stranger' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg text-xs font-bold rounded-full flex items-center justify-center">
                        {messageCount > 9 ? '9+' : messageCount}
                    </div>
                )}
                {messageCount > 0 && role !== 'Stranger' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Heart size={10} className="text-white" fill="white" />
                    </div>
                )}
            </div>
            <div className="space-y-1 w-full text-center">
                <span className="text-sm md:text-base font-medium text-memorial-text dark:text-memorialDark-text block group-hover:text-memorial-accent dark:group-hover:text-memorialDark-accent transition-colors">
                    {getLabel()}
                </span>
                <span className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary block">
                    {isLocked ? '🔒 Password Required' : (messageCount === 0 ? 'No letters yet' : `${messageCount} message${messageCount > 1 ? 's' : ''}`)}
                </span>
            </div>
        </motion.button>
    );
}

// Message Modal for viewing letters
function LetterModal({ role, messages, isOpen, onClose }) {
    if (!isOpen) return null;

    const getTitle = () => {
        if (role === 'Mom') return "Letter from Mom";
        if (role === 'Dad') return "Letter from Dad";
        return "Letters from Strangers";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg max-h-[80vh] overflow-hidden memorial-card p-0 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-memorial-divider dark:border-memorialDark-divider">
                                <div className="flex items-center gap-3">
                                    <Mail size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
                                    <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text">
                                        {getTitle()}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors"
                                >
                                    <X size={20} className="text-memorial-textSecondary" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                        <Mail size={48} className="mx-auto mb-4 opacity-30" />
                                        <p>No letters yet</p>
                                        <p className="text-sm mt-2">Be the first to leave a message</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <motion.div
                                            key={msg.id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-border dark:border-memorialDark-border"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-memorial-text dark:text-memorialDark-text">
                                                    {msg.author_name}
                                                </h4>
                                                <time className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                    {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </time>
                                            </div>
                                            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function Guestbook({
    messages,
    onSubmit,
    isLoading,
    isLoggedIn = false,
    memorialId = '',
    memorial = null,
    currentUserId = null,
}: {
    messages: any[];
    onSubmit: any;
    isLoading: boolean;
    isLoggedIn?: boolean;
    memorialId?: string;
    memorial?: any;
    currentUserId?: string | null;
}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<string | null>(null);
    const [verifiedRoles, setVerifiedRoles] = useState<string[]>([]);
    const [rolePassword, setRolePassword] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        role: 'Stranger',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [takenRoles, setTakenRoles] = useState([]);
    const supabase = createClient();

    // 1. Auto-verify creator role OR collaborator role from memorial_access
    useEffect(() => {
        const verifyAccess = async () => {
            if (!isLoggedIn || !currentUserId || !memorial) return;

            let detectedRole = null;

            // Check if creator
            if (currentUserId === memorial.user_id && memorial.creator_relationship) {
                detectedRole = memorial.creator_relationship;
            } else {
                // Check if collaborator in memorial_access
                const { data: access } = await supabase
                    .from('memorial_access')
                    .select('role')
                    .eq('memorial_id', memorial.id)
                    .eq('user_id', currentUserId)
                    .single();

                if (access) {
                    detectedRole = access.role;
                }
            }

            if (detectedRole) {
                setVerifiedRoles(prev => prev.includes(detectedRole) ? prev : [...prev, detectedRole]);
                // AUTO-FILL form defaults if they are verified
                setFormData(prev => ({
                    ...prev,
                    role: detectedRole,
                    name: detectedRole
                }));
            }
        };

        verifyAccess();
    }, [isLoggedIn, currentUserId, memorial, supabase]);

    // Role-password logic helper
    const getRolePassword = (role: string) => {
        if (!memorial) return null;

        const creatorRole = memorial.creator_relationship;
        const otherRole = creatorRole === 'Mom' ? 'Dad' : creatorRole === 'Dad' ? 'Mom' : null;

        // The Family Key is always used to unlock the 'other' role
        if (role === otherRole) return memorial.family_password;

        // Special case: If the creator role itself is being accessed (maybe by someone else with the key?)
        // The user's requirement implies the key is for the second member.
        return null;
    };

    // Group messages by role
    const groupedMessages = {
        Mom: messages?.filter(m => m.role === 'Mom') || [],
        Dad: messages?.filter(m => m.role === 'Dad') || [],
        Stranger: messages?.filter(m => m.role === 'Stranger' || !m.role) || [],
    };

    // Determine which unique roles are already taken
    useEffect(() => {
        if (messages && messages.length > 0) {
            const taken = messages
                .filter(msg => msg.role)
                .map(msg => msg.role)
                .filter(role => ROLES.find(r => r.value === role && r.unique));
            setTakenRoles([...new Set(taken)]);
        }
    }, [messages]);

    const handleRoleVerification = (role: string) => {
        if (verifiedRoles.includes(role)) return true;
        setPendingRole(role);
        setIsPasswordModalOpen(true);
        return false;
    };

    const handleOpenRoleMessages = (role: string) => {
        if (role === 'Stranger') {
            setSelectedRole(role);
            return;
        }

        if (handleRoleVerification(role)) {
            setSelectedRole(role);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.message.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            setFormData({ name: '', message: '', role: 'Stranger' });
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error submitting message:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If trying to select Mom/Dad, trigger password check ONLY if not already verified
        if (name === 'role' && (value === 'Mom' || value === 'Dad')) {
            if (!verifiedRoles.includes(value)) {
                setPendingRole(value);
                setIsPasswordModalOpen(true);
                return;
            } else {
                // If already verified, auto-fill the name
                setFormData(prev => ({
                    ...prev,
                    role: value,
                    name: value // Auto-fill name as "Mom" or "Dad"
                }));
                return;
            }
        }

        // Handle name auto-fill if switching back to Stranger (optional: clear it if it was Mom/Dad)
        if (name === 'role' && value === 'Stranger') {
            setFormData(prev => ({
                ...prev,
                role: value,
                name: prev.name === 'Mom' || prev.name === 'Dad' ? '' : prev.name
            }));
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const requiredPassword = getRolePassword(pendingRole || '');

        if (pendingRole && rolePassword === requiredPassword) {
            setVerifiedRoles(prev => [...prev, pendingRole]);
            // If they are on the form, update form role and AUTO-FILL NAME
            if (isFormOpen) {
                setFormData(prev => ({
                    ...prev,
                    role: pendingRole,
                    name: pendingRole // Auto-fill name
                }));
            } else {
                // If they were just trying to read, open the modal
                setSelectedRole(pendingRole);
            }
            setIsPasswordModalOpen(false);
            setRolePassword('');
            setPendingRole(null);
            toast.success(`Verified as ${pendingRole}!`);
        } else {
            toast.error('Incorrect password for this role');
        }
    };

    const isRoleDisabled = (roleValue) => {
        const roleConfig = ROLES.find(r => r.value === roleValue);

        // If the current user is already verified for this role, IT IS NOT DISABLED
        if (verifiedRoles.includes(roleValue)) return false;

        // Otherwise, if it's unique and taken by someone else, disable it
        return roleConfig?.unique && takenRoles.includes(roleValue);
    };

    return (
        <>
            {/* Envelope Grid */}
            <div className="w-full">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-memorial-accent/30 border-t-memorial-accent dark:border-memorialDark-accent/30 dark:border-t-memorialDark-accent rounded-full animate-spin" />
                        <p className="mt-4 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                            Loading letters...
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-row items-center justify-center gap-4 md:gap-8 w-full">
                        <EnvelopeCard
                            role="Mom"
                            messages={groupedMessages.Mom}
                            onOpen={() => handleOpenRoleMessages('Mom')}
                            isVerified={verifiedRoles.includes('Mom')}
                        />
                        <EnvelopeCard
                            role="Dad"
                            messages={groupedMessages.Dad}
                            onOpen={() => handleOpenRoleMessages('Dad')}
                            isVerified={verifiedRoles.includes('Dad')}
                        />
                        <EnvelopeCard
                            role="Stranger"
                            messages={groupedMessages.Stranger}
                            onOpen={() => handleOpenRoleMessages('Stranger')}
                            isVerified={true}
                        />
                    </div>
                )}
            </div>

            {/* Letter Modal */}
            <LetterModal
                role={selectedRole}
                messages={selectedRole ? groupedMessages[selectedRole] : []}
                isOpen={selectedRole !== null}
                onClose={() => setSelectedRole(null)}
            />

            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFormOpen(!isFormOpen)}
                className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 ${isFormOpen
                    ? 'bg-memorial-text dark:bg-memorialDark-text'
                    : 'bg-memorial-accent dark:bg-memorialDark-accent'
                    }`}
                aria-label={isFormOpen ? 'Close letter form' : 'Write a letter'}
            >
                <AnimatePresence mode="wait">
                    {isFormOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Mail size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Floating Form Panel */}
            <AnimatePresence>
                {isFormOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
                        />

                        {/* Form Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:w-96 max-h-[70vh] overflow-y-auto"
                        >
                            <div className="memorial-card p-4 md:p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text flex items-center gap-2">
                                        <Mail size={20} className="text-memorial-accent dark:text-memorialDark-accent" />
                                        Write a Letter
                                    </h3>
                                    <button
                                        onClick={() => setIsFormOpen(false)}
                                        className="md:hidden p-2 text-memorial-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name Input */}
                                    <div>
                                        <label
                                            htmlFor="floating-name"
                                            className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2"
                                        >
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="floating-name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 text-sm"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Role Selector */}
                                    <div>
                                        <label
                                            htmlFor="floating-role"
                                            className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2"
                                        >
                                            <Users size={14} className="inline mr-1" />
                                            Posting As
                                        </label>
                                        <select
                                            id="floating-role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            disabled={!isLoggedIn}
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="Stranger">Guest / Friend</option>
                                            {/* Only show Mom/Dad roles if they are already verified/joined */}
                                            {verifiedRoles.includes('Mom') && <option value="Mom">Mom</option>}
                                            {verifiedRoles.includes('Dad') && <option value="Dad">Dad</option>}

                                            {/* If not verified, but role is available, let them select it (triggers verification) */}
                                            {!verifiedRoles.includes('Mom') && !takenRoles.includes('Mom') && <option value="Mom">Claim Role: Mom</option>}
                                            {!verifiedRoles.includes('Dad') && !takenRoles.includes('Dad') && <option value="Dad">Claim Role: Dad</option>}
                                        </select>
                                        {!isLoggedIn && (
                                            <p className="mt-1 text-[10px] text-memorial-textSecondary italic">
                                                Login required to claim family roles (Mom/Dad)
                                            </p>
                                        )}
                                        {isLoggedIn && !verifiedRoles.length && (
                                            <p className="mt-1 text-[10px] text-memorial-textSecondary italic">
                                                Select a role to verify and post.
                                            </p>
                                        )}
                                    </div>

                                    {/* Message Textarea */}
                                    <div>
                                        <label
                                            htmlFor="floating-message"
                                            className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2"
                                        >
                                            Your Letter *
                                        </label>
                                        <textarea
                                            id="floating-message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-accent dark:focus:border-memorialDark-accent transition-colors duration-200 resize-none text-sm"
                                            placeholder="Write your heartfelt message..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.name.trim() || !formData.message.trim()}
                                        className="w-full px-6 py-3 bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg rounded-memorial hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send Letter
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Role Password Verification Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-memorial-bg dark:bg-memorialDark-bg p-6 rounded-memorial shadow-memorial max-w-sm w-full border border-memorial-divider dark:border-memorialDark-divider"
                        >
                            <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                                Role Verification
                            </h3>
                            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                Please enter the password provided by the memorial creator to post as <strong>{pendingRole}</strong>.
                            </p>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <input
                                    type="password"
                                    value={rolePassword}
                                    onChange={(e) => setRolePassword(e.target.value)}
                                    placeholder="Enter password"
                                    autoFocus
                                    className="w-full bg-white dark:bg-memorialDark-surface border border-memorial-divider dark:border-memorialDark-divider rounded-memorial px-4 py-3 text-memorial-text dark:text-memorialDark-text outline-none focus:ring-2 focus:ring-memorial-accent/20"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPasswordModalOpen(false);
                                            setRolePassword('');
                                            setPendingRole(null);
                                        }}
                                        className="flex-1 py-3 text-sm font-medium text-memorial-textSecondary hover:text-memorial-text transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-memorial-accent text-white rounded-memorial text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
