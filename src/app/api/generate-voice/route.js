import { NextResponse } from 'next/server';

// Minimax Voice IDs based on gender and age
// Using actual numeric IDs from ai33pro (corrected sequence)
const VOICE_MAP = {
    female: {
        child: '236835177529409',    // Using Female Young as fallback for child
        young: '236835177529409',
        middle: '226893671006276',   // Graceful Lady
        senior: '209533299589209',
    },
    male: {
        child: '209533299589217',
        young: '209533299589185',
        middle: '226893671006275',
        senior: '209533299589222',
    },
};

const DEFAULT_VOICE_ID = '226893671006276';

// Determine age category
function getAgeCategory(age) {
    const numAge = parseInt(age);
    if (isNaN(numAge)) return 'middle'; // Default

    if (numAge < 13) return 'child';
    if (numAge < 35) return 'young';
    if (numAge < 60) return 'middle';
    return 'senior';
}

// Get voice ID based on gender and age
function getVoiceId(gender, age) {
    const ageCategory = getAgeCategory(age);
    // Normalize gender string
    const normGender = gender?.toLowerCase() === 'male' ? 'male' : 'female';

    const genderVoices = VOICE_MAP[normGender] || VOICE_MAP.female;
    return genderVoices[ageCategory] || DEFAULT_VOICE_ID;
}

// Poll for task completion
async function pollTaskStatus(taskId, apiKey, maxAttempts = 30, delayMs = 2000) {
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

export async function POST(request) {
    try {
        const { text, mood, gender, age } = await request.json();

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

        // Get voice ID based on gender and age
        const voiceId = getVoiceId(gender, age);

        // Adjust voice settings based on mood
        let voiceSettings = {
            voice_id: voiceId,
            vol: 1,
            pitch: 0,
            speed: 1,
        };

        // Modulate voice based on mood for emotional tone
        switch (mood) {
            case 'excited':
                voiceSettings.pitch = 2;   // Higher pitch
                voiceSettings.speed = 1.15; // Faster
                break;
            case 'stressed':
                voiceSettings.pitch = 0;    // Normal pitch
                voiceSettings.speed = 0.9;  // Slower
                break;
            case 'frustrated':
                voiceSettings.pitch = -2;   // Lower pitch
                voiceSettings.speed = 0.95; // Slightly slower
                break;
            case 'longing':
            default:
                voiceSettings.pitch = -1;   // Slightly lower
                voiceSettings.speed = 0.9;  // Slower, reflective
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

        console.log(`Generating voice: gender=${gender}, age=${age}, mood=${mood}, voiceId=${voiceId}`);

        // Step 1: Submit TTS request to Minimax via ai33pro
        const ttsResponse = await fetch(
            'https://api.ai33.pro/v1m/task/text-to-speech',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: text.trim(),
                    model: 'speech-2.6-hd',
                    voice_setting: voiceSettings,
                    language_boost: 'Auto',
                }),
            }
        );

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.text();
            console.error('Minimax TTS error:', errorData);
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

        // Step 3: Get audio URL from completed task
        const audioUrl = taskResult.metadata?.audio_url;

        if (!audioUrl) {
            return NextResponse.json(
                { error: 'No audio URL in response' },
                { status: 500 }
            );
        }

        // Return the audio URL
        return NextResponse.json({
            success: true,
            audioUrl: audioUrl,
            taskId: ttsResult.task_id,
            mood: mood,
            gender: gender,
            age: age,
            voiceId: voiceId,
            creditsRemaining: ttsResult.ec_remain_credits,
        });

    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
