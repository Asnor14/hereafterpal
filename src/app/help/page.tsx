'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    CreditCard,
    Globe,
    Heart,
    Image as ImageIcon,
    Lock,
    Mail,
    MessageCircle,
    Mic,
    Search,
    Shield,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type HelpArticle = {
    title: string;
    category: string;
    description: string;
    keywords: string[];
    ctaLabel?: string;
    ctaHref?: string;
};

const supportCategories = [
    {
        title: 'Getting Started',
        description: 'Learn how HereafterPal memorials work and choose the right tribute type.',
        icon: BookOpen,
    },
    {
        title: 'Plans & Billing',
        description: 'Understand plan access, public sharing, and what each subscription unlocks.',
        icon: CreditCard,
    },
    {
        title: 'Memorial Management',
        description: 'Create, edit, publish, and manage photos, letters, and profile details.',
        icon: Heart,
    },
    {
        title: 'Privacy & Sharing',
        description: 'Control who can view a memorial and how family and visitors interact with it.',
        icon: Shield,
    },
];

const helpArticles: HelpArticle[] = [
    {
        title: 'What is the difference between Eternal Echo and Paws?',
        category: 'Getting Started',
        description: 'Eternal Echo is for human memorials and can include AI voice tributes when the plan matches. Paws is for pet memorials and does not include AI voice features.',
        keywords: ['eternal echo', 'paws', 'human memorial', 'pet memorial', 'voice'],
        ctaLabel: 'Create a memorial',
        ctaHref: '/create-memorial',
    },
    {
        title: 'Why is my memorial private?',
        category: 'Plans & Billing',
        description: 'Public sharing depends on the memorial type and the matching active plan. A Paws memorial needs a Paws plan, and an Eternal Echo memorial needs an Eternal Echo plan.',
        keywords: ['private', 'public', 'visibility', 'share', 'plan', 'subscription'],
        ctaLabel: 'View pricing',
        ctaHref: '/pricing',
    },
    {
        title: 'How many memorials can I create?',
        category: 'Plans & Billing',
        description: 'The current setup allows one memorial per account for free, Eternal Echo, and Paws plans. The plan affects features, not the memorial count.',
        keywords: ['limit', 'how many', 'one memorial', 'memorial count'],
        ctaLabel: 'Go to dashboard',
        ctaHref: '/dashboard',
    },
    {
        title: 'How do I add photos to Memory Lane?',
        category: 'Memorial Management',
        description: 'Open your memorial, go to the photo area, and upload images to build a visual timeline of memories for family and visitors.',
        keywords: ['photos', 'memory lane', 'gallery', 'upload'],
        ctaLabel: 'Open memorials',
        ctaHref: '/memorials',
    },
    {
        title: 'How do Letters of Love work?',
        category: 'Memorial Management',
        description: 'Visitors can leave messages and letters on the memorial page. Folder-based senders and named entries help organize messages for the family.',
        keywords: ['letters', 'guestbook', 'messages', 'folders', 'strangers'],
        ctaLabel: 'Open memorials',
        ctaHref: '/memorials',
    },
    {
        title: 'Why do AI voice tools not appear on my memorial?',
        category: 'Memorial Management',
        description: 'AI voice is available only for Eternal Echo memorials with the matching plan. Paws memorials do not show voice generation or playback tools.',
        keywords: ['ai voice', 'voice tribute', 'hidden', 'eternal echo', 'paws'],
        ctaLabel: 'View pricing',
        ctaHref: '/pricing',
    },
    {
        title: 'Can I rename my saved voice profiles?',
        category: 'Memorial Management',
        description: 'Yes. In the AI Voices tab, you can edit the voice display name so the public memorial shows a real label instead of Voice 1.',
        keywords: ['rename voice', 'voice 1', 'voice name', 'ai33pro'],
        ctaLabel: 'Open memorials',
        ctaHref: '/memorials',
    },
    {
        title: 'How do I manage who sees a memorial?',
        category: 'Privacy & Sharing',
        description: 'Use the memorial visibility settings to keep it private or publish it publicly if the right plan is active for that memorial type.',
        keywords: ['privacy', 'sharing', 'public', 'private', 'family password'],
        ctaLabel: 'Account settings',
        ctaHref: '/account',
    },
    {
        title: 'What payment method is supported?',
        category: 'Plans & Billing',
        description: 'The current billing flow uses GCash with QR-based payment submission and receipt upload for verification.',
        keywords: ['payment', 'gcash', 'receipt', 'billing', 'qr'],
        ctaLabel: 'View pricing',
        ctaHref: '/pricing',
    },
];

const quickLinks = [
    { label: 'Create Memorial', href: '/create-memorial', icon: Heart },
    { label: 'Manage Memorials', href: '/memorials', icon: Globe },
    { label: 'Plans & Pricing', href: '/pricing', icon: CreditCard },
    { label: 'Account Settings', href: '/account', icon: Lock },
];

export default function HelpPage() {
    const [query, setQuery] = useState('');

    const normalizedQuery = query.trim().toLowerCase();
    const filteredArticles = helpArticles.filter((article) => {
        if (!normalizedQuery) return true;

        return [article.title, article.category, article.description, ...article.keywords].some((value) =>
            value.toLowerCase().includes(normalizedQuery)
        );
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <section className="overflow-hidden rounded-3xl border border-memorial-border dark:border-memorialDark-border bg-[radial-gradient(circle_at_top,#3a2c16_0%,#17160f_45%,#10110d_100%)] text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
                    <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
                        <div className="space-y-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                                <MessageCircle size={14} />
                                HereafterPal Support
                            </span>
                            <div className="space-y-3">
                                <h1 className="font-serif text-4xl leading-tight text-white md:text-5xl">
                                    Help for memorials, sharing, plans, and care.
                                </h1>
                                <p className="max-w-2xl text-base text-white/75 md:text-lg">
                                    Find answers for Eternal Echo, Paws, billing, privacy, photos, letters, and voice-related questions in one place.
                                </p>
                            </div>
                            <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors focus-within:border-memorial-accent dark:focus-within:border-memorialDark-accent">
                                <Search size={18} className="text-white/55" />
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search help topics like voices, public sharing, GCash, or letters"
                                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                                />
                            </label>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <a
                                href="mailto:hereafterpal104@gmail.com"
                                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-0.5"
                            >
                                <Mail size={18} className="text-memorial-accent dark:text-memorialDark-accent" />
                                <h2 className="mt-4 text-lg font-semibold text-white">Contact support</h2>
                                <p className="mt-2 text-sm text-white/65">hereafterpal104@gmail.com</p>
                            </a>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <Mic size={18} className="text-memorial-accent dark:text-memorialDark-accent" />
                                <h2 className="mt-4 text-lg font-semibold text-white">Most asked</h2>
                                <p className="mt-2 text-sm text-white/65">
                                    Plan access, public visibility, AI voices, photo uploads, and message posting.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {supportCategories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <article
                                key={category.title}
                                className="rounded-2xl border border-memorial-border bg-memorial-surface p-6 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-memorialDark-border dark:bg-memorialDark-surface"
                            >
                                <div className="inline-flex rounded-2xl border border-memorial-border bg-memorial-bg p-3 text-memorial-accent dark:border-memorialDark-border dark:bg-memorialDark-bg dark:text-memorialDark-accent">
                                    <Icon size={20} />
                                </div>
                                <h2 className="mt-4 text-xl font-semibold text-memorial-text dark:text-memorialDark-text">
                                    {category.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                    {category.description}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div>
                            <h2 className="font-serif text-3xl text-memorial-text dark:text-memorialDark-text">
                                Support Articles
                            </h2>
                            <p className="mt-1 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'} found
                            </p>
                        </div>

                        <div className="space-y-4">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map((article) => (
                                    <article
                                        key={article.title}
                                        className="rounded-2xl border border-memorial-border bg-memorial-surface p-6 dark:border-memorialDark-border dark:bg-memorialDark-surface"
                                    >
                                        <p className="text-xs uppercase tracking-[0.22em] text-memorial-accent dark:text-memorialDark-accent">
                                            {article.category}
                                        </p>
                                        <h3 className="mt-2 text-xl font-semibold text-memorial-text dark:text-memorialDark-text">
                                            {article.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                            {article.description}
                                        </p>
                                        {article.ctaHref && article.ctaLabel ? (
                                            <Link
                                                href={article.ctaHref}
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-memorial-accent transition-colors hover:opacity-80 dark:text-memorialDark-accent"
                                            >
                                                {article.ctaLabel}
                                            </Link>
                                        ) : null}
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-memorial-border bg-memorial-surface p-8 text-center dark:border-memorialDark-border dark:bg-memorialDark-surface">
                                    <p className="text-lg font-medium text-memorial-text dark:text-memorialDark-text">
                                        No help articles matched your search.
                                    </p>
                                    <p className="mt-2 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                        Try terms like public, voice, Paws, Eternal Echo, pricing, or letters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-memorial-border bg-memorial-surface p-6 dark:border-memorialDark-border dark:bg-memorialDark-surface">
                            <h2 className="font-serif text-2xl text-memorial-text dark:text-memorialDark-text">
                                Quick Access
                            </h2>
                            <div className="mt-4 grid gap-3">
                                {quickLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-xl border border-memorial-border bg-memorial-bg px-4 py-3 transition-colors hover:border-memorial-accent dark:border-memorialDark-border dark:bg-memorialDark-bg dark:hover:border-memorialDark-accent"
                                        >
                                            <Icon size={18} className="text-memorial-accent dark:text-memorialDark-accent" />
                                            <span className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-memorial-border bg-memorial-surface p-6 dark:border-memorialDark-border dark:bg-memorialDark-surface">
                            <h2 className="font-serif text-2xl text-memorial-text dark:text-memorialDark-text">
                                Popular Topics
                            </h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Eternal Echo', 'Paws', 'Public Sharing', 'GCash', 'AI Voices', 'Letters of Love', 'Photos'].map((topic) => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => setQuery(topic)}
                                        className="rounded-full border border-memorial-border bg-memorial-bg px-3 py-1.5 text-xs font-medium text-memorial-textSecondary transition-colors hover:border-memorial-accent hover:text-memorial-text dark:border-memorialDark-border dark:bg-memorialDark-bg dark:text-memorialDark-textSecondary dark:hover:border-memorialDark-accent dark:hover:text-memorialDark-text"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-memorial-border bg-memorial-surface p-6 dark:border-memorialDark-border dark:bg-memorialDark-surface">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={18} className="text-memorial-accent dark:text-memorialDark-accent" />
                                <h2 className="font-serif text-2xl text-memorial-text dark:text-memorialDark-text">
                                    Need a direct route?
                                </h2>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                If you already know what you need, jump straight to memorial creation, pricing, account settings, or your saved memorials.
                            </p>
                        </div>
                    </aside>
                </section>
            </div>
        </DashboardLayout>
    );
}
