'use client';

import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Image as ImageIcon, Shield, Share2, Clock, Volume2, HeartHandshake } from 'lucide-react';

const benefits = [
    {
        icon: ImageIcon,
        title: "Unlimited Archives",
        description: "Store high-resolution memories without limits. Create organized albums for different life chapters."
    },
    {
        icon: Shield,
        title: "Private & Secure",
        description: "Your data is encrypted and protected. You control who sees the memorial with flexible privacy settings."
    },
    {
        icon: Share2,
        title: "Collaborative Tribute",
        description: "Invite family and friends to contribute their own stories, photos, and condolences in a shared space."
    },
    {
        icon: Clock,
        title: "Eternal Timeline",
        description: "Build a chronological journey of their life, highlighting key milestones and cherished moments."
    },
    {
        icon: Volume2,
        title: "Voice & Audio",
        description: "Record and upload voice messages to preserve the sound of their laughter and stories."
    },
    {
        icon: HeartHandshake,
        title: "Charitable Impact",
        description: "Link to their favorite charities so visitors can donate in their honor directly from the page."
    }
];

export default function BenefitsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} id="benefits" className="py-20 md:py-32 bg-memorial-bg dark:bg-memorialDark-bg relative overflow-hidden border-y border-memorial-border/20 dark:border-memorialDark-border/10">
                <div className="container mx-auto px-6 md:px-12">

                    {/* Header - Asymmetrical Alignment */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-20 border-b border-memorial-border/30 pb-12">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="flex-1"
                        >
                            <span className="text-xs md:text-sm uppercase tracking-widest text-memorial-accent font-medium block mb-6">
                                Features
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif font-medium text-memorial-text dark:text-memorialDark-text leading-tight max-w-lg">
                                Designed for <br /> <span className="italic text-memorial-textSecondary">Permanence</span>
                            </h2>
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex-1 flex items-end"
                        >
                            <p className="text-base md:text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed max-w-xl">
                                We provide all the tools needed to create a rich, lasting tribute.
                                Every feature is built to ensure their legacy is preserved with dignity and care.
                            </p>
                        </m.div>
                    </div>

                    {/* Architectural Grid Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-memorial-border/30">
                        {benefits.map((benefit, index) => (
                            <m.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                                className="group p-8 md:p-12 border-r border-b border-memorial-border/30 hover:bg-memorial-surfaceAlt/20 transition-colors duration-300"
                            >
                                <div className="mb-8 text-memorial-text dark:text-memorialDark-text opacity-50 group-hover:opacity-100 transition-opacity">
                                    <benefit.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-4">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm md:text-base text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                                    {benefit.description}
                                </p>
                            </m.div>
                        ))}
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
