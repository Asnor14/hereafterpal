'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function MemorialHomeLanding() {
    const { navigateToCreateMemorial } = useAuth();
    return (
        <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Peaceful Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-memorial-bg/80 via-memorial-bg/60 to-memorial-bg dark:from-memorialDark-bg/80 dark:via-memorialDark-bg/60 dark:to-memorialDark-bg z-10" />
                {/* Add a peaceful background image here */}
                <div className="absolute inset-0 bg-memorial-bg dark:bg-memorialDark-bg" />
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-memorial-text dark:text-memorialDark-text mb-6 md:mb-8 leading-tight">
                        Celebrate Life.
                        <br />
                        <span className="text-memorial-gold dark:text-memorialDark-gold">
                            Honor Memory.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl lg:text-2xl text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed"
                    >
                        A peaceful digital space to remember, share stories, and keep cherished memories alive forever.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <button
                            onClick={navigateToCreateMemorial}
                            className="px-8 py-4 bg-memorial-gold dark:bg-memorialDark-gold text-white rounded-memorial hover:opacity-90 transition-all duration-300 font-medium text-lg min-h-touch min-w-[200px] flex items-center justify-center shadow-memorial hover:shadow-memorial-lg active:scale-98"
                        >
                            Create a Memorial
                        </button>

                        <a
                            href="#explore"
                            className="px-8 py-4 bg-transparent border-2 border-memorial-gold dark:border-memorialDark-gold text-memorial-gold dark:text-memorialDark-gold rounded-memorial hover:bg-memorial-gold/10 dark:hover:bg-memorialDark-gold/10 transition-all duration-300 font-medium text-lg min-h-touch min-w-[200px] flex items-center justify-center"
                        >
                            Explore Memorials
                        </a>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
                >
                    <div className="flex flex-col items-center gap-2 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        <span className="text-sm">Scroll to explore</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-6 h-10 border-2 border-memorial-gold dark:border-memorialDark-gold rounded-full p-1"
                        >
                            <div className="w-1 h-2 bg-memorial-gold dark:bg-memorialDark-gold rounded-full mx-auto" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
