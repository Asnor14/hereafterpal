'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { Play, Pause, Volume2 } from 'lucide-react';

const MOOD_OPTIONS = [
    { value: 'longing', label: 'Longing' },
    { value: 'excited', label: 'Energetic' },
    { value: 'stressed', label: 'Stressed' },
    { value: 'frustrated', label: 'Frustrated' },
];

const DEFAULT_MOODS = {
    longing: null,
    excited: null,
    stressed: null,
    frustrated: null,
};

const VOICE_LABEL_BY_KEY: Record<string, string> = {
    voice1: 'Voice 1',
    voice2: 'Voice 2',
    voice3: 'Voice 3',
    voice4: 'Voice 4',
};

function normalizeVoiceLabel(key: string, label?: string | null) {
    const preset = VOICE_LABEL_BY_KEY[key];
    if (preset) return preset;
    if (typeof label === 'string' && label.includes(' - ')) {
        return label.split(' - ')[0].trim();
    }
    return label || key;
}

function buildVoiceProfiles(aiVoiceMoods: any) {
    if (!aiVoiceMoods || typeof aiVoiceMoods !== 'object') return {};

    // New format: { version: 2, profiles: { voice1: { label, moods: {...} } } }
    if (aiVoiceMoods.profiles && typeof aiVoiceMoods.profiles === 'object') {
        const parsed: Record<string, { label: string; moods: Record<string, string | null> }> = {};
        Object.entries(aiVoiceMoods.profiles).forEach(([key, value]: [string, any]) => {
            const sourceMoods = value?.moods && typeof value.moods === 'object' ? value.moods : value || {};
            parsed[key] = {
                label: normalizeVoiceLabel(key, value?.label),
                moods: {
                    ...DEFAULT_MOODS,
                    longing: typeof sourceMoods.longing === 'string' ? sourceMoods.longing : null,
                    excited: typeof sourceMoods.excited === 'string' ? sourceMoods.excited : null,
                    stressed: typeof sourceMoods.stressed === 'string' ? sourceMoods.stressed : null,
                    frustrated: typeof sourceMoods.frustrated === 'string' ? sourceMoods.frustrated : null,
                },
            };
        });
        return parsed;
    }

    // Legacy format: { longing, excited, stressed, frustrated }
    const hasLegacyMood = ['longing', 'excited', 'stressed', 'frustrated'].some(
        (mood) => typeof aiVoiceMoods[mood] === 'string' && aiVoiceMoods[mood]
    );
    if (hasLegacyMood) {
        return {
            voice1: {
                label: 'Voice 1',
                moods: {
                    ...DEFAULT_MOODS,
                    longing: typeof aiVoiceMoods.longing === 'string' ? aiVoiceMoods.longing : null,
                    excited: typeof aiVoiceMoods.excited === 'string' ? aiVoiceMoods.excited : null,
                    stressed: typeof aiVoiceMoods.stressed === 'string' ? aiVoiceMoods.stressed : null,
                    frustrated: typeof aiVoiceMoods.frustrated === 'string' ? aiVoiceMoods.frustrated : null,
                },
            },
        };
    }

    return {};
}

export default function MemorialHero({ memorial }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedVoiceKey, setSelectedVoiceKey] = useState('');
    const [selectedMood, setSelectedMood] = useState('longing');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    if (!memorial) return null;

    const { name, date_of_birth, date_of_passing, image_url, quote, bio, ai_voice_moods } = memorial;
    const voiceProfiles = buildVoiceProfiles(ai_voice_moods);
    const voiceKeys = Object.keys(voiceProfiles);
    const selectedProfile = selectedVoiceKey ? voiceProfiles[selectedVoiceKey] : null;
    const voiceAudioUrl = selectedProfile?.moods?.[selectedMood] || null;
    const availableMoods = selectedProfile
        ? MOOD_OPTIONS.filter((mood) => !!selectedProfile.moods?.[mood.value])
        : [];

    // Format dates
    const birthYear = date_of_birth ? new Date(date_of_birth).getFullYear() : '';
    const passingYear = date_of_passing ? new Date(date_of_passing).getFullYear() : '';

    // Check if image_url is a Cloudinary public_id
    const isCloudinaryImage = image_url && !image_url.startsWith('http');

    useEffect(() => {
        if (voiceKeys.length === 0) {
            setSelectedVoiceKey('');
            return;
        }

        if (!selectedVoiceKey || !voiceProfiles[selectedVoiceKey]) {
            setSelectedVoiceKey(voiceKeys[0]);
        }
    }, [selectedVoiceKey, voiceKeys, voiceProfiles]);

    useEffect(() => {
        if (!selectedProfile) {
            setSelectedMood('longing');
            return;
        }

        if (!selectedProfile.moods?.[selectedMood]) {
            const firstAvailableMood = MOOD_OPTIONS.find((mood) => !!selectedProfile.moods?.[mood.value]);
            setSelectedMood(firstAvailableMood?.value || 'longing');
        }
    }, [selectedMood, selectedProfile]);

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

    useEffect(() => {
        // Stop previous playback whenever visitor switches voice or mood.
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    }, [selectedVoiceKey, selectedMood]);

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
                        {voiceKeys.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex justify-center"
                            >
                                <div className="w-full max-w-xl bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                        <select
                                            value={selectedVoiceKey}
                                            onChange={(e) => setSelectedVoiceKey(e.target.value)}
                                            className="w-full rounded-lg border border-white/30 bg-black/20 text-white text-sm px-3 py-2 outline-none"
                                        >
                                            {voiceKeys.map((key) => (
                                                <option key={key} value={key} className="text-black">
                                                    {voiceProfiles[key].label}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedMood}
                                            onChange={(e) => setSelectedMood(e.target.value)}
                                            className="w-full rounded-lg border border-white/30 bg-black/20 text-white text-sm px-3 py-2 outline-none"
                                        >
                                            {MOOD_OPTIONS.map((mood) => (
                                                <option key={mood.value} value={mood.value} disabled={!selectedProfile?.moods?.[mood.value]} className="text-black">
                                                    {mood.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {voiceAudioUrl ? (
                                        <button
                                            onClick={togglePlayback}
                                            className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full transition-all duration-200 ${isPlaying
                                                ? 'bg-white/20 border border-white/30'
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
                                    ) : (
                                        <div className="w-full text-center text-xs text-white/80 py-2">
                                            No audio saved for this mood on the selected voice.
                                        </div>
                                    )}
                                </div>
                                <audio ref={audioRef} src={voiceAudioUrl || undefined} className="hidden" />
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
