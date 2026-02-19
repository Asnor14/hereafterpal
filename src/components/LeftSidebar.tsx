'use client';

import React, { useState, useEffect, memo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Heart,
    Image,
    Mail,
    Volume2,
    Settings,
    HelpCircle,
    CreditCard,
    X,
    Home,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { canAccess, Feature, getMemorialLimit } from '@/lib/planFeatures';

// ... (imports remain same, just adding Chevrons above)

// Navigation items configuration
const mainNavItems = [
    { href: '/dashboard', label: 'Home', icon: Home, badge: null },
    { href: '/memorials', label: 'Memorials', icon: Heart, badge: null },
    { href: '/create-memorial', label: 'Create Memorial', icon: Plus, highlight: true },
];

const featureItems = [
    { href: '/memorials', label: 'Memory Lane', icon: Image, featureKey: 'memory_lane' as const },
    { href: '/memorials', label: 'Letters of Love', icon: Mail, featureKey: 'letters_of_love' as const },
    { href: '/memorials', label: 'Pick-A-Mood', icon: Volume2, featureKey: 'pick_a_mood' as const },
];

const moreItems = [
    { href: '/account', label: 'Settings', icon: Settings },
    { href: '#', label: 'Help & Support', icon: HelpCircle, disabled: true },
    { href: '/pricing', label: 'Upgrade Plan', icon: CreditCard },
];

function SidebarSection({ title, children, defaultOpen = true }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="sidebar-section">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="sidebar-section-title w-full flex items-center justify-between group cursor-pointer hover:text-memorial-accent dark:hover:text-memorialDark-accent transition-colors"
            >
                {title}
                {isOpen ? (
                    <ChevronDown size={14} className="opacity-50 group-hover:opacity-100" />
                ) : (
                    <ChevronRight size={14} className="opacity-50 group-hover:opacity-100" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="sidebar-section-content pt-1">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SidebarItem({ href, label, icon: Icon, badge, highlight, disabled = false, active, onClose }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: string | null; highlight?: boolean; disabled?: boolean; active: boolean; onClose?: () => void }) {
    const content = (
        <>
            <Icon size={18} className="sidebar-item-icon" />
            <span className="sidebar-item-label">{label}</span>
            {badge && <span className="sidebar-item-badge">{badge}</span>}
        </>
    );

    const className = `sidebar-item ${active ? 'sidebar-item-active' : ''} ${highlight ? 'sidebar-item-highlight' : ''} ${disabled ? 'sidebar-item-disabled' : ''}`;

    const handleClick = () => {
        // Only close sidebar on mobile (when onClose is provided and sidebar is open)
        if (onClose && typeof window !== 'undefined' && window.innerWidth < 768) {
            onClose();
        }
    };

    if (disabled) {
        return (
            <div className={className} title="Coming soon">
                {content}
            </div>
        );
    }

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {content}
        </Link>
    );
}

function UserCard({ user, plan }: { user: any, plan: string | null }) {
    if (!user) return null;
    const planName = plan === 'eternal_echo' ? 'Eternal Echo' : plan === 'paws' ? 'Paws Plan' : 'Free Plan';

    return (
        <div className="p-4 border-t border-memorial-border dark:border-memorialDark-border bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center text-memorial-accent dark:text-memorialDark-accent font-semibold">
                    {user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text truncate">
                        {user.email}
                    </p>
                    <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary truncate">
                        {planName}
                    </p>
                </div>
            </div>
        </div>
    );
}

function LeftSidebar({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [memorialCount, setMemorialCount] = useState<number>(0);

    // Fetch user plan and memorial count
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                // Fetch Plan
                const subRes = await fetch(`/api/subscriptions?user_id=${user.id}`);
                if (subRes.ok) {
                    const data = await subRes.json();
                    if (Array.isArray(data) && data.length > 0 && data[0].status === 'active') {
                        setUserPlan(data[0].plan);
                    } else {
                        setUserPlan('free');
                    }
                } else {
                    setUserPlan('free');
                }

                // Fetch Memorial Count
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { count, error } = await supabase
                    .from('memorials')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (!error && count !== null) {
                    setMemorialCount(count);
                }
            } catch (err) {
                console.error('Error fetching sidebar data:', err);
                setUserPlan('free');
            }
        };
        fetchData();
    }, [user?.id]);

    const isActive = (path: string, label: string) => {
        if (path === '/memorials' && label !== 'Memorials') return false; // Don't highlight features on memorial list
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const toggleMobileSidebar = () => isOpen ? onClose() : null;
    const closeMobileSidebar = onClose;

    // Calculate Limits
    const memorialLimit = getMemorialLimit(userPlan);
    const canCreateMemorial = memorialCount < memorialLimit;

    const sidebarContent = (
        <>
            {/* Main Navigation */}
            <nav className="sidebar-nav">
                <SidebarSection title="Menu">
                    {mainNavItems.map((item) => {
                        // Check for Create Memorial Limit
                        let isDisabled = false;
                        let badge = item.badge;

                        if (item.label === 'Create Memorial' && !canCreateMemorial) {
                            isDisabled = true;
                            badge = 'Limit';
                        }

                        return (
                            <SidebarItem
                                key={item.label}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={isActive(item.href, item.label)}
                                highlight={item.highlight}
                                badge={badge}
                                disabled={isDisabled}
                                onClose={closeMobileSidebar}
                            />
                        );
                    })}
                </SidebarSection>

                <SidebarSection title="Features">
                    {featureItems.map((item) => {
                        const hasAccess = canAccess(userPlan, item.featureKey);
                        return (
                            <SidebarItem
                                key={item.label}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={isActive(item.href, item.label)}
                                disabled={!hasAccess}
                                onClose={closeMobileSidebar}
                                badge={!hasAccess ? 'Locked' : null}
                            />
                        );
                    })}
                </SidebarSection>

                <SidebarSection title="Account">
                    {moreItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            active={isActive(item.href, item.label)}
                            onClose={closeMobileSidebar}
                        />
                    ))}
                </SidebarSection>
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-auto pt-6 px-2 pb-2">
                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                    <span className="font-serif">H</span>ereafter, <span className="font-serif">P</span>al
                </p>
                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary mt-1">
                    © 2026 All rights reserved
                </p>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-memorial-border dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface transition-colors z-30">
                <div className="p-6">
                    <Link href="/dashboard" className="block">
                        <h1 className="text-2xl font-serif text-memorial-text dark:text-memorialDark-text tracking-tight">
                            HereAfter<span className="text-memorial-accent dark:text-memorialDark-accent">Pal</span>
                        </h1>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-6 flex flex-col">
                    {sidebarContent}
                </div>

                {/* User Profile Card */}
                <UserCard user={user} plan={userPlan} />
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
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 w-64 h-full bg-memorial-surface dark:bg-memorialDark-surface z-50 overflow-y-auto flex flex-col md:hidden border-r border-memorial-border dark:border-memorialDark-border"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-memorial-border dark:border-memorialDark-border">
                                <Link href="/dashboard" onClick={onClose}>
                                    <h1 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text tracking-tight">
                                        HereAfter<span className="text-memorial-accent dark:text-memorialDark-accent">Pal</span>
                                    </h1>
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-md hover:bg-memorial-bg dark:hover:bg-memorialDark-bg text-memorial-textSecondary dark:text-memorialDark-textSecondary"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 space-y-6 py-6 flex flex-col">
                                {sidebarContent}
                            </div>

                            <UserCard user={user} plan={userPlan} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default memo(LeftSidebar);
