'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Loader2, ShieldCheck, LogOut, LayoutDashboard, Users, Database } from 'lucide-react';
import Link from 'next/link';

const ADMIN_EMAILS = ['asnor023@gmail.com', 'hereafterpal104@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            if (!ADMIN_EMAILS.includes(session.user.email ?? '')) {
                router.push('/dashboard'); // Redirect non-admins to user dashboard
                return;
            }

            setUser(session.user);
            setLoading(false);
        };

        checkUser();
    }, [router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg flex">
            {/* Sidebar */}
            <aside className="w-64 bg-memorial-surface dark:bg-memorialDark-surface shadow-md flex-shrink-0 hidden md:flex flex-col border-r border-memorial-borderLight dark:border-memorialDark-border">
                <div className="p-6 border-b border-memorial-borderLight dark:border-memorialDark-border flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-memorial-accent" />
                    <span className="font-bold text-xl text-memorial-text dark:text-memorialDark-text">Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-memorial-accent/10 dark:bg-memorialDark-accent/10 text-memorial-accent dark:text-memorialDark-accent font-medium">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <div className="text-xs font-semibold text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase tracking-wider mt-6 mb-2 px-4">
                        Management
                    </div>

                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors">
                        <Users size={20} />
                        Users
                    </Link>

                    {/* Transactions Dropdown */}
                    <div className="space-y-1">
                        <details className="group">
                            <summary className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors cursor-pointer list-none">
                                <div className="flex items-center gap-3">
                                    <Database size={20} /> {/* Reusing Database icon for Billing/Transactions for now or use CreditCard if avail */}
                                    <span>Billing</span>
                                </div>
                                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </summary>
                            <div className="pl-11 pr-4 py-2 space-y-2">
                                <Link href="/admin/transactions" className="block text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary hover:text-memorial-accent dark:hover:text-memorialDark-accent transition-colors">
                                    Transactions
                                </Link>
                                <Link href="/admin/subscriptions" className="block text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary hover:text-memorial-accent dark:hover:text-memorialDark-accent transition-colors">
                                    Subscriptions
                                </Link>
                            </div>
                        </details>
                    </div>
                </nav>

                <div className="p-4 border-t border-memorial-borderLight dark:border-memorialDark-border">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
