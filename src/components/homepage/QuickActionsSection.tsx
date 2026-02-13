'use client';

import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, PawPrint, ArrowRight } from 'lucide-react';

export default function QuickActionsSection() {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const handleSelection = (type: 'human' | 'pet') => {
        // Navigate to create page with type pre-selected
        // Assuming /create route handles query params or state
        router.push(`/create?type=${type}`);
    };

    return (
        <LazyMotion features={domAnimation}>
            <section ref={ref} className="py-20 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt">
                <div className="container mx-auto px-4 md:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-memorial-text dark:text-memorialDark-text mb-4">
                            Who are you remembering?
                        </h2>
                        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
                            Start by selecting the type of memorial you'd like to create.
                            Each tribute is thoughtfully designed to honor their unique spirit.
                        </p>
                    </m.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Human Memorial Card */}
                        <m.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSelection('human')}
                            className="group cursor-pointer bg-white dark:bg-memorialDark-surface rounded-2xl p-8 border border-memorial-border shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-memorial-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Heart className="text-memorial-accent w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text mb-3">
                                A Loved One
                            </h3>
                            <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                Create a beautiful tribute for a family member or friend. Share a biography, timeline, and cherished photo albums.
                            </p>
                            <div className="flex items-center text-memorial-accent font-medium group-hover:translate-x-2 transition-transform duration-300">
                                Create Memorial <ArrowRight size={18} className="ml-2" />
                            </div>
                        </m.div>

                        {/* Pet Memorial Card */}
                        <m.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSelection('pet')}
                            className="group cursor-pointer bg-white dark:bg-memorialDark-surface rounded-2xl p-8 border border-memorial-border shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <PawPrint className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-memorial-text dark:text-memorialDark-text mb-3">
                                A Beloved Pet
                            </h3>
                            <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                Honor the unconditional love of your furry friend. A special place for their photos, favorite toys, and memories.
                            </p>
                            <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                Create Pet Memorial <ArrowRight size={18} className="ml-2" />
                            </div>
                        </m.div>
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
