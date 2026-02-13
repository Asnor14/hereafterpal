'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { User, PawPrint, ArrowRight } from 'lucide-react';

export default function QuickActionsSection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const handleSelection = (type: 'human' | 'pet') => {
        router.push(`/create?type=${type}`);
    };

    return (
        <LazyMotion features={domAnimation}>
            <section id="about" ref={ref} className="py-20 md:py-32 bg-memorial-surfaceAlt/30 dark:bg-memorialDark-surfaceAlt/10 border-y border-memorial-border/30">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* Section Header - 5 Cols to prevent overlap */}
                        <div className="lg:col-span-5">
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="text-xs md:text-sm uppercase tracking-widest text-memorial-accent font-medium block mb-4">
                                    Selection
                                </span>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-6 leading-[1.1] tracking-tight">
                                    Who are you <br /> remembering?
                                </h2>
                                <p className="text-base md:text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed max-w-sm">
                                    Select a dedicated space. Each tribute is structurally designed to honor their unique spirit with dignity.
                                </p>
                            </m.div>
                        </div>

                        {/* Cards Grid - 7 Cols */}
                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Human Memorial Card */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                onClick={() => handleSelection('human')}
                                className="group cursor-pointer bg-memorial-bg dark:bg-memorialDark-surface p-8 rounded-md border border-memorial-border/50 hover:border-memorial-accent/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute -bottom-8 -right-8 w-64 h-64 opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                                    <img
                                        src="/images/3.svg"
                                        alt=""
                                        className="w-full h-full object-contain grayscale"
                                    />
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-between min-h-[220px]">
                                    <div>
                                        <div className="w-10 h-10 flex items-center justify-center border border-memorial-border rounded-sm mb-6 text-memorial-text bg-memorial-bg/50 backdrop-blur-sm">
                                            <User size={20} />
                                        </div>
                                        <h3 className="text-xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-2">
                                            A Loved One
                                        </h3>
                                        <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                                            Honoring a family member or friend with a timeless biography and photo timeline.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-[10px] uppercase tracking-[0.2em] text-memorial-accent font-bold mt-8 group-hover:translate-x-2 transition-transform duration-300">
                                        Begin Tribute <ArrowRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </m.div>

                            {/* Pet Memorial Card */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                onClick={() => handleSelection('pet')}
                                className="group cursor-pointer bg-memorial-bg dark:bg-memorialDark-surface p-8 rounded-md border border-memorial-border/50 hover:border-memorial-accent/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute -bottom-8 -right-8 w-64 h-64 opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                                    <img
                                        src="/images/2.svg"
                                        alt=""
                                        className="w-full h-full object-contain grayscale"
                                    />
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-between min-h-[220px]">
                                    <div>
                                        <div className="w-10 h-10 flex items-center justify-center border border-memorial-border rounded-sm mb-6 text-memorial-text bg-memorial-bg/50 backdrop-blur-sm">
                                            <PawPrint size={20} />
                                        </div>
                                        <h3 className="text-xl font-serif font-medium text-memorial-text dark:text-memorialDark-text mb-2">
                                            A Beloved Pet
                                        </h3>
                                        <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                                            A dedicated space for your furry companion, preserving their unconditional love.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-[10px] uppercase tracking-[0.2em] text-memorial-accent font-bold mt-8 group-hover:translate-x-2 transition-transform duration-300">
                                        Begin Tribute <ArrowRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </m.div>
                        </div>
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
