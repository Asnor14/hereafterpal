import { NextRequest, NextResponse } from 'next/server';
import { uploadVoiceBufferToCloudinary } from '@/lib/cloudinaryVoice';

// ElevenLabs Voice IDs (via ai33.pro) based on gender and age.
// Env overrides are supported if you want to tune specific voices.
const VOICE_MAP: Record<string, Record<string, string>> = {
    female: {
        child: process.env.AI33PRO_VOICE_FEMALE_CHILD || 'EXAVITQu4vr4xnSDxMaL',
        young: process.env.AI33PRO_VOICE_FEMALE_YOUNG || 'EXAVITQu4vr4xnSDxMaL',
        middle: process.env.AI33PRO_VOICE_FEMALE_MIDDLE || '21m00Tcm4TlvDq8ikWAM',
        senior: process.env.AI33PRO_VOICE_FEMALE_SENIOR || 'ThT5KcBeYPX3keUQqHPh',
    },
    male: {
        child: process.env.AI33PRO_VOICE_MALE_CHILD || 'pNInz6obpgDQGcFmaJgB',
        young: process.env.AI33PRO_VOICE_MALE_YOUNG || 'TxGEqnHWrfWFTfGW9XjX',
        middle: process.env.AI33PRO_VOICE_MALE_MIDDLE || 'VR6AewLTigWG4xSOukaG',
        senior: process.env.AI33PRO_VOICE_MALE_SENIOR || 'onwK4e9ZLuTAKqWW03F9',
    },
};

const DEFAULT_VOICE_ID = process.env.AI33PRO_VOICE_DEFAULT || '21m00Tcm4TlvDq8ikWAM';

// Determine age category
function getAgeCategory(age: string | number): string {
    const numAge = parseInt(String(age));
    if (isNaN(numAge)) return 'middle'; // Default

    if (numAge < 13) return 'child';
    if (numAge < 35) return 'young';
    if (numAge < 60) return 'middle';
    return 'senior';
}

// Get voice ID based on gender and age
function getVoiceId(gender: string, age: string | number): string {
    const ageCategory = getAgeCategory(age);
    // Normalize gender string
    const normGender = gender?.toLowerCase() === 'male' ? 'male' : 'female';

    const genderVoices = VOICE_MAP[normGender] || VOICE_MAP.female;
    return genderVoices[ageCategory] || DEFAULT_VOICE_ID;
}

// Poll for task completion
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 30, delayMs = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`https://api.ai33.pro/v1/task/${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to check task status');
        }

        const taskData = await response.json();

        if (taskData.status === 'done') {
            return taskData;
        }

        if (taskData.status === 'error' || taskData.error_message) {
            throw new Error(taskData.error_message || 'Voice generation failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Voice generation timed out');
}

export async function POST(request: NextRequest) {
    try {
        const { text, mood, gender, age, voiceId } = await request.json();

        // Validation
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text must be 5000 characters or less' },
                { status: 400 }
            );
        }

        // Respect explicit voice choice when provided so users can keep one
        // consistent voice identity across multiple moods.
        const resolvedVoiceId = typeof voiceId === 'string' && voiceId.trim()
            ? voiceId.trim()
            : getVoiceId(gender, age);

        // Mood -> voice settings tuning for ElevenLabs model.
        let voiceSettings = {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.20,
            use_speaker_boost: true,
        };

        // Modulate emotional tone by mood
        switch (mood) {
            case 'excited':
                voiceSettings.stability = 0.40;
                voiceSettings.style = 0.55;
                break;
            case 'stressed':
                voiceSettings.stability = 0.70;
                voiceSettings.style = 0.25;
                break;
            case 'frustrated':
                voiceSettings.stability = 0.65;
                voiceSettings.style = 0.35;
                break;
            case 'longing':
            default:
                voiceSettings.stability = 0.50;
                voiceSettings.style = 0.30;
                break;
        }

        // Get API key
        const apiKey = process.env.AI33PRO_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Voice API not configured' },
                { status: 500 }
            );
        }

        console.log(`Generating voice: gender=${gender}, age=${age}, mood=${mood}, voiceId=${resolvedVoiceId}`);

        // Step 1: Submit TTS request to ElevenLabs via ai33pro
        const ttsResponse = await fetch(
            `https://api.ai33.pro/v1/text-to-speech/${resolvedVoiceId}?output_format=mp3_44100_128`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: text.trim(),
                    model_id: process.env.AI33PRO_MODEL_ID || 'eleven_multilingual_v2',
                    voice_settings: voiceSettings,
                    with_transcript: false,
                }),
            }
        );

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.text();
            console.error('ai33 ElevenLabs TTS error:', errorData);
            return NextResponse.json(
                { error: 'Failed to start voice generation. Please try again.' },
                { status: 500 }
            );
        }

        const ttsResult = await ttsResponse.json();

        if (!ttsResult.success || !ttsResult.task_id) {
            return NextResponse.json(
                { error: 'Failed to create voice task' },
                { status: 500 }
            );
        }

        // Step 2: Poll for task completion
        const taskResult = await pollTaskStatus(ttsResult.task_id, apiKey);

        // Step 3: Get provider audio URL from completed task
        const providerAudioUrl = taskResult.metadata?.audio_url;

        if (!providerAudioUrl) {
            return NextResponse.json(
                { error: 'No audio URL in response' },
                { status: 500 }
            );
        }

        // Step 4: Persist voice audio in Cloudinary for stable public playback
        const providerAudioResponse = await fetch(String(providerAudioUrl));
        if (!providerAudioResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to download generated voice audio' },
                { status: 500 }
            );
        }

        const audioBuffer = Buffer.from(await providerAudioResponse.arrayBuffer());
        if (!audioBuffer.length) {
            return NextResponse.json(
                { error: 'Generated voice audio is empty' },
                { status: 500 }
            );
        }

        const audioUrl = await uploadVoiceBufferToCloudinary(audioBuffer, {
            publicIdPrefix: `ai-${resolvedVoiceId}`,
        });

        // Return persisted Cloudinary URL
        return NextResponse.json({
            success: true,
            audioUrl,
            taskId: ttsResult.task_id,
            mood: mood,
            gender: gender,
            age: age,
            voiceId: resolvedVoiceId,
            creditsRemaining: ttsResult.ec_remain_credits,
        });

    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
