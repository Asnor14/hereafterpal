'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const handleGetStarted = () => {
        router.push('/login?signup=true');
    };

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} className="py-24 relative overflow-hidden bg-memorial-accent dark:bg-memorialDark-accent text-white">
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                            Ready to Honor Their Memory?
                        </h2>
                        <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                            Create a timeless tribute in minutes. Share their story, photos, and legacy with friends and family around the world.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="bg-white text-memorial-accent font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
                            >
                                Start Creating Free
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push('/features')}
                                className="bg-transparent border-2 border-white/30 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                View Features
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-white/70">
                            No credit card required for free plan. Secure and private forever.
                        </p>
                    </m.div>
                </div>
            </section>
        </LazyMotion>
    );
}
