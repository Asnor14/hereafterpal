'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoGallery({ photos }) {
    const [selectedIndex, setSelectedIndex] = useState(null);

    if (!photos || photos.length === 0) {
        return (
            <div className="text-center py-12 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                No photos available
            </div>
        );
    }

    const openLightbox = (index) => {
        setSelectedIndex(index);
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedIndex(null);
        document.body.style.overflow = 'auto';
    };

    const goToPrevious = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    };

    const goToNext = () => {
        setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5">
                {photos.map((photo, index) => {
                    const imgSrc = photo.url;
                    const isCloudinaryId = !imgSrc?.startsWith('http');

                    return (
                        <motion.div
                            key={photo.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="relative aspect-square overflow-hidden rounded-memorial cursor-pointer group"
                            onClick={() => openLightbox(index)}
                        >
                            {isCloudinaryId ? (
                                <CldImage
                                    src={imgSrc}
                                    alt={photo.caption || `Memorial photo ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105 blur-up"
                                    style={{
                                        filter: 'saturate(0.9)',
                                    }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            ) : (
                                <Image
                                    src={imgSrc}
                                    alt={photo.caption || `Memorial photo ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105 blur-up"
                                    style={{
                                        filter: 'saturate(0.9)',
                                    }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            )}

                            {/* Desktop: Caption overlay on hover */}
                            {photo.caption && (
                                <div className="hidden md:block absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                                    <p className="text-white text-sm leading-relaxed">
                                        {photo.caption}
                                    </p>
                                </div>
                            )}

                            {/* Mobile: Caption below (shown in lightbox instead) */}
                        </motion.div>
                    );
                })}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center no-print"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center"
                            aria-label="Close lightbox"
                        >
                            <X size={28} />
                        </button>

                        {/* Navigation - Previous */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-4 z-10 p-3 text-white hover:bg-white/10 rounded-full transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        {/* Navigation - Next */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-4 z-10 p-3 text-white hover:bg-white/10 rounded-full transition-colors duration-200 min-h-touch min-w-touch flex items-center justify-center"
                            aria-label="Next photo"
                        >
                            <ChevronRight size={32} />
                        </button>

                        {/* Image Container */}
                        <div
                            className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full max-w-6xl h-[70vh] md:h-[80vh]">
                                {!photos[selectedIndex].url?.startsWith('http') ? (
                                    <CldImage
                                        src={photos[selectedIndex].url}
                                        alt={photos[selectedIndex].caption || `Photo ${selectedIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                ) : (
                                    <Image
                                        src={photos[selectedIndex].url}
                                        alt={photos[selectedIndex].caption || `Photo ${selectedIndex + 1}`}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                )}
                            </div>

                            {/* Caption */}
                            {photos[selectedIndex].caption && (
                                <div className="mt-4 md:mt-6 text-center max-w-2xl">
                                    <p className="text-white/90 text-sm md:text-base leading-relaxed">
                                        {photos[selectedIndex].caption}
                                    </p>
                                </div>
                            )}

                            {/* Photo Counter */}
                            <div className="mt-4 text-white/70 text-sm">
                                {selectedIndex + 1} / {photos.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
