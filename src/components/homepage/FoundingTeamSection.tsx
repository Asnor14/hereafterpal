'use client';

import Image from 'next/image';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import { useRef } from 'react';

const teamMembers = [
    {
        name: 'A.C. Montero',
        role: 'Chief Executive Officer',
        accent: 'Founder Focus',
        initials: 'AM',
        image: '/profiles/ac.webp',
        quote: 'None of us knows what the future holds, so let us all live now, not in yesterday, but today. Let us live to witness the beautiful rainbow of hope before our eyes.',
    },
    {
        name: 'Micaira Alliah Jann Cueto',
        role: 'Chief Financial Officer',
        accent: 'Financial Stewardship',
        initials: 'MC',
        image: '/profiles/micaira.webp',
        quote: 'To live fully is to embrace the unknown with both purpose and humility.',
    },
    {
        name: 'Charlyn Balino',
        role: 'Chief Operating Officer',
        accent: 'Operations & Care',
        initials: 'CB',
        image: '/profiles/charlyn.webp',
        quote: 'To live is to lose things you thought you would always have, and to find beauty in what stays.',
    },
    {
        name: 'Paula Marru Bituaran',
        role: 'Chief Information Officer',
        accent: 'Systems & Experience',
        initials: 'PB',
        image: '/profiles/paula.webp',
        quote: 'Live well so your soul is at peace, love deeply so others never forget you, and laugh often so joy leaves its mark.',
    },
    {
        name: 'Allieyah Thounnie David',
        role: 'Chief Marketing Officer',
        accent: 'Voice & Outreach',
        initials: 'AD',
        image: '/profiles/allieyah.webp',
        quote: 'To find joy in the simple things is to unlock the profound beauty that life offers.',
    },
];

export default function FoundingTeamSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <LazyMotion features={domAnimation}>
            <section
                ref={ref}
                className="border-t border-memorial-border/20 bg-memorial-bg py-20 dark:border-memorialDark-border/10 dark:bg-memorialDark-bg md:py-32"
            >
                <div className="container mx-auto px-6 md:px-12">
                    <div className="mb-16 grid gap-10 border-b border-memorial-border/20 pb-12 dark:border-memorialDark-border/10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="max-w-xl"
                        >
                            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-memorial-accent">
                                The People Behind HereafterPal
                            </span>
                            <h2 className="font-serif text-4xl font-medium leading-tight text-memorial-text dark:text-memorialDark-text md:text-6xl">
                                Meet the
                                <span className="block italic text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                    Founding Team
                                </span>
                            </h2>
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="space-y-5"
                        >
                            <p className="max-w-2xl text-base leading-8 text-memorial-textSecondary dark:text-memorialDark-textSecondary md:text-lg">
                                HereafterPal is shaped by a team committed to building a gentle, lasting space for remembrance. Each role carries the same purpose: to preserve stories, protect memory, and make grief feel less isolating.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-memorial-border/30 bg-memorial-surfaceAlt/30 px-4 py-4 dark:border-memorialDark-border/20 dark:bg-memorialDark-surfaceAlt/10">
                                    <p className="text-2xl font-serif text-memorial-text dark:text-memorialDark-text">5</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                        Core Members
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-memorial-border/30 bg-memorial-surfaceAlt/30 px-4 py-4 dark:border-memorialDark-border/20 dark:bg-memorialDark-surfaceAlt/10">
                                    <p className="text-2xl font-serif text-memorial-text dark:text-memorialDark-text">1</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                        Shared Mission
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-memorial-border/30 bg-memorial-surfaceAlt/30 px-4 py-4 dark:border-memorialDark-border/20 dark:bg-memorialDark-surfaceAlt/10">
                                    <p className="text-2xl font-serif text-memorial-text dark:text-memorialDark-text">24/7</p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                        Care Mindset
                                    </p>
                                </div>
                            </div>
                        </m.div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                        {teamMembers.map((member, index) => (
                            <m.article
                                key={member.name}
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.55, delay: index * 0.08 }}
                                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-memorial-border/30 bg-memorial-surface shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 dark:border-memorialDark-border/20 dark:bg-memorialDark-surface"
                            >
                                <div className="relative h-80 overflow-hidden border-b border-memorial-border/20 bg-[radial-gradient(circle_at_top,#3e2f18_0%,#1b1a12_44%,#12130f_100%)] dark:border-memorialDark-border/10">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 45vw, 100vw"
                                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10" />
                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 py-5">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                                                {member.accent}
                                            </p>
                                            <p className="mt-3 font-serif text-5xl text-white/90">
                                                {member.initials}
                                            </p>
                                        </div>
                                        <div className="rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/75 backdrop-blur-sm">
                                            HereafterPal
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col px-6 py-6">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-memorial-accent dark:text-memorialDark-accent">
                                        {member.role}
                                    </p>
                                    <h3 className="mt-3 font-serif text-2xl leading-tight text-memorial-text dark:text-memorialDark-text">
                                        {member.name}
                                    </h3>
                                    <p className="mt-5 flex-1 text-sm leading-7 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                        “{member.quote}”
                                    </p>
                                </div>
                            </m.article>
                        ))}
                    </div>
                </div>
            </section>
        </LazyMotion>
    );
}
