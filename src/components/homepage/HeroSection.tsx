'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowDownRight, ArrowRight } from 'lucide-react';

export default function HeroSection() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/login?signup=true');
    };

    return (
        <LazyMotion features={domAnimation}>
            <section className="relative min-h-[95vh] flex flex-col justify-center bg-memorial-bg dark:bg-memorialDark-bg pt-20">
                <div className="container mx-auto px-6 md:px-12 h-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-end mb-20 section-spacing">

                    {/* Typography Block - Architectural Left Column */}
                    <div className="flex-1 flex flex-col justify-end z-10 lg:pb-12">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {/* Micro-label */}
                            <div className="flex items-center gap-4">
                                <span className="h-px w-8 bg-memorial-accent/50"></span>
                                <span className="text-xs md:text-sm uppercase tracking-widest text-memorial-textTertiary font-medium font-sans">
                                    The HereAfter Archive No. 01
                                </span>
                            </div>

                            {/* Massive Headline */}
                            <h1 className="font-serif font-medium text-memorial-text dark:text-memorialDark-text tracking-tight -ml-1">
                                Honoring <br />
                                <span className="italic text-memorial-accent">Life,</span> <br />
                                Forever.
                            </h1>

                            {/* Body Text - Max width constraint */}
                            <p className="text-base md:text-lg font-sans leading-relaxed text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-xl border-l border-memorial-border/50 pl-6">
                                Create a timeless digital archive for your loved ones.
                                A structured, peaceful space to share stories, photos, and tributes that endure.
                            </p>

                            {/* Architectural Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleGetStarted}
                                    className="h-14 px-8 bg-memorial-text dark:bg-memorialDark-text text-memorial-bg dark:text-memorialDark-bg rounded-md text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Create a Legacy <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="h-14 px-8 border border-memorial-border dark:border-memorialDark-border text-memorial-text dark:text-memorialDark-text rounded-md text-sm md:text-base font-medium tracking-wide hover:bg-memorial-surfaceAlt/20 transition-all duration-300"
                                >
                                    View Sample Memorial
                                </button>
                            </div>
                        </m.div>
                    </div>

                    {/* Image Block - Tall Structural Right Column */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex-1 w-full lg:h-[85vh] h-[60vh] relative"
                    >
                        <div className="absolute inset-0 rounded-md overflow-hidden bg-memorial-surfaceAlt/30">
                            {/* Using existing SVG as placeholder, ensuring object-cover and grayscale architectural feel */}
                            <Image
                                src="/images/11.svg"
                                alt="Architectural Memorial Space"
                                fill
                                className="object-cover opacity-90 grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Subtle Grain/Texture Overlay */}
                            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                        </div>

                        {/* Floating Architectural Badge */}
                        <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-4 rounded-sm border border-memorial-border/20 max-w-[200px] hidden md:block">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-serif text-memorial-text dark:text-memorialDark-text">01</span>
                                <ArrowDownRight size={20} className="text-memorial-accent mb-1" />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-memorial-textSecondary mt-1">
                                Secure Preservation
                            </p>
                        </div>
                    </m.div>

                </div>
            </section>
        </LazyMotion>
    );
}
