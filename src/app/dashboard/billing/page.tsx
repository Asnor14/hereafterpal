'use client';

import { useState, useEffect } from 'react';
import { Receipt, Upload, Clock, CheckCircle, XCircle, Loader2, Crown, RefreshCw, Calendar, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReceiptUploader from '@/components/ReceiptUploader';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Subscription {
    id: string;
    plan: string;
    status: string;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
}

const planDisplayNames: Record<string, string> = {
    free: 'Free Trial',
    eternal_echo: 'Eternal Echo',
    paws: 'Paws But Not Forgotten',
};

const planColors: Record<string, { bg: string; text: string; accent: string; bar: string }> = {
    free: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', accent: 'border-gray-300 dark:border-gray-700', bar: 'bg-gray-400' },
    eternal_echo: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', accent: 'border-amber-400 dark:border-amber-600', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    paws: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', accent: 'border-emerald-400 dark:border-emerald-600', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
};

export default function BillingPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
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
                fetchTransactions(user.id);
                fetchSubscription(user.id);
            } else {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchTransactions = async (uid: string) => {
        try {
            const res = await fetch(`/api/transactions?user_id=${uid}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTransactions(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscription = async (uid: string) => {
        try {
            const res = await fetch(`/api/subscriptions?user_id=${uid}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setSubscription(data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
        }
    };

    const handleReceiptExtracted = async (data: any, proofUrl: string) => {
        if (!userId) {
            toast.error('Please log in first.');
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
                toast.success('Payment proof submitted! Waiting for admin approval.');
                setShowUploader(false);
                fetchTransactions(userId);
            } else {
                toast.error(result.error || 'Failed to submit payment proof.');
            }
        } catch (error) {
            toast.error('Error submitting payment.');
        }
    };

    // Calculate subscription progress
    const getSubscriptionProgress = () => {
        if (!subscription || !subscription.start_date || !subscription.end_date) {
            return { daysLeft: 0, totalDays: 0, percentage: 0 };
        }

        const now = new Date();
        const start = new Date(subscription.start_date);
        const end = new Date(subscription.end_date);

        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const elapsed = totalDays - daysLeft;
        const percentage = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

        return { daysLeft, totalDays, percentage };
    };

    const progress = getSubscriptionProgress();
    const currentPlan = subscription?.plan || 'free';
    const colors = planColors[currentPlan] || planColors.free;
    const isActive = subscription?.status === 'active';
    const isExpired = progress.daysLeft <= 0 && subscription?.end_date;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return <CheckCircle className="text-green-500" size={18} />;
            case 'pending':
                return <Clock className="text-yellow-500 animate-pulse" size={18} />;
            case 'rejected':
            case 'failed':
                return <XCircle className="text-red-500" size={18} />;
            default:
                return <Clock className="text-gray-400" size={18} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text flex items-center gap-3">
                        <Receipt className="text-memorial-accent" size={28} />
                        Billing & Subscription
                    </h1>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-1">
                        Manage your plan, upload receipts, and track payments.
                    </p>
                </div>
            </div>

            {/* ── SUBSCRIPTION CARD ── */}
            <div className={`relative overflow-hidden rounded-2xl border-2 ${colors.accent} ${colors.bg} p-6 md:p-8`}>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <Crown className="w-full h-full" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Crown size={20} className={colors.text} />
                                <span className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>
                                    Current Plan
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-memorial-text dark:text-memorialDark-text">
                                {planDisplayNames[currentPlan] || currentPlan}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                        : isExpired
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {isActive ? '● Active' : isExpired ? '● Expired' : '● Free Tier'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {currentPlan === 'free' ? (
                                <Link
                                    href="/pricing"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-all font-medium shadow-md hover:shadow-lg"
                                >
                                    <Zap size={18} />
                                    Upgrade Plan
                                </Link>
                            ) : (
                                <Link
                                    href="/checkout?plan=${currentPlan}&billing=monthly"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-all font-medium shadow-md hover:shadow-lg"
                                >
                                    <RefreshCw size={18} />
                                    Renew Plan
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar — Days Remaining */}
                    {subscription?.end_date && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Subscription Period
                                </span>
                                <span className={`text-sm font-bold ${progress.daysLeft <= 7
                                        ? 'text-red-500'
                                        : progress.daysLeft <= 14
                                            ? 'text-yellow-500'
                                            : 'text-green-500'
                                    }`}>
                                    {progress.daysLeft > 0 ? `${progress.daysLeft} days left` : 'Expired'}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${progress.daysLeft <= 7
                                            ? 'bg-gradient-to-r from-red-400 to-red-600'
                                            : progress.daysLeft <= 14
                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                : colors.bar
                                        }`}
                                    style={{ width: `${100 - progress.percentage}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-1.5 text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                <span>{new Date(subscription.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>{new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    )}

                    {/* Warning when close to expiry */}
                    {progress.daysLeft > 0 && progress.daysLeft <= 7 && (
                        <div className="mt-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <Clock size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Your subscription expires in {progress.daysLeft} day{progress.daysLeft !== 1 ? 's' : ''}. Renew now to keep your features active.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── UPLOAD RECEIPT ── */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-colors font-medium shadow-md"
                >
                    <Upload size={18} />
                    Upload Receipt
                </button>
            </div>

            {showUploader && (
                <div className="bg-white dark:bg-memorialDark-surface p-6 rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border">
                    <h3 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text mb-2">
                        Submit Payment Proof
                    </h3>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-4">
                        Upload your GCash, Maya, or SeaBank receipt. Our AI will automatically extract the details.
                    </p>
                    <ReceiptUploader
                        onExtracted={handleReceiptExtracted}
                        onCancel={() => setShowUploader(false)}
                    />
                </div>
            )}

            {/* ── TRANSACTION HISTORY ── */}
            <div className="bg-white dark:bg-memorialDark-surface rounded-xl shadow-sm border border-memorial-borderLight dark:border-memorialDark-border overflow-hidden">
                <div className="p-6 border-b border-memorial-borderLight dark:border-memorialDark-border">
                    <h2 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text">
                        Transaction History
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-memorial-accent" size={32} />
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="divide-y divide-memorial-borderLight dark:divide-memorialDark-divider">
                        {transactions.map((txn) => (
                            <div key={txn.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-memorial-bg dark:hover:bg-memorialDark-bg transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    {getStatusIcon(txn.status)}
                                    <div>
                                        <p className="font-medium text-memorial-text dark:text-memorialDark-text">
                                            {txn.currency} {txn.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                            {txn.payment_method} • {txn.reference_no}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${txn.status === 'approved' || txn.status === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : txn.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {txn.status}
                                    </span>
                                    <span>{txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <Receipt className="mx-auto mb-3 text-memorial-textTertiary dark:text-memorialDark-textTertiary" size={40} />
                        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary font-medium">
                            No transactions yet
                        </p>
                        <p className="text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary mt-1">
                            Upload a receipt to submit your first payment proof.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
