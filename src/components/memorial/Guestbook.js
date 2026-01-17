'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, X, MessageCircle, Users } from 'lucide-react';

// Available roles - Only Mom, Dad, Stranger
const ROLES = [
    { value: 'Mom', label: 'Mom', unique: true },
    { value: 'Dad', label: 'Dad', unique: true },
    { value: 'Stranger', label: 'Stranger', unique: false },
];

export default function Guestbook({ messages, onSubmit, isLoading }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        role: 'Stranger',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [takenRoles, setTakenRoles] = useState([]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.message.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form on success
            setFormData({ name: '', message: '', role: 'Stranger' });
            // Close the panel after successful submission
            setIsOpen(false);
        } catch (error) {
            console.error('Error submitting message:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Check if a role is disabled (unique and already taken)
    const isRoleDisabled = (roleValue) => {
        const roleConfig = ROLES.find(r => r.value === roleValue);
        return roleConfig?.unique && takenRoles.includes(roleValue);
    };

    // Get role initial for minimal display (M for Mom, D for Dad, S for Stranger)
    const getRoleInitial = (role) => {
        if (role === 'Mom') return 'M';
        if (role === 'Dad') return 'D';
        return 'S'; // Stranger
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const displayedMessages = isExpanded ? messages : messages.slice(0, 3);

    return (
        <>
            {/* Messages List - Displayed in the main content area */}
            <div className="w-full">
                <div className="space-y-4 md:space-y-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-memorial-gold/30 border-t-memorial-gold dark:border-memorialDark-gold/30 dark:border-t-memorialDark-gold rounded-full animate-spin" />
                            <p className="mt-4 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                Loading messages...
                            </p>
                        </div>
                    ) : messages && messages.length > 0 ? (
                        <>
                            {displayedMessages.map((msg, index) => (
                                <motion.div
                                    key={msg.id || index}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="memorial-card p-4 md:p-6"
                                >
                                    {/* Author Info */}
                                    <div className="flex items-start gap-3">
                                        {/* Avatar with Role Initial */}
                                        <div className="w-10 h-10 rounded-full bg-memorial-gold/20 dark:bg-memorialDark-gold/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-memorial-gold dark:text-memorialDark-gold font-semibold text-sm">
                                                {getRoleInitial(msg.role)}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-memorial-text dark:text-memorialDark-text">
                                                        {msg.author_name}
                                                    </h4>
                                                    {msg.role && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-memorial-gold/10 dark:bg-memorialDark-gold/10 text-memorial-gold dark:text-memorialDark-gold">
                                                            {msg.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <time
                                                    dateTime={msg.created_at}
                                                    className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary whitespace-nowrap"
                                                >
                                                    {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </time>
                                            </div>
                                            <p className="text-sm md:text-base text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {messages.length > 3 && (
                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="inline-flex items-center justify-center px-6 py-2 border border-memorial-gold dark:border-memorialDark-gold text-memorial-gold dark:text-memorialDark-gold rounded-full hover:bg-memorial-gold hover:text-white dark:hover:bg-memorialDark-gold dark:hover:text-black transition-all duration-300 text-sm font-medium"
                                    >
                                        {isExpanded ? 'View Less' : `View All (${messages.length})`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                            <Heart size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Be the first to share a memory</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 ${isOpen
                    ? 'bg-memorial-text dark:bg-memorialDark-text'
                    : 'bg-memorial-gold dark:bg-memorialDark-gold'
                    }`}
                aria-label={isOpen ? 'Close guestbook form' : 'Open guestbook form'}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
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
                            <MessageCircle size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Floating Form Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
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
                                        <Heart size={20} className="text-memorial-gold dark:text-memorialDark-gold" />
                                        Share a Memory
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
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
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-gold dark:focus:border-memorialDark-gold transition-colors duration-200 text-sm"
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
                                            Your Relationship
                                        </label>
                                        <select
                                            id="floating-role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-gold dark:focus:border-memorialDark-gold transition-colors duration-200 text-sm"
                                        >
                                            {ROLES.map((role) => (
                                                <option
                                                    key={role.value}
                                                    value={role.value}
                                                    disabled={isRoleDisabled(role.value)}
                                                >
                                                    {role.label} {isRoleDisabled(role.value) ? '(Already claimed)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {takenRoles.length > 0 && (
                                            <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-1">
                                                Unique roles (Mom, Dad, Spouse) can only be claimed once.
                                            </p>
                                        )}
                                    </div>

                                    {/* Message Textarea */}
                                    <div>
                                        <label
                                            htmlFor="floating-message"
                                            className="block text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2"
                                        >
                                            Your Message *
                                        </label>
                                        <textarea
                                            id="floating-message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-memorial bg-memorial-bg dark:bg-memorialDark-bg border border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text focus:border-memorial-gold dark:focus:border-memorialDark-gold transition-colors duration-200 resize-none text-sm"
                                            placeholder="Share a memory or message..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.name.trim() || !formData.message.trim()}
                                        className="w-full px-6 py-3 bg-memorial-gold dark:bg-memorialDark-gold text-white rounded-memorial hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Share Memory
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
