'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropdown({ user, onSignOut }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const getInitials = (email) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    };

    const handleSignOut = () => {
        setIsOpen(false);
        onSignOut();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors duration-200"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-memorial-accent dark:bg-memorialDark-accent flex items-center justify-center">
                    <span className="text-white dark:text-memorialDark-bg text-sm font-medium">
                        {getInitials(user?.email)}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-memorial-textSecondary dark:text-memorialDark-textSecondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="profile-dropdown"
                    >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-memorial-borderLight dark:border-memorialDark-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-memorial-accent dark:bg-memorialDark-accent flex items-center justify-center">
                                    <span className="text-white dark:text-memorialDark-bg font-medium">
                                        {getInitials(user?.email)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text truncate">
                                        {user?.email || 'User'}
                                    </p>
                                    <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                        Free Plan
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <Link
                                href="/account"
                                onClick={() => setIsOpen(false)}
                                className="profile-dropdown-item"
                            >
                                <User size={18} className="text-memorial-textSecondary dark:text-memorialDark-textSecondary" />
                                <span>My Profile</span>
                            </Link>

                            <Link
                                href="/account"
                                onClick={() => setIsOpen(false)}
                                className="profile-dropdown-item"
                            >
                                <Settings size={18} className="text-memorial-textSecondary dark:text-memorialDark-textSecondary" />
                                <span>Account Settings</span>
                            </Link>

                            <a
                                href="#"
                                className="profile-dropdown-item"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsOpen(false);
                                }}
                            >
                                <HelpCircle size={18} className="text-memorial-textSecondary dark:text-memorialDark-textSecondary" />
                                <span>Help & Support</span>
                            </a>
                        </div>

                        {/* Sign Out */}
                        <div className="py-2 border-t border-memorial-borderLight dark:border-memorialDark-border">
                            <button
                                onClick={handleSignOut}
                                className="profile-dropdown-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
