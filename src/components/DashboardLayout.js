'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Navbar } from './Navbar';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-memorial-bg dark:bg-memorialDark-bg">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-memorial-accent/30 border-t-memorial-accent dark:border-memorialDark-accent/30 dark:border-t-memorialDark-accent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg">
            {/* Top Navigation */}
            <Navbar
                isDashboard={true}
                user={user}
                onSignOut={handleSignOut}
                onMenuClick={() => setSidebarOpen(true)}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="dashboard-container">
                <div className="dashboard-content">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <BottomNav />
        </div>
    );
}
