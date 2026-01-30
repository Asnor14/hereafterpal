'use client';

import { useState, useEffect } from 'react';
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
    HelpCircle,
    CreditCard,
    X,
} from 'lucide-react';

// Navigation items configuration
const mainNavItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Memorials', icon: Heart, badge: null },
    { href: '/create-memorial', label: 'Create Memorial', icon: Plus, highlight: true },
];

const featureItems = [
    { href: '#', label: 'Memory Lane', icon: Image, disabled: true },
    { href: '#', label: 'Letters of Love', icon: Mail, disabled: true },
    { href: '#', label: 'Pick-A-Mood', icon: Volume2, disabled: true },
];

const moreItems = [
    { href: '/account', label: 'Settings', icon: Settings },
    { href: '#', label: 'Help & Support', icon: HelpCircle, disabled: true },
    { href: '/pricing', label: 'Upgrade Plan', icon: CreditCard },
];

function SidebarSection({ title, children }) {
    return (
        <div className="sidebar-section">
            <h3 className="sidebar-section-title">{title}</h3>
            <div className="sidebar-section-content">{children}</div>
        </div>
    );
}

function SidebarItem({ href, label, icon: Icon, badge, highlight, disabled, active, onClick }) {
    const content = (
        <>
            <Icon size={20} className="sidebar-item-icon" />
            <span className="sidebar-item-label">{label}</span>
            {badge && <span className="sidebar-item-badge">{badge}</span>}
        </>
    );

    const className = `sidebar-item ${active ? 'sidebar-item-active' : ''} ${highlight ? 'sidebar-item-highlight' : ''} ${disabled ? 'sidebar-item-disabled' : ''}`;

    if (disabled) {
        return (
            <div className={className} title="Coming soon">
                {content}
            </div>
        );
    }

    return (
        <Link href={href} className={className} onClick={onClick}>
            {content}
        </Link>
    );
}

function UserCard({ user }) {
    const getInitials = (email) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    };

    return (
        <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
                <span>{getInitials(user?.email)}</span>
            </div>
            <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="sidebar-user-plan">Free Plan</p>
            </div>
        </div>
    );
}

export default function LeftSidebar({ user, isOpen, onClose }) {
    const pathname = usePathname();

    const isActive = (href, label) => {
        if (label === 'Memorials' && pathname === '/dashboard') return true;
        if (label === 'Home' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    const sidebarContent = (
        <>
            {/* User Quick Access */}
            <div className="sidebar-header">
                <UserCard user={user} />
            </div>

            {/* Main Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-nav-group">
                    {mainNavItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            active={isActive(item.href, item.label)}
                            onClick={onClose}
                        />
                    ))}
                </div>

                <SidebarSection title="Features">
                    {featureItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            active={isActive(item.href, item.label)}
                            onClick={onClose}
                        />
                    ))}
                </SidebarSection>

                <SidebarSection title="More">
                    {moreItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            active={isActive(item.href, item.label)}
                            onClick={onClose}
                        />
                    ))}
                </SidebarSection>
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                    <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
                </p>
                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary mt-1">
                    © 2026 All rights reserved
                </p>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar - Fixed */}
            <aside className="left-sidebar">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar - Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="sidebar-backdrop"
                        />

                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="mobile-sidebar"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="mobile-sidebar-close"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>

                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
