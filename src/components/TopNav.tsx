'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquareHeart, Menu, Bell, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import SearchBar from './SearchBar';

export default function TopNav({ user, onSignOut, onMenuClick }) {
    const [scrolled, setScrolled] = useState(false);
    const [notificationCount] = useState(0); // UI only for now
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Handle scroll for nav shadow
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`top-nav-bar ${scrolled ? 'top-nav-scrolled' : ''}`}>
            <div className="top-nav-container">
                {/* Left Section */}
                <div className="top-nav-left">
                    <button
                        className="menu-toggle relative z-[60] cursor-pointer"
                        onClick={onMenuClick}
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/dashboard" className="top-nav-logo">
                        <MessageSquareHeart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
                        <span className="top-nav-logo-text">
                            <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
                        </span>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="top-nav-right">
                    {/* Notifications */}
                    <button className="top-nav-icon-btn" aria-label="Notifications">
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Profile Dropdown */}
                    {user && <ProfileDropdown user={user} onSignOut={onSignOut} />}
                </div>
            </div>
        </nav>
    );
}
