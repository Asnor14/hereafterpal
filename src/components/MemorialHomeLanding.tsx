'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function MemorialHomeLanding() {
    const { navigateToCreateMemorial } = useAuth()

    const scrollToExplore = () => {
        document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-memorial-surface via-memorial-bg to-memorial-surface dark:from-memorialDark-surface dark:via-memorialDark-bg dark:to-memorialDark-surface" />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '32px 32px',
            }} />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 mb-6"
                >
                    <Sparkles size={16} className="text-memorial-accent dark:text-memorialDark-accent" />
                    <span className="text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        Honor those who matter most
                    </span>
                </motion.div>

                {/* Main Heading with Decorative Letters */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-memorial-text dark:text-memorialDark-text mb-6"
                >
                    <span className="decorative-letter">H</span>ereafter,{' '}
                    <span className="decorative-letter">P</span>al
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl lg:text-2xl text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-4 max-w-2xl mx-auto leading-relaxed"
                >
                    Create beautiful, lasting digital memorials that celebrate life and preserve cherished memories.
                </motion.p>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-memorial-textTertiary dark:text-memorialDark-textTertiary mb-10"
                >
                    For humans and pets alike
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={navigateToCreateMemorial}
                        className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                    >
                        Create Memorial
                        <ArrowRight size={20} />
                    </button>
                    <Link
                        href="/pricing"
                        className="btn-ghost inline-flex items-center gap-2 text-lg px-8 py-4"
                    >
                        View Pricing
                    </Link>
                </motion.div>

                {/* Features Preview */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-memorial-accent dark:bg-memorialDark-accent" />
                        Memory Lane
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-memorial-accent dark:bg-memorialDark-accent" />
                        Letters of Love
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-memorial-accent dark:bg-memorialDark-accent" />
                        AI Voice Tribute
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                onClick={scrollToExplore}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-memorial-textTertiary dark:text-memorialDark-textTertiary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
                aria-label="Scroll to explore"
            >
                <span className="text-sm">Explore</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </motion.button>
        </section>
    )
}
