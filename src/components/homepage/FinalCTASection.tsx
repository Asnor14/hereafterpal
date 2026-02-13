'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} className="py-20 md:py-32 bg-memorial-bg dark:bg-memorialDark-bg">
                <div className="container mx-auto px-6 md:px-12">
                    <m.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.8 }}
                        className="bg-memorial-text dark:bg-memorialDark-text text-memorial-bg dark:text-memorialDark-bg rounded-md p-12 md:p-24 text-center relative overflow-hidden"
                    >
                        {/* Architectural Accent Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-memorial-accent"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium mb-8 leading-tight">
                                Begin the <br /> <span className="italic text-memorial-accent">Preservation.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-memorial-bg/80 dark:text-memorialDark-bg/80 mb-12 leading-relaxed max-w-xl mx-auto">
                                Create a timeless, dignified digital sanctuary.
                                Secure your loved one's legacy in a space designed to last forever.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                <button
                                    onClick={() => router.push('/login?signup=true')}
                                    className="h-16 px-10 bg-memorial-bg dark:bg-memorialDark-bg text-memorial-text dark:text-memorialDark-text font-medium text-lg rounded-sm hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center gap-3"
                                >
                                    Create Memorial <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => router.push('/features')}
                                    className="h-16 px-10 border border-memorial-bg/20 dark:border-memorialDark-bg/20 text-memorial-bg dark:text-memorialDark-bg font-medium text-lg rounded-sm hover:bg-white/5 transition-colors duration-300"
                                >
                                    Explore Features
                                </button>
                            </div>
                        </div>
                    </m.div>
                </div>
            </section>
        </LazyMotion>
    );
}
