'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Plus,
    Heart,
    Image,
    Mail,
    Volume2,
    Settings,
    X,
    ChevronLeft,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/create-memorial', label: 'Create Memorial', icon: Plus },
    { href: '/dashboard', label: 'My Memorials', icon: Heart },
    { href: '#', label: 'Memory Lane', icon: Image, disabled: true },
    { href: '#', label: 'Letters of Love', icon: Mail, disabled: true },
    { href: '#', label: 'Pick-A-Mood', icon: Volume2, disabled: true },
    { href: '/account', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    const isActive = (href) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <nav className="py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <li key={item.label}>
                                    {item.disabled ? (
                                        <div
                                            className="sidebar-item opacity-50 cursor-not-allowed"
                                            title="Coming soon"
                                        >
                                            <Icon size={20} />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
                                        >
                                            <Icon size={20} />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-memorial-borderLight dark:border-memorialDark-border">
                    <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary text-center">
                        <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
                    </p>
                    <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary text-center mt-1">
                        © 2026
                    </p>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 h-full w-72 bg-memorial-surface dark:bg-memorialDark-surface z-50 md:hidden"
                        >
                            {/* Mobile Sidebar Header */}
                            <div className="flex items-center justify-between p-4 border-b border-memorial-borderLight dark:border-memorialDark-border">
                                <span className="font-serif text-lg text-memorial-text dark:text-memorialDark-text">
                                    <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-memorial hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="py-4">
                                <ul className="space-y-1">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);

                                        return (
                                            <li key={item.label}>
                                                {item.disabled ? (
                                                    <div
                                                        className="sidebar-item opacity-50 cursor-not-allowed"
                                                        title="Coming soon"
                                                    >
                                                        <Icon size={20} />
                                                        <span>{item.label}</span>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
                                                    >
                                                        <Icon size={20} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
