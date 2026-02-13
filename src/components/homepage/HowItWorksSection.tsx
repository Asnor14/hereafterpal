'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, ImagePlus, Share2 } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: "1. Create Account",
        description: "Sign up in seconds and choose your memorial plan. It's safe, private, and secure.",
        direction: "left"
    },
    {
        icon: ImagePlus,
        title: "2. Add Memories",
        description: "Upload photos, videos, and stories. Organize them into chapters to tell their unique life story.",
        direction: "up"
    },
    {
        icon: Share2,
        title: "3. Share & Collaborate",
        description: "Invite family to contribute. Moderate content and keep the memory alive together.",
        direction: "right"
    }
];

export default function HowItWorksSection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const arrowVariants = {
        hidden: { opacity: 0, pathLength: 0 },
        visible: {
            opacity: 1,
            pathLength: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <section id="how-it-works" ref={ref} className="py-24 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="text-memorial-accent font-medium uppercase tracking-wider text-sm mb-2 block">
                            Simple Process
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-memorial-text dark:text-memorialDark-text">
                            How It Works
                        </h2>
                    </m.div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Desktop Arrows connecting items (Decorative SVG) */}
                        <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 pointer-events-none hidden md:block z-0 opacity-20 dark:opacity-10 text-memorial-text">
                            <svg width="100%" height="100%" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <m.path
                                    d="M200,50 C350,50 350,50 500,50 C650,50 650,50 800,50"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="10 10"
                                    variants={arrowVariants}
                                    initial="hidden"
                                    animate={isInView ? "visible" : "hidden"}
                                />
                            </svg>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {steps.map((step, index) => (
                                <m.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 + (index * 0.2) }}
                                    className="flex flex-col items-center text-center group"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 rounded-full bg-white dark:bg-memorialDark-surface shadow-md flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 border border-memorial-border">
                                            <step.icon size={32} className="text-memorial-accent" />
                                        </div>
                                        <div className="absolute inset-0 bg-memorial-accent/10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                                    </div>

                                    <h3 className="text-xl font-bold text-memorial-text dark:text-memorialDark-text mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed max-w-xs">
                                        {step.description}
                                    </p>
                                </m.div>
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <m.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: 1, duration: 0.5 }}
                                onClick={() => router.push('/login?signup=true')}
                                className="btn-primary px-8 py-3 text-lg"
                            >
                                Get Started Today
                            </m.button>
                        </div>
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
