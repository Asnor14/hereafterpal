'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function Timeline({ milestones }) {
    if (!milestones || milestones.length === 0) {
        return null;
    }

    // Sort milestones by date
    const sortedMilestones = [...milestones].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getYear = (date) => {
        return new Date(date).getFullYear();
    };

    return (
        <div className="relative">
            {/* Vertical Timeline Line (hidden on mobile) */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-memorial-divider dark:bg-memorialDark-divider" />

            {/* Milestones */}
            <div className="space-y-6 md:space-y-8">
                {sortedMilestones.map((milestone, index) => (
                    <motion.div
                        key={milestone.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Mobile Layout: Vertical with date on left */}
                        <div className="md:flex md:items-start md:gap-8">
                            {/* Date Section */}
                            <div className="flex items-center gap-3 mb-3 md:mb-0 md:w-32 md:flex-shrink-0 md:text-right md:pt-1">
                                {/* Timeline Dot (Desktop only) */}
                                <div className="hidden md:block absolute left-6 w-4 h-4 rounded-full bg-memorial-gold dark:bg-memorialDark-gold border-4 border-memorial-surface dark:border-memorialDark-surface" />

                                {/* Calendar Icon (Mobile only) */}
                                <div className="md:hidden w-8 h-8 rounded-full bg-memorial-gold/10 dark:bg-memorialDark-gold/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar size={16} className="text-memorial-gold dark:text-memorialDark-gold" />
                                </div>

                                {/* Date Text */}
                                <time
                                    dateTime={milestone.date}
                                    className="text-sm md:text-base font-medium text-memorial-gold dark:text-memorialDark-gold"
                                >
                                    {getYear(milestone.date)}
                                </time>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 memorial-card p-4 md:p-6 ml-11 md:ml-0">
                                {/* Full Date */}
                                <p className="text-xs md:text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2">
                                    {formatDate(milestone.date)}
                                </p>

                                {/* Title */}
                                <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                                    {milestone.title}
                                </h3>

                                {/* Description */}
                                {milestone.description && (
                                    <p className="text-sm md:text-base text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                                        {milestone.description}
                                    </p>
                                )}

                                {/* Photo (Optional) */}
                                {milestone.photo && (
                                    <div className="mt-4 rounded-memorial overflow-hidden">
                                        <img
                                            src={milestone.photo}
                                            alt={milestone.title}
                                            className="w-full h-auto object-cover"
                                            style={{
                                                filter: 'saturate(0.9)',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
