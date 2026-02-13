'use client';

import { useState, useEffect } from 'react';
import { Check, X, Search, MoreVertical, Database, Shield, Zap, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock Data for Users
interface AdminUser {
    id: string;
    email: string;
    plan: 'Free' | 'Eternal Echo' | 'Paws But Not Forgotten';
    status: 'Active' | 'Pending' | 'Rejected';
    storageUsed: string;
    lastLogin: string;
    joinedDate: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, statsRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/stats')
                ]);

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    if (Array.isArray(usersData)) {
                        setUsers(usersData);
                    }
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleApprove = (id: string) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, status: 'Active' } : user
        ));
        toast.success('User plan approved successfully.');
    };

    const handleReject = (id: string) => {
        if (confirm('Are you sure you want to reject this user?')) {
            setUsers(users.map(user =>
                user.id === id ? { ...user, status: 'Rejected' } : user
            ));
            toast.error('User plan rejected.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <h1 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-memorialDark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-memorialDark-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-memorial-accent/10 dark:bg-memorialDark-accent/10 rounded-lg text-memorial-accent dark:text-memorialDark-accent">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">Total Users</p>
                            <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text">{users.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-memorialDark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-memorialDark-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">Pending Approvals</p>
                            <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text">
                                {users.filter(u => u.status === 'Pending').length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-memorialDark-surface p-6 rounded-xl shadow-sm border border-gray-200 dark:border-memorialDark-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">System Storage</p>
                            <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text">
                                {stats ? formatBytes(stats.storage?.usage || stats.usage || 0) : 'Loading...'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-memorialDark-surface rounded-xl shadow-sm border border-gray-200 dark:border-memorialDark-border overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-memorialDark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-memorial-text dark:text-memorialDark-text">User Management</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-memorial-textSecondary dark:text-memorialDark-textSecondary" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-memorialDark-border bg-gray-50 dark:bg-memorialDark-surfaceAlt text-memorial-text dark:text-memorialDark-text focus:outline-none focus:ring-2 focus:ring-memorial-accent transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-memorial-bg dark:bg-memorialDark-bg border-b border-gray-200 dark:border-memorialDark-border">
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Storage</th>
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-memorialDark-divider">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 text-memorial-accent dark:text-memorialDark-accent flex items-center justify-center font-bold text-xs">
                                                    {user.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.plan === 'Free'
                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : user.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {user.status === 'Pending' && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-pulse" />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary font-mono">
                                            {user.storageUsed}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="p-2 text-memorial-textTertiary hover:text-memorial-text dark:text-memorialDark-textTertiary dark:hover:text-memorialDark-text transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Visual Only) */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-memorialDark-border flex items-center justify-between">
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 dark:border-memorialDark-border rounded-md text-sm disabled:opacity-50 text-memorial-text dark:text-memorialDark-text" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-300 dark:border-memorialDark-border rounded-md text-sm disabled:opacity-50 text-memorial-text dark:text-memorialDark-text" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
