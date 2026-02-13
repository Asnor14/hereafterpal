'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { pricingPlans } from '@/app/pricing/data';

export default function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleSelectPlan = async (planKey: string) => {
        if (!user) {
            toast.error('Please log in to select a plan.');
            router.push('/login');
            return;
        }

        if (planKey === 'free') {
            router.push('/create-memorial');
        } else {
            router.push(`/checkout?plan=${planKey}&billing=${billingCycle}`);
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <section id="pricing" className="py-20 md:py-32 bg-memorial-bg dark:bg-memorialDark-bg border-t border-memorial-border/20 dark:border-memorialDark-border/10">
                <div className="container mx-auto px-6 md:px-12">
                    {/* Header */}
                    <div className="text-center mb-16 md:mb-24">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-xs md:text-sm uppercase tracking-widest text-memorial-accent font-medium block mb-4">
                                Investment
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-6">
                                Choose Your Plan
                            </h2>
                            <p className="text-base md:text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto leading-relaxed">
                                Select the plan that best honors your loved one's memory. All plans include our core features with no hidden recurring fees.
                            </p>
                        </m.div>

                        {/* Billing Toggle - Architectural Style */}
                        <m.div
                            className="flex justify-center mt-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="inline-flex p-1 bg-memorial-surfaceAlt/30 dark:bg-memorialDark-surfaceAlt/10 rounded-lg border border-memorial-border/30 backdrop-blur-sm">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-md text-xs uppercase tracking-widest font-medium transition-all duration-300 ${billingCycle === 'monthly'
                                        ? 'bg-memorial-text dark:bg-memorialDark-text text-memorial-bg dark:text-memorialDark-bg shadow-lg'
                                        : 'text-memorial-textSecondary hover:text-memorial-text'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-6 py-2 rounded-md text-xs uppercase tracking-widest font-medium transition-all duration-300 flex items-center gap-2 ${billingCycle === 'annual'
                                        ? 'bg-memorial-text dark:bg-memorialDark-text text-memorial-bg dark:text-memorialDark-bg shadow-lg'
                                        : 'text-memorial-textSecondary hover:text-memorial-text'
                                        }`}
                                >
                                    Annual
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-green-500/20 text-green-200' : 'bg-green-500/10 text-green-600'}`}>
                                        -30%
                                    </span>
                                </button>
                            </div>
                        </m.div>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-px bg-memorial-border/20 dark:bg-memorialDark-border/10 border border-memorial-border/20 dark:border-memorialDark-border/10">
                        {pricingPlans.map((plan, index) => (
                            <m.div
                                key={plan.planKey}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`
                                    relative p-8 md:p-12 bg-memorial-bg dark:bg-memorialDark-bg flex flex-col h-full
                                    ${plan.isBestValue ? 'z-10 ring-1 ring-memorial-accent/30 shadow-2xl' : ''}
                                `}
                            >
                                {plan.badge && (
                                    <div className="absolute top-0 right-8 -translate-y-1/2">
                                        <span className={`
                                            px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 shadow-sm
                                            ${plan.isBestValue
                                                ? 'bg-memorial-accent text-white'
                                                : 'bg-memorial-surfaceAlt text-memorial-textSecondary'
                                            }
                                        `}>
                                            {plan.isBestValue && <Sparkles size={10} />}
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        {plan.icon && <span className="text-2xl">{plan.icon}</span>}
                                        <h3 className="text-xl font-serif font-medium text-memorial-text dark:text-memorialDark-text tracking-tight">
                                            {plan.planName}
                                        </h3>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl md:text-5xl font-serif text-memorial-text dark:text-memorialDark-text">
                                            {billingCycle === 'annual' && plan.priceAnnual ? plan.priceAnnual : plan.price}
                                        </span>
                                        <span className="text-sm uppercase tracking-widest text-memorial-textSecondary font-medium">
                                            /{billingCycle === 'annual' && plan.frequencyAnnual ? plan.frequencyAnnual : plan.frequency}
                                        </span>
                                    </div>
                                    {billingCycle === 'annual' && plan.savings && (
                                        <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                                            {plan.savings}
                                        </p>
                                    )}
                                </div>

                                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed mb-8 border-b border-memorial-border/20 dark:border-memorialDark-border/10 pb-8">
                                    {plan.description}
                                </p>

                                <ul className="space-y-4 mb-12 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-4 text-sm text-memorial-text/90 dark:text-memorialDark-text/90">
                                            <Check size={16} className="text-memorial-accent flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.planKey)}
                                    className={`
                                        h-14 w-full flex items-center justify-center gap-2 rounded-md text-xs uppercase tracking-widest font-bold transition-all duration-300
                                        ${plan.isBestValue
                                            ? 'bg-memorial-accent text-white hover:bg-memorial-accentHover shadow-lg hover:-translate-y-0.5'
                                            : 'border border-memorial-border/50 text-memorial-text dark:text-memorialDark-text hover:bg-memorial-surfaceAlt/50'
                                        }
                                    `}
                                >
                                    {plan.planKey === 'free' ? 'Start Free Preview' : 'Select Plan'}
                                    <ArrowRight size={14} />
                                </button>
                            </m.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xs md:text-sm text-memorial-textTertiary uppercase tracking-widest">
                            Secure one-time payment. All plans include 24/7 technical support.
                        </p>
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
