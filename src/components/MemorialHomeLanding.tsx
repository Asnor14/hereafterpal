'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function MemorialHomeLanding() {
    const { navigateToCreateMemorial } = useAuth()

    const scrollToExplore = () => {
        document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-memorial-bg dark:bg-memorialDark-bg">
            {/* Hero Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/placeholder-human.jpg"
                    alt="Create lasting memories"
                    fill
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // tiny 10x10 blur is fine here as placeholder
                    className="object-cover opacity-90 dark:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-memorial-bg dark:to-memorialDark-bg" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4 w-full">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
                >
                    <Sparkles size={16} className="text-yellow-300" />
                    <span className="text-sm font-medium text-white/90">
                        Honor those who matter most
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-6 drop-shadow-lg"
                >
                    Forever Remembered
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light"
                >
                    Create a beautiful memorial in 5 minutes. Free forever.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center gap-6"
                >
                    <button
                        onClick={navigateToCreateMemorial}
                        className="btn-primary w-full sm:w-auto text-lg px-10 py-4 min-h-[56px] shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
                    >
                        Start Free Memorial →
                    </button>

                    {/* Trust Signals */}
                    <p className="text-sm text-white/80 drop-shadow-sm flex gap-4">
                        <span>✓ No credit card required</span>
                        <span className="hidden sm:inline">✓ Free forever</span>
                        <span className="hidden sm:inline">✓ 1 memorial included</span>
                    </p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                onClick={scrollToExplore}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Scroll to explore"
            >
                <span className="text-sm font-medium tracking-wide">Explore Features</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </motion.button>
        </div>
    )
}
