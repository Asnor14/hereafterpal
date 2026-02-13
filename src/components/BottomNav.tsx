'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Plus, User } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Memorials', icon: Heart },
    { href: '/create-memorial', label: 'Create', icon: Plus, isPrimary: true },
    { href: '/account', label: 'Profile', icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (href, label) => {
        if (label === 'Memorials' && pathname === '/dashboard') return true;
        if (label === 'Home' && pathname === '/') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <nav className="bottom-nav">
            <div className="grid grid-cols-4 h-full">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.label);

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="w-12 h-12 -mt-4 rounded-full bg-memorial-accent dark:bg-memorialDark-accent flex items-center justify-center shadow-memorial-lg">
                                    <Icon size={24} className="text-white dark:text-memorialDark-bg" />
                                </div>
                                <span className="text-[10px] mt-1 text-memorial-accent dark:text-memorialDark-accent font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
                        >
                            <Icon size={22} />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
