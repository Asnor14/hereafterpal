'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import PhotoGallery from './PhotoGallery';

export default function MemoryLane({ photos, memorialName }) {
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    // Duplicate photos for infinite scroll effect if we have enough
    const shouldAnimate = photos.length > 3;
    const marqueePhotos = shouldAnimate
        ? [...photos, ...photos, ...photos, ...photos].slice(0, 20) // Ensure enough for scrolling but cap it
        : photos;

    if (!photos || photos.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-memorial-surface dark:bg-memorialDark-surface overflow-hidden">
            <div className="container mx-auto px-4 text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-serif italic text-memorial-text dark:text-memorialDark-text mb-6">
                    MEMORY LANE
                </h2>
                <div className="max-w-2xl mx-auto space-y-4">
                    <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                        This gallery is a heartfelt tribute to {memorialName || 'our loved one'}, capturing the essence of their life
                        through curated images, personal stories, and shared memories. Each piece reflects
                        their warmth, kindness, and the profound impact they had on those around them. Visitors
                        are invited to explore, reflect, and contribute, creating a living tapestry that honors
                        their enduring legacy.
                    </p>
                    <button
                        onClick={() => setIsViewAllOpen(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-sm uppercase tracking-widest text-sm font-medium hover:opacity-80 transition-opacity mt-4"
                    >
                        Look Now
                    </button>
                </div>
            </div>

            {/* Infinite Marquee */}
            <div className="relative w-full overflow-hidden py-8">
                <div className={`flex gap-4 ${shouldAnimate ? 'animate-marquee' : 'justify-center'} whitespace-nowrap`}>
                    {/* Render marquee items */}
                    <div className={`flex gap-4 ${shouldAnimate ? 'min-w-full' : ''}`}>
                        {marqueePhotos.map((photo, index) => {
                            const imgSrc = photo.image_url || photo.url;
                            const isCloudinaryId = !imgSrc?.startsWith('http');

                            return (
                                <div
                                    key={`marquee-1-${index}`}
                                    className="relative h-64 w-64 md:h-80 md:w-80 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setIsViewAllOpen(true)}
                                >
                                    {isCloudinaryId ? (
                                        <CldImage
                                            src={imgSrc}
                                            alt={photo.caption || 'Memory'}
                                            fill
                                            className="object-cover"
                                            sizes="320px"
                                        />
                                    ) : (
                                        <Image
                                            src={imgSrc}
                                            alt={photo.caption || 'Memory'}
                                            fill
                                            className="object-cover"
                                            sizes="320px"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {shouldAnimate && (
                        <div className="flex gap-4 min-w-full" aria-hidden="true">
                            {marqueePhotos.map((photo, index) => {
                                const imgSrc = photo.image_url || photo.url;
                                const isCloudinaryId = !imgSrc?.startsWith('http');

                                return (
                                    <div
                                        key={`marquee-2-${index}`}
                                        className="relative h-64 w-64 md:h-80 md:w-80 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setIsViewAllOpen(true)}
                                    >
                                        {isCloudinaryId ? (
                                            <CldImage
                                                src={imgSrc}
                                                alt={photo.caption || 'Memory'}
                                                fill
                                                className="object-cover"
                                                sizes="320px"
                                            />
                                        ) : (
                                            <Image
                                                src={imgSrc}
                                                alt={photo.caption || 'Memory'}
                                                fill
                                                className="object-cover"
                                                sizes="320px"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* View All Modal */}
            <AnimatePresence>
                {isViewAllOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-memorial-background/95 dark:bg-memorialDark-background/95 backdrop-blur-md overflow-y-auto"
                    >
                        <div className="min-h-screen p-4 md:p-8">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
                                <div>
                                    <h3 className="text-3xl font-serif italic text-memorial-text dark:text-memorialDark-text">
                                        All Memories
                                    </h3>
                                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-1">
                                        {photos.length} photos collected
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsViewAllOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors text-memorial-text dark:text-memorialDark-text font-medium"
                                >
                                    <span>Exit Gallery</span>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Reuse PhotoGallery Grid */}
                            <div className="max-w-7xl mx-auto pb-12">
                                <PhotoGallery photos={photos.map(p => ({
                                    ...p,
                                    url: p.image_url || p.url // Normalize for PhotoGallery
                                }))} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                    /* Reverse direction: right to left is default for marquee, but let's ensure it flows nicely */
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
}
