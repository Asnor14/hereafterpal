'use client';

import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Image as ImageIcon, Mail, Volume2, Shield, Share2, Smartphone, Clock, HeartHandshake } from 'lucide-react';

const benefits = [
    {
        icon: ImageIcon,
        title: "Unlimited Photos & Videos",
        description: "Store high-resolution memories without limits. Create organized albums for different life chapters."
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description: "Your data is encrypted and protected. You control who sees the memorial with flexible privacy settings."
    },
    {
        icon: Share2,
        title: "Easy Sharing",
        description: "Invite family and friends to contribute their own stories, photos, and condolences."
    },
    {
        icon: Clock,
        title: "Forever Timeline",
        description: "Build a chronological journey of their life, highlighting key milestones and cherished moments."
    },
    {
        icon: Volume2,
        title: "Audio Stories",
        description: "Record and upload voice messages to preserve the sound of their laughter and stories."
    },
    {
        icon: HeartHandshake,
        title: "Charity Donations",
        description: "Link to their favorite charities so visitors can donate in their honor directly from the page."
    }
];

export default function BenefitsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} className="py-24 bg-memorial-bg dark:bg-memorialDark-bg">
                <div className="container mx-auto px-4 md:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-memorial-text dark:text-memorialDark-text mb-6">
                            A Beautiful Place for <span className="text-memorial-accent italic">Precious Memories</span>
                        </h2>
                        <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                            We provide all the tools you need to create a rich, lasting tribute that truly reflects the life they lived.
                        </p>
                    </m.div>

                    <m.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {benefits.map((benefit, index) => (
                            <m.div
                                key={index}
                                variants={itemVariants}
                                className="p-8 rounded-2xl bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-border hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-memorial-accent/10 flex items-center justify-center mb-6 text-memorial-accent">
                                    <benefit.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-memorial-text dark:text-memorialDark-text mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                                    {benefit.description}
                                </p>
                            </m.div>
                        ))}
                    </m.div>
                </div>
            </section>
        </LazyMotion>
    );
}
