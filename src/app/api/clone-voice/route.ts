import { NextRequest, NextResponse } from 'next/server';

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
            throw new Error(taskData.error_message || 'Voice cloning failed');
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error('Voice cloning timed out');
}

function mapLanguageTag(raw: string) {
    const value = raw.trim().toLowerCase();
    if (!value) return 'English';
    if (value === 'en' || value === 'english') return 'English';
    if (value === 'fil' || value === 'tl' || value === 'tagalog') return 'Tagalog';
    return raw;
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.AI33PRO_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Voice API not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const text = String(formData.get('text') || '').trim();
        const voiceName = String(formData.get('voiceName') || '').trim();
        const targetLang = String(formData.get('targetLang') || 'English').trim();
        const gender = String(formData.get('gender') || '').trim().toLowerCase();

        if (!file) {
            return NextResponse.json(
                { error: 'Voice sample file is required' },
                { status: 400 }
            );
        }

        if (!text) {
            return NextResponse.json(
                { error: 'Message text is required' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text must be 5000 characters or less' },
                { status: 400 }
            );
        }

        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file must be 20MB or less' },
                { status: 400 }
            );
        }

        if (!file.type.startsWith('audio/')) {
            return NextResponse.json(
                { error: 'Only audio files are supported for voice cloning' },
                { status: 400 }
            );
        }

        const clonePayload = new FormData();
        clonePayload.append('file', file, file.name);
        if (voiceName) clonePayload.append('voice_name', voiceName);
        clonePayload.append('preview_text', text.slice(0, 200));
        clonePayload.append('language_tag', mapLanguageTag(targetLang));
        clonePayload.append('need_noise_reduction', 'true');
        if (gender === 'male' || gender === 'female') {
            clonePayload.append('gender_tag', gender);
        }

        const cloneResponse = await fetch('https://api.ai33.pro/v1m/voice/clone', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: clonePayload,
        });

        if (!cloneResponse.ok) {
            const errorData = await cloneResponse.text();
            console.error('ai33 minimax clone error:', errorData);
            return NextResponse.json(
                { error: 'Failed to clone voice sample. Please try again.' },
                { status: 500 }
            );
        }

        const cloneResult = await cloneResponse.json();
        const clonedVoiceId = cloneResult?.cloned_voice_id;
        if (!cloneResult.success || !clonedVoiceId) {
            return NextResponse.json(
                { error: 'Failed to create cloned voice' },
                { status: 500 }
            );
        }

        const ttsResponse = await fetch('https://api.ai33.pro/v1m/task/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model: process.env.AI33PRO_MINIMAX_MODEL || 'speech-2.6-hd',
                voice_setting: {
                    voice_id: String(clonedVoiceId),
                    vol: 1,
                    pitch: 0,
                    speed: 1,
                },
                language_boost: 'Auto',
                with_transcript: false,
            }),
        });

        if (!ttsResponse.ok) {
            const errorData = await ttsResponse.text();
            console.error('ai33 minimax tts error:', errorData);
            return NextResponse.json(
                { error: 'Failed to start cloned voice generation. Please try again.' },
                { status: 500 }
            );
        }

        const ttsResult = await ttsResponse.json();
        if (!ttsResult.success || !ttsResult.task_id) {
            return NextResponse.json(
                { error: 'Failed to create cloned voice task' },
                { status: 500 }
            );
        }

        const taskResult = await pollTaskStatus(ttsResult.task_id, apiKey);
        const audioUrl = taskResult?.metadata?.audio_url;

        if (!audioUrl) {
            return NextResponse.json(
                { error: 'No audio URL in response' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            audioUrl,
            taskId: ttsResult.task_id,
            clonedVoiceId: String(clonedVoiceId),
            creditsRemaining: ttsResult.ec_remain_credits,
            voiceName: voiceName || null,
            text,
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
