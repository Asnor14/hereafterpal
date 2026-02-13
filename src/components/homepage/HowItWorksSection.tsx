'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
    {
        number: "01",
        title: "Create Account",
        description: "Sign up in seconds and choose your memorial plan. Secure, private, and dignified."
    },
    {
        number: "02",
        title: "Curate Memories",
        description: "Upload photos, videos, and stories. Organize them into chapters to tell a structured life story."
    },
    {
        number: "03",
        title: "Share Legacy",
        description: "Invite family to contribute. Keep the memory alive together in a dedicated digital sanctuary."
    }
];

export default function HowItWorksSection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <LazyMotion features={domAnimation}>
            <section id="how-it-works" ref={ref} className="py-20 md:py-32 bg-memorial-bg dark:bg-memorialDark-bg relative">
                <div className="container mx-auto px-6 md:px-12 relative z-10">

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="mb-20 max-w-2xl"
                    >
                        <span className="text-xs md:text-sm uppercase tracking-widest text-memorial-accent font-medium block mb-6">
                            Process
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-6">
                            How it works
                        </h2>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        {steps.map((step, index) => (
                            <m.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 + (index * 0.2) }}
                                className={`
                                    relative p-8 md:p-12 border-memorial-border/30 bg-memorial-bg dark:bg-memorialDark-surface
                                    ${index !== steps.length - 1 ? 'md:border-r border-b md:border-b-0' : ''}
                                `}
                            >
                                <span className="text-6xl md:text-8xl font-serif text-memorial-surfaceAlt dark:text-memorialDark-surfaceAlt2 font-bold absolute top-4 right-6 opacity-50 select-none">
                                    {step.number}
                                </span>

                                <div className="relative z-10 pt-12">
                                    <h3 className="text-xl md:text-2xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed mb-8">
                                        {step.description}
                                    </p>
                                </div>
                            </m.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center md:text-left">
                        <m.button
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 1, duration: 0.5 }}
                            onClick={() => router.push('/login?signup=true')}
                            className="h-14 px-8 bg-memorial-text dark:bg-memorialDark-text text-memorial-bg dark:text-memorialDark-bg rounded-md text-sm md:text-base font-medium tracking-wide flex items-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            Start Building <ArrowRight size={18} />
                        </m.button>
                    </div>

                </div>
            </section>
        </LazyMotion>
    );
}
