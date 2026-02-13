'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Check, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import ReceiptUploader from '@/components/ReceiptUploader';

interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'approved' | 'rejected';
    payment_method: string;
    reference_no: string;
    proof_url?: string;
    created_at: string;
    updated_at: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showUploader, setShowUploader] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
            fetchTransactions();
        };
        init();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch(`/api/transactions?status=${statusFilter}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTransactions(data);
                }
            } else {
                const errorData = await res.json();
                console.error('Fetch transactions error:', errorData);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        setUpdatingId(id);
        try {
            // 1. Update transaction status
            const res = await fetch('/api/transactions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                setTransactions(prev =>
                    prev.map(t => t.id === id ? { ...t, status: newStatus } : t)
                );
                toast.success(`Transaction ${newStatus} successfully.`);

                // 2. If approved, also activate the user's subscription
                if (newStatus === 'approved') {
                    const txn = transactions.find(t => t.id === id);
                    if (txn?.user_id) {
                        const now = new Date();
                        const endDate = new Date(now);
                        endDate.setDate(endDate.getDate() + 30); // 30-day subscription

                        const subRes = await fetch('/api/subscriptions', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: txn.user_id,
                                status: 'active',
                                start_date: now.toISOString(),
                                end_date: endDate.toISOString(),
                            }),
                        });

                        if (subRes.ok) {
                            toast.success('Subscription activated for 30 days!');
                        } else {
                            const subText = await subRes.text();
                            console.error('Subscription activation error (status ' + subRes.status + '):', subText);
                            toast.error('Transaction approved but subscription activation failed.');
                        }
                    }
                }
            } else {
                const errData = await res.json();
                toast.error(`Failed: ${errData.error}`);
            }
        } catch (error) {
            toast.error('Network error updating transaction.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReceiptExtracted = async (data: any, proofUrl: string) => {
        if (!userId) {
            toast.error('Could not determine your user ID. Please re-login.');
            return;
        }

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    amount: data.amount,
                    currency: data.currency || 'PHP',
                    payment_method: data.payment_method,
                    reference_no: data.reference_no,
                    status: 'pending',
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Transaction added from receipt!');
                setShowUploader(false);
                fetchTransactions();
            } else {
                toast.error(`Failed: ${result.error}`);
                console.error('Save transaction error:', result);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error('Error saving transaction.');
        }
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch =
            (txn.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.payment_method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return styles[status] || styles.pending;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text">Transactions</h1>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        Manage payments and approve transaction proofs.
                    </p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-colors font-medium"
                >
                    <Plus size={18} />
                    Upload Receipt
                </button>
            </div>

            {/* Receipt Uploader */}
            {showUploader && (
                <div className="bg-white dark:bg-memorialDark-surface p-6 rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border">
                    <h3 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text mb-4">
                        Upload & Extract Receipt
                    </h3>
                    <ReceiptUploader
                        onExtracted={handleReceiptExtracted}
                        onCancel={() => setShowUploader(false)}
                    />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-memorialDark-surface p-4 rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-memorial-textSecondary dark:text-memorialDark-textSecondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search by reference, method, or ID..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
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
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Reference No.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-memorial-textSecondary dark:text-memorialDark-textSecondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-memorial-borderLight dark:divide-memorialDark-divider">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {txn.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                                                {txn.currency} {txn.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(txn.status)}`}>
                                                    {txn.status === 'pending' && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-pulse" />}
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {txn.payment_method}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {txn.reference_no}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                                {txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {txn.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(txn.id, 'approved')}
                                                            disabled={updatingId === txn.id}
                                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                                                            title="Approve Payment"
                                                        >
                                                            {updatingId === txn.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(txn.id, 'rejected')}
                                                            disabled={updatingId === txn.id}
                                                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                                                            title="Reject Payment"
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs font-medium capitalize ${txn.status === 'approved' || txn.status === 'completed'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {txn.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                            {searchTerm ? `No transactions matching "${searchTerm}"` : 'No transactions yet. Upload a receipt to get started.'}
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
