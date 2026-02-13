'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronDown, Sparkles, Check } from 'lucide-react';

const trustSignals = [
    "Secure & Private",
    "Lifetime Preservation",
    "Easy to Share"
];

export default function HeroSection() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/login?signup=true');
    };

    const handleLearnMore = () => {
        const element = document.getElementById('how-it-works');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-memorial-bg dark:bg-memorialDark-bg">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-memorial-surfaceAlt/20 to-transparent pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-memorial-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 -left-20 w-60 h-60 bg-memorial-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto md:gap-8 gap-6">

                        {/* Trust/Category Badge */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-memorial-surface border border-memorial-border shadow-sm mb-4 md:mb-0"
                        >
                            <Sparkles size={14} className="text-memorial-accent" />
                            <span className="text-xs font-medium text-memorial-textSecondary uppercase tracking-wider">
                                Digital Memorial Services
                            </span>
                        </m.div>

                        {/* Main Headline */}
                        <m.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-memorial-text dark:text-memorialDark-text leading-[1.1] tracking-tight"
                        >
                            Honoring Life, <br className="hidden md:block" />
                            <span className="text-memorial-accent italic">Preserving Memories</span>
                        </m.h1>

                        {/* Subheadline/Description */}
                        <m.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl leading-relaxed"
                        >
                            Create a timeless digital sanctuary for your loved ones.
                            Share stories, photos, and tributes in a beautiful, secure space that lasts forever.
                        </m.p>

                        {/* CTAs */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                        >
                            <button
                                onClick={handleGetStarted}
                                className="btn-primary w-full sm:w-auto text-lg px-8 py-3"
                            >
                                Create a Memorial
                            </button>
                            <button
                                onClick={handleLearnMore}
                                className="btn-ghost w-full sm:w-auto text-lg px-8 py-3"
                            >
                                View Example
                            </button>
                        </m.div>

                        {/* Trust Signals */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 text-sm text-memorial-textTertiary"
                        >
                            {trustSignals.map((signal, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <Check size={14} className="text-memorial-accent" />
                                    <span>{signal}</span>
                                </div>
                            ))}
                        </m.div>

                    </div>

                    {/* Hero Visual/Image Area (Optional - or scroll indicator) */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-16 relative w-full aspect-[16/9] max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-memorial-border hidden md:block"
                    >
                        {/* Using a placeholder div for now or your specific image path */}
                        <div className="absolute inset-0 bg-memorial-surfaceAlt/20 flex items-center justify-center">
                            <Image
                                src="/images/11.svg"
                                alt="Memorial Preview"
                                fill
                                className="object-cover opacity-80"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-memorial-bg via-transparent to-transparent opacity-60" />
                        </div>
                    </m.div>

                </div>

                {/* Scroll Indicator */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-memorial-textTertiary"
                    onClick={handleLearnMore}
                >
                    <ChevronDown size={24} />
                </m.div>
            </section>
        </LazyMotion>
    );
}
