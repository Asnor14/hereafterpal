'use client'

import { motion } from 'framer-motion'
import { Heart, PawPrint, BookOpen, Camera, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const actions = [
    {
        id: 'human',
        title: 'Human Memorial',
        description: 'Honor and celebrate the life of a loved one with a beautiful digital tribute.',
        icon: Heart,
        color: 'memorial-accent',
        link: '/create-memorial?type=human',
        features: ['Memory Lane', 'Letters of Love', 'AI Voice Tribute'],
    },
    {
        id: 'pet',
        title: 'Pet Memorial',
        description: 'Remember your faithful companion with a heartwarming memorial page.',
        icon: PawPrint,
        color: 'memorial-accent',
        link: '/create-memorial?type=pet',
        features: ['Photo Gallery', 'Guestbook', 'Pet-themed Design'],
    },
]

const testimonials = [
    {
        quote: "Creating this memorial helped our family process our grief and celebrate the beautiful life he lived.",
        author: "Maria S.",
        relation: "Loving daughter",
    },
    {
        quote: "My dog was my best friend for 15 years. This memorial lets me visit him whenever I miss him.",
        author: "James T.",
        relation: "Pet parent",
    },
]

export default function QuickActions() {
    const { navigateToCreateMemorial } = useAuth()

    return (
        <div className="space-y-12">
            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {actions.map((action, index) => {
                    const Icon = action.icon

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="memorial-card p-6 md:p-8 group cursor-pointer"
                            onClick={() => navigateToCreateMemorial()}
                        >
                            {/* Icon and Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-memorial-lg bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Icon size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-serif text-memorial-text dark:text-memorialDark-text mb-1">
                                        {action.title}
                                    </h3>
                                    <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                        {action.description}
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {action.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="badge-memorial"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-memorial-accent dark:text-memorialDark-accent font-medium group-hover:gap-3 transition-all">
                                <span>Create Memorial</span>
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Testimonials */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className="p-6 bg-memorial-bg dark:bg-memorialDark-bg rounded-memorial border border-memorial-borderLight dark:border-memorialDark-border"
                    >
                        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary italic mb-4 leading-relaxed">
                            "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-memorial-accent dark:text-memorialDark-accent">
                                    {testimonial.author.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                                    {testimonial.author}
                                </p>
                                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                    {testimonial.relation}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Browse Examples Link */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
            >
                <Link
                    href="/about"
                    className="text-memorial-accent dark:text-memorialDark-accent hover:underline inline-flex items-center gap-2"
                >
                    Learn more about how Hereafter, Pal works
                    <ArrowRight size={16} />
                </Link>
            </motion.div>
        </div>
    )
}
