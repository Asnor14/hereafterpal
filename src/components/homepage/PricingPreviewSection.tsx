'use client';

import Link from 'next/link';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Free Forever",
        price: "$0",
        description: "Everything you need to create a beautiful tribute.",
        features: [
            "1GB Storage",
            "Basic Themes",
            "Guest Contributions",
            "Secure Privacy Controls"
        ],
        cta: "Start Free",
        popular: false
    },
    {
        name: "Premium Lifetime",
        price: "$49",
        description: "One-time payment. No recurring fees ever.",
        features: [
            "Unlimited Storage",
            "Premium Themes & Fonts",
            "Video & Audio Tributes",
            "Custom Domain Support",
            "Priority Support"
        ],
        cta: "View Full Pricing",
        popular: true
    }
];

export default function PricingPreviewSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} className="py-24 bg-memorial-bg dark:bg-memorialDark-bg">
                <div className="container mx-auto px-4 md:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-memorial-text dark:text-memorialDark-text mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
                            Create a lasting legacy without the burden of monthly subscriptions.
                        </p>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((plan, index) => (
                            <m.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                                className={`relative p-8 rounded-2xl border ${plan.popular
                                    ? 'bg-white dark:bg-memorialDark-surface border-memorial-accent shadow-xl scale-105 md:scale-105 z-10'
                                    : 'bg-memorial-surface dark:bg-memorialDark-surface border-memorial-border'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-memorial-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Best Value
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold text-memorial-text dark:text-memorialDark-text">
                                        {plan.price}
                                    </span>
                                    {plan.price !== '$0' && <span className="text-memorial-textSecondary">/ one-time</span>}
                                </div>
                                <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-8 px-2">
                                    {plan.description}
                                </p>

                                <ul className="space-y-4 mb-8 text-left">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-memorial-text dark:text-memorialDark-text">
                                            <Check size={18} className="text-memorial-accent flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/pricing"
                                    className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${plan.popular
                                        ? 'bg-memorial-accent text-white hover:bg-memorial-accent/90'
                                        : 'bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt text-memorial-text hover:bg-memorial-border'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </m.div>
                        ))}
                    </div>

                    <m.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-12 text-memorial-textSecondary text-sm"
                    >
                        <p>All plans include SSL security and data backup. <Link href="/pricing" className="text-memorial-accent underline">Compare features</Link></p>
                    </m.div>
                </div>
            </section>
        </LazyMotion>
    );
}
