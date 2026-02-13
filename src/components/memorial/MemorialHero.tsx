'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function MemorialHero({ memorial }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    if (!memorial) return null;

    const { name, date_of_birth, date_of_passing, image_url, quote, bio, ai_voice_moods } = memorial;

    // Find the first non-null audio URL from ai_voice_moods
    const getVoiceAudioUrl = () => {
        if (!ai_voice_moods || typeof ai_voice_moods !== 'object') return null;

        const moods = ['longing', 'excited', 'stressed', 'frustrated'];
        for (const mood of moods) {
            if (ai_voice_moods[mood]) {
                return ai_voice_moods[mood];
            }
        }
        return null;
    };

    const voiceAudioUrl = getVoiceAudioUrl();

    // Format dates
    const birthYear = date_of_birth ? new Date(date_of_birth).getFullYear() : '';
    const passingYear = date_of_passing ? new Date(date_of_passing).getFullYear() : '';

    // Check if image_url is a Cloudinary public_id
    const isCloudinaryImage = image_url && !image_url.startsWith('http');

    // Audio playback toggle
    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle audio ended
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleEnded = () => setIsPlaying(false);
            audio.addEventListener('ended', handleEnded);
            return () => audio.removeEventListener('ended', handleEnded);
        }
    }, [voiceAudioUrl]);

    return (
        <section className="relative w-full">
            {/* Hero with Background Image */}
            <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
                {/* Background Image */}
                {image_url && (
                    isCloudinaryImage ? (
                        <CldImage
                            src={image_url}
                            alt={name || 'Memorial photo'}
                            fill
                            priority
                            crop="fill"
                            gravity="face"
                            className="object-cover"
                            style={{
                                filter: 'brightness(0.7) saturate(0.85)',
                            }}
                        />
                    ) : (
                        <img
                            src={image_url}
                            alt={name || 'Memorial photo'}
                            className="w-full h-full object-cover"
                            style={{
                                filter: 'brightness(0.7) saturate(0.85)',
                            }}
                        />
                    )
                )}

                {/* Fallback background */}
                {!image_url && (
                    <div className="absolute inset-0 bg-gradient-to-b from-memorial-textSecondary/30 to-memorialDark-bg" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 lg:pb-20 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl"
                    >
                        {/* Name */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-3 md:mb-4 drop-shadow-lg">
                            {name}
                        </h1>

                        {/* Life Dates */}
                        {(birthYear || passingYear) && (
                            <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                                <time dateTime={date_of_birth} className="text-lg md:text-xl text-white/90 drop-shadow-md">
                                    {birthYear}
                                </time>
                                <span className="text-white/70 text-2xl">—</span>
                                <time dateTime={date_of_passing} className="text-lg md:text-xl text-white/90 drop-shadow-md">
                                    {passingYear}
                                </time>
                            </div>
                        )}

                        {/* Quote */}
                        <motion.blockquote
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-base md:text-lg lg:text-xl text-white/95 italic font-serif max-w-2xl mx-auto drop-shadow-md mb-6"
                        >
                            "{quote || 'Forever in our hearts'}"
                        </motion.blockquote>

                        {/* AI Voice Tribute Player */}
                        {voiceAudioUrl && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex justify-center"
                            >
                                <button
                                    onClick={togglePlayback}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 ${isPlaying
                                        ? 'bg-white/20 backdrop-blur-md border border-white/30'
                                        : 'bg-memorial-accent/90 dark:bg-memorialDark-accent/90 hover:bg-memorial-accent dark:hover:bg-memorialDark-accent'
                                        }`}
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause size={18} className="text-white" />
                                            <span className="text-white font-medium text-sm">Pause Tribute</span>
                                            <Volume2 size={16} className="text-white animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} className="text-white ml-0.5" />
                                            <span className="text-white font-medium text-sm">Play Voice Tribute</span>
                                        </>
                                    )}
                                </button>
                                <audio ref={audioRef} src={voiceAudioUrl} className="hidden" />
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Biography Section */}
            {bio && (
                <div className="bg-memorial-surface dark:bg-memorialDark-surface">
                    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-serif text-memorial-text dark:text-memorialDark-text mb-6 text-center">
                                In Loving Memory
                            </h2>
                            <div
                                className="text-base md:text-base-desktop leading-relaxed text-memorial-textSecondary dark:text-memorialDark-textSecondary text-center max-w-3xl mx-auto"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {bio}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </section>
    );
}
