'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Loader2 } from 'lucide-react';

interface Subscription {
    id: string;
    user_id: string;
    plan: string;
    status: string;
    start_date: string;
    end_date: string | null;
    expiry_date: string | null;
    auto_renew: boolean;
    created_at: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/subscriptions?status=${statusFilter}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSubscriptions(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch subscriptions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [statusFilter]);

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.plan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (d: string | null | undefined) => {
        if (!d || d === 'N/A') return 'N/A';
        return new Date(d).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text">Subscriptions</h1>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">Monitor user plans and subscription status.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-memorialDark-surface p-4 rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-memorial-textSecondary dark:text-memorialDark-textSecondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search by user ID or plan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-memorial-borderLight dark:border-memorialDark-border bg-memorial-bg dark:bg-memorialDark-surfaceAlt text-memorial-text dark:text-memorialDark-text focus:outline-none focus:ring-2 focus:ring-memorial-accent transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-memorial-textSecondary dark:text-memorialDark-textSecondary" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
                        className="px-4 py-2 rounded-lg border border-memorial-borderLight dark:border-memorialDark-border bg-memorial-bg dark:bg-memorialDark-surfaceAlt text-memorial-text dark:text-memorialDark-text focus:outline-none focus:ring-2 focus:ring-memorial-accent transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-memorialDark-surface rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-memorial-accent" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-memorial-bg dark:bg-memorialDark-bg border-b border-memorial-borderLight dark:border-memorialDark-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Auto-Renew</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-memorial-borderLight dark:divide-memorialDark-divider">
                                {filteredSubscriptions.length > 0 ? (
                                    filteredSubscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {sub.user_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${sub.plan === 'free'
                                                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    }`}>
                                                    {sub.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${sub.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : sub.status === 'expired'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {formatDate(sub.start_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {formatDate(sub.end_date || sub.expiry_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {sub.auto_renew ? 'Yes' : 'No'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                            No subscriptions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
