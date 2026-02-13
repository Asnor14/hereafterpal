'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Upload, ArrowRight, Shield, QrCode, CreditCard, Banknote, Smartphone, Copy, Loader2, ImageIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

import { pricingPlans } from '@/app/pricing/data';

const paymentMethods = [
    { id: 'gcash', name: 'GCash', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'maya', name: 'Maya', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'maribank', name: 'SeaBank / Maribank', icon: Banknote, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planKey = searchParams.get('plan') || 'basic';
    const billingCycle = searchParams.get('billing') || 'monthly';

    const [selectedMethod, setSelectedMethod] = useState('gcash');
    const [step, setStep] = useState(1); // 1: Payment, 2: Upload, 3: Confirm
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const plan = pricingPlans.find(p => p.planKey === planKey) || pricingPlans[1];
    const price = billingCycle === 'annual' ? plan.priceAnnual : plan.price;

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setExtractedData(null);
        }
    };

    // Step 2 → Extract receipt data with AI
    const handleExtract = async () => {
        if (!file) {
            toast.error('Please upload your payment receipt first.');
            return;
        }

        setIsExtracting(true);

        try {
            const formData = new FormData();
            formData.append('receipt', file);

            const res = await fetch('/api/receipt/extract', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setExtractedData(result.data);
                setStep(3); // Move to confirmation step
                toast.success('Receipt data extracted!');
            } else {
                toast.error(result.error || 'Failed to read receipt. Try a clearer image.');
            }
        } catch (error) {
            console.error('Receipt extraction error:', error);
            toast.error('Failed to process receipt.');
        } finally {
            setIsExtracting(false);
        }
    };

    // Step 3 → Confirm & save transaction + subscription to Supabase
    const handleSubmit = async () => {
        if (!userId) {
            toast.error('Please log in to continue.');
            router.push('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            // Use extracted data if available, otherwise use basic info
            const transactionData = {
                user_id: userId,
                amount: extractedData?.amount || parseFloat((price || '0').replace(/[₱,]/g, '')),
                currency: extractedData?.currency || 'PHP',
                payment_method: extractedData?.payment_method || paymentMethods.find(m => m.id === selectedMethod)?.name || selectedMethod,
                reference_no: extractedData?.reference_no || `MANUAL-${Date.now()}`,
                status: 'pending',
            };

            // 1. Create transaction record
            const txnRes = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData),
            });

            const txnResult = await txnRes.json();

            if (!txnRes.ok) {
                console.error('Transaction save error:', txnResult);
                toast.error(txnResult.error || 'Failed to submit payment.');
                return;
            }

            // 2. Create pending subscription record
            const subscriptionData = {
                user_id: userId,
                plan: plan.planKey || 'free',
                status: 'pending',
            };

            console.log('📝 Sending subscription data:', subscriptionData);
            const subRes = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionData),
            });

            if (!subRes.ok) {
                const subText = await subRes.text();
                console.error('Subscription create error (status ' + subRes.status + '):', subText);
                // Don't block — transaction was saved, subscription can be manually created
            } else {
                console.log('✅ Subscription created successfully');
            }

            toast.success('Payment submitted for verification! We will review it within 24 hours.');
            router.push('/dashboard');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <Link href="/pricing" className="text-sm text-memorial-textSecondary hover:text-memorial-accent transition-colors">
                            &larr; Back to Plans
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mt-4 mb-2">
                            Complete Your Purchase
                        </h1>
                        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                            Securely upgrade to {plan.planName} Plan ({billingCycle})
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Payment Steps */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Step Indicator */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-memorial-accent' : 'text-memorial-textTertiary'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-memorial-accent bg-memorial-accent text-white' : 'border-current'}`}>
                                        {step > 1 ? <Check size={16} /> : '1'}
                                    </div>
                                    <span className="font-medium">Payment</span>
                                </div>
                                <div className="h-px bg-memorial-border flex-1 max-w-[50px]" />
                                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-memorial-accent' : 'text-memorial-textTertiary'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-memorial-accent bg-memorial-accent text-white' : 'border-current'}`}>
                                        {step > 2 ? <Check size={16} /> : '2'}
                                    </div>
                                    <span className="font-medium">Receipt</span>
                                </div>
                                <div className="h-px bg-memorial-border flex-1 max-w-[50px]" />
                                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-memorial-accent' : 'text-memorial-textTertiary'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-memorial-accent bg-memorial-accent text-white' : 'border-current'}`}>
                                        3
                                    </div>
                                    <span className="font-medium">Confirm</span>
                                </div>
                            </div>

                            {/* STEP 1: Select Payment Method */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                    className={`p-4 rounded-memorial border-2 text-left transition-all duration-200 ${selectedMethod === method.id
                                                        ? 'border-memorial-accent bg-memorial-accent/5 dark:bg-memorialDark-accent/5'
                                                        : 'border-memorial-borderLight dark:border-memorialDark-border hover:border-memorial-accent/50'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${method.bg} ${method.color}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className="font-medium text-memorial-text dark:text-memorialDark-text">
                                                        {method.name}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-borderLight dark:border-memorialDark-border rounded-memorial-xl p-6 md:p-8 text-center">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                                                Scan via {paymentMethods.find(m => m.id === selectedMethod)?.name} App
                                            </h3>
                                            <p className="text-sm text-memorial-textSecondary">
                                                Use your mobile banking app to scan the QR code below
                                            </p>
                                        </div>

                                        <div className="relative w-48 h-48 mx-auto mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center rounded-lg text-white">
                                                <QrCode size={64} />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white p-1 rounded-full shadow-md">
                                                    <Shield size={24} className="text-memorial-accent" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt p-3 rounded-lg flex items-center justify-between">
                                                <div className="text-left">
                                                    <div className="text-xs text-memorial-textTertiary">Account Name</div>
                                                    <div className="font-medium text-memorial-text dark:text-memorialDark-text">Hereafter Pal Inc.</div>
                                                </div>
                                                <button onClick={() => handleCopy('Hereafter Pal Inc.')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>

                                            <div className="bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt p-3 rounded-lg flex items-center justify-between">
                                                <div className="text-left">
                                                    <div className="text-xs text-memorial-textTertiary">Account Number</div>
                                                    <div className="font-mono font-medium text-memorial-text dark:text-memorialDark-text">0917 123 4567</div>
                                                </div>
                                                <button onClick={() => handleCopy('0917 123 4567')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="btn-primary w-full py-4 text-lg"
                                            >
                                                I've completed the payment
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Upload Receipt + AI Extract */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-borderLight dark:border-memorialDark-border rounded-memorial-xl p-6 md:p-8"
                                >
                                    <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                                        Upload Payment Receipt
                                    </h3>
                                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                        Upload your receipt screenshot. Our AI will automatically read and verify the details.
                                    </p>

                                    <div className="border-2 border-dashed border-memorial-borderLight dark:border-memorialDark-border rounded-xl p-8 text-center hover:border-memorial-accent transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                                            <div className="w-12 h-12 rounded-full bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt flex items-center justify-center">
                                                <Upload size={24} className="text-memorial-textSecondary" />
                                            </div>
                                            <div>
                                                {file ? (
                                                    <p className="font-medium text-memorial-accent">{file.name}</p>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-memorial-text dark:text-memorialDark-text">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-sm text-memorial-textSecondary">
                                                            PNG, JPG up to 5MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="btn-ghost flex-1"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleExtract}
                                            disabled={isExtracting || !file}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Analyzing Receipt...
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon size={18} />
                                                    Extract & Continue
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Confirm Extracted Data & Submit */}
                            {step === 3 && extractedData && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-borderLight dark:border-memorialDark-border rounded-memorial-xl p-6 md:p-8"
                                >
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check size={14} className="text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">
                                            Confirm Payment Details
                                        </h3>
                                    </div>

                                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                        We've extracted the following from your receipt. Please verify before submitting.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-4">
                                            <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase mb-1">Amount</p>
                                            <p className="text-xl font-bold text-memorial-text dark:text-memorialDark-text">
                                                {extractedData.currency} {extractedData.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-4">
                                            <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase mb-1">Payment Method</p>
                                            <p className="text-xl font-bold text-memorial-text dark:text-memorialDark-text">
                                                {extractedData.payment_method}
                                            </p>
                                        </div>
                                        <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-4">
                                            <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase mb-1">Reference No.</p>
                                            <p className="text-sm font-mono font-medium text-memorial-text dark:text-memorialDark-text">
                                                {extractedData.reference_no}
                                            </p>
                                        </div>
                                        <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-4">
                                            <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase mb-1">Date</p>
                                            <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                                                {extractedData.date}
                                            </p>
                                        </div>
                                        {extractedData.sender_name && (
                                            <div className="bg-memorial-bg dark:bg-memorialDark-bg rounded-lg p-4 col-span-2">
                                                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase mb-1">Sender</p>
                                                <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                                                    {extractedData.sender_name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { setStep(2); setExtractedData(null); }}
                                            className="btn-ghost flex-1"
                                        >
                                            Re-upload
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} />
                                                    Submit Payment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-borderLight dark:border-memorialDark-border rounded-memorial-xl p-6">
                                <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text mb-4">
                                    Order Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-memorial-text dark:text-memorialDark-text">{plan.planName} Plan</div>
                                            <div className="text-sm text-memorial-textSecondary capitalize">{billingCycle} billing</div>
                                        </div>
                                        <div className="font-medium text-memorial-text dark:text-memorialDark-text">
                                            {price}
                                        </div>
                                    </div>

                                    <div className="h-px bg-memorial-borderLight dark:bg-memorialDark-border" />

                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-memorial-text dark:text-memorialDark-text">Total</span>
                                        <span className="text-memorial-accent dark:text-memorialDark-accent">{price}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt p-4 rounded-lg">
                                    <Shield size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-memorial-textSecondary">
                                        Your payment is secure. We verify all transactions manually within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
