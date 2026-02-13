'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import TopNav from './TopNav';
import LeftSidebar from './LeftSidebar';
import BottomNav from './BottomNav';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please log in to access the dashboard.');
                router.push('/login');
                return;
            }
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                router.push('/login');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleSignOut = async () => {
        const toastId = toast.loading('Signing out...');
        await supabase.auth.signOut();
        toast.dismiss(toastId);
        toast.success('Signed out successfully!');
        router.push('/');
    };

    // Force dark mode for dashboard
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            // Optionally remove on unmount if needed
            // document.documentElement.classList.remove('dark');
        };
    }, []);

    // Handle sidebar keyboard shortcut (Cmd/Ctrl + B)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                setSidebarOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-memorial-bg dark:bg-memorialDark-bg">
                <div className="text-center">
                    <div className="loading-spinner" />
                    <p className="mt-4 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            {/* Top Navigation */}
            <TopNav
                user={user}
                onSignOut={handleSignOut}
                onMenuClick={() => setSidebarOpen(true)}
            />

            {/* Dashboard Container */}
            <div className="dashboard-container">
                {/* Left Sidebar */}
                <LeftSidebar
                    user={user}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content */}
                <main className="main-content">
                    <div className="content-inner">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <BottomNav />
        </div>
    );
}
