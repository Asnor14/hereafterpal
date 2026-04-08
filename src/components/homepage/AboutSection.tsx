'use client';

import Image from 'next/image';
import { LazyMotion, domAnimation, m, useInView } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef } from 'react';

const purposeStatements = [
    {
        label: 'Mission',
        body: 'Hereafter, Pal is committed to providing a respectful and supportive digital platform that enables individuals and families to preserve the memories of their departed loved ones and express their grief in a healthy and meaningful manner. Our mission is to accompany those who are grieving by offering tools that facilitate healing, remembrance, and the celebration of life\'s enduring impact, fostering emotional resilience and connection throughout the journey of loss.',
    },
    {
        label: 'Vision',
        body: 'Our vision is to create a world where every life is honored with dignity and compassion, and where the process of grieving is met with understanding and support. Hereafter, Pal aspires to be a leading provider of innovative memorial solutions that help individuals embrace the legacy of their loved ones, promoting healing and hope while ensuring that memories continue to inspire and comfort across generations.',
    },
];

const aboutBlocks = [
    {
        title: 'COPESTANT, the company.',
        body: [
            'The company name is a play on words between cope and constant, indicating our company could be a constant shoulder to lean on for the bereaved who are trying to cope with the loss of a loved one or a pet.',
            'As a company, COPESTANT approaches loss not just as something to endure, but as something to engage with respectfully, compassionately, and creatively.',
        ],
    },
    {
        title: 'Hereafter, Pal, the core service.',
        body: [
            'An offering rooted in heart, connection, and legacy, enabling users to honor and remember loved ones, Hereafter, Pal provides a secure and solemn space to preserve stories, photos, and messages across generations.',
        ],
    },
    {
        title: 'Cope Pals, the team.',
        body: [
            'A dedicated team of entrepreneurs, creators, and care-driven individuals committed to making grief support more accessible and meaningful. The very heart and backbone of COPESTANT, working together to reimagine how people cope with loss while keep memories alive in the digital age.',
        ],
    },
];

const brandStoryParagraphs = [
    '"For every soul who once walked through this lifetime, aiming for the stars to leave something spectacular, it seems to be forgotten that the vast sphere is what He is made of."',
    'Grief consists of five letters, but the damage cuts through the soul, carving a profound imprint with heartbeats that witnessed genuineness and signed, with every blink, a proof of lived moments. HereafterPal - where "Hereafter" stands for life after death and "Pal" for best friend - is dedicated to departed loved ones, whether human or animal, with the aim not merely to preserve memories, but to walk alongside them.',
    'Cope Pals - HereafterPal\'s proponents - have gone through the agony brought by the loss of their loved ones and fur babies who once formed part of their daily lives. Expressing grief has many outlets: social media posts filled with thoughts, pictures, and videos; a phone\'s gallery storing treasured memories; or even late-night conversations with a trusted friend. Indeed, these spaces exist. But what about a specific vessel created solely for grief? That question is harder to answer.',
    'Often, grief fades with time. It eventually heals, yet sometimes the healing comes through suppression rather than expression. When sorrow is silenced instead of acknowledged, it can leave a profound impact on the mental and emotional well-being of the bereaved. Additionally, not everyone copes the same way. Some are comfortable showing vulnerability, while others prefer silence, where their sorrow feels safe.',
    'As a result, HereafterPal came to life. It is not just a service-oriented business - it is a companion throughout the journey of healing, or at least the journey of accepting that while parting ways is inevitable, saying goodbye with a smile is possible.',
    'Because those we lose never truly leave us with nothing. They leave recollections planted in our hearts, reminding us that moving on is not only about grieving what could have been, but also about honoring what once was.',
];

type AboutSectionProps = {
    anchorId?: string;
    standalone?: boolean;
};

function StoryBlock({
    eyebrow,
    title,
    imageSrc,
    imageAlt,
    children,
    isInView,
    delay,
}: {
    eyebrow: string;
    title: string;
    imageSrc: string;
    imageAlt: string;
    children: ReactNode;
    isInView: boolean;
    delay: number;
}) {
    return (
        <div className="grid gap-8 overflow-hidden rounded-[28px] border border-memorial-border/30 bg-memorial-surface dark:border-memorialDark-border/20 dark:bg-memorialDark-surface lg:grid-cols-[1.1fr_0.9fr]">
            <m.div
                initial={{ opacity: 0, x: -24 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay }}
                className="relative min-h-[320px] lg:min-h-[520px]"
            >
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20" />
            </m.div>

            <m.div
                initial={{ opacity: 0, x: 24 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: delay + 0.1 }}
                className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12"
            >
                <span className="mb-4 text-xs uppercase tracking-[0.28em] text-memorial-accent dark:text-memorialDark-accent">
                    {eyebrow}
                </span>
                <h3 className="mb-6 text-3xl font-medium uppercase tracking-[0.12em] text-memorial-text dark:text-memorialDark-text md:text-4xl">
                    {title}
                </h3>
                <div className="space-y-6 text-base leading-8 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    {children}
                </div>
            </m.div>
        </div>
    );
}

export default function AboutSection({ anchorId = 'about', standalone = false }: AboutSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-120px' });

    return (
        <LazyMotion features={domAnimation}>
            <section
                id={anchorId}
                ref={ref}
                className={`${standalone ? 'pt-28' : ''} border-y border-memorial-border/30 bg-gradient-to-b from-memorial-surfaceAlt/40 via-memorial-bg to-memorial-surfaceAlt/20 py-20 dark:border-memorialDark-border/20 dark:from-memorialDark-surfaceAlt/10 dark:via-memorialDark-bg dark:to-memorialDark-surfaceAlt/5 md:py-32`}
            >
                <div className="container mx-auto space-y-12 px-6 md:space-y-16 md:px-12">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <span className="mb-4 block text-xs uppercase tracking-[0.32em] text-memorial-accent dark:text-memorialDark-accent">
                            About HereafterPal
                        </span>
                        <h2 className="mb-5 text-4xl font-medium tracking-tight md:text-5xl">
                            Mission, vision, and the story behind the space we are building.
                        </h2>
                        <p className="max-w-2xl text-base leading-8 text-memorial-textSecondary dark:text-memorialDark-textSecondary md:text-lg">
                            This section brings together the purpose, identity, and brand story of HereafterPal and COPESTANT in one place.
                        </p>
                    </m.div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {purposeStatements.map((item, index) => (
                            <m.article
                                key={item.label}
                                initial={{ opacity: 0, y: 24 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                                className="rounded-[24px] border border-memorial-border/30 bg-memorial-surface px-6 py-8 shadow-sm dark:border-memorialDark-border/20 dark:bg-memorialDark-surface md:px-8"
                            >
                                <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-memorial-accent dark:text-memorialDark-accent">
                                    {item.label}
                                </span>
                                <p className="text-base leading-8 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                    {item.body}
                                </p>
                            </m.article>
                        ))}
                    </div>

                    <StoryBlock
                        eyebrow="Company Profile"
                        title="About Us"
                        imageSrc="/ABOUT US.JPG"
                        imageAlt="About Us visual"
                        isInView={isInView}
                        delay={0.2}
                    >
                        {aboutBlocks.map((block) => (
                            <div key={block.title} className="space-y-2">
                                <p className="font-semibold italic text-memorial-text dark:text-memorialDark-text">
                                    {block.title}
                                </p>
                                {block.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        ))}
                    </StoryBlock>

                    <StoryBlock
                        eyebrow="Legacy Narrative"
                        title="Brand Story"
                        imageSrc="/BRAND STORY.jpg"
                        imageAlt="Brand Story visual"
                        isInView={isInView}
                        delay={0.35}
                    >
                        {brandStoryParagraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </StoryBlock>
                </div>
            </section>
        </LazyMotion>
    );
}
