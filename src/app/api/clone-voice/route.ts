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
            throw new Error(taskData.error_message || 'Voice generation failed');
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Voice generation timed out');
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
        const gender = String(formData.get('gender') || '').toLowerCase();

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

        const isMp3ByName = file.name.toLowerCase().endsWith('.mp3');
        const isMp3ByType = file.type === 'audio/mpeg' || file.type === 'audio/mp3';
        if (!isMp3ByName && !isMp3ByType) {
            return NextResponse.json(
                { error: 'Only MP3 files are supported for voice cloning' },
                { status: 400 }
            );
        }

        const cloneFormData = new FormData();
        cloneFormData.append('file', file, file.name);
        cloneFormData.append('voice_name', voiceName || 'Memorial Voice Clone');
        cloneFormData.append('preview_text', text.slice(0, 200));
        cloneFormData.append('language_tag', 'English');
        cloneFormData.append('need_noise_reduction', 'true');
        if (gender === 'male' || gender === 'female') {
            cloneFormData.append('gender_tag', gender);
        }

        const cloneResponse = await fetch('https://api.ai33.pro/v1m/voice/clone', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: cloneFormData,
        });

        if (!cloneResponse.ok) {
            const errorText = await cloneResponse.text();
            return NextResponse.json(
                { error: `Failed to clone voice: ${errorText}` },
                { status: 500 }
            );
        }

        const cloneData = await cloneResponse.json();
        const clonedVoiceId = String(cloneData.cloned_voice_id || '');
        if (!cloneData.success || !clonedVoiceId) {
            return NextResponse.json(
                { error: 'Voice clone did not return a valid voice ID' },
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
                model: 'speech-2.6-hd',
                voice_setting: {
                    voice_id: clonedVoiceId,
                    vol: 1,
                    pitch: 0,
                    speed: 1,
                },
                language_boost: 'Auto',
            }),
        });

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            return NextResponse.json(
                { error: `Failed to generate cloned voice audio: ${errorText}` },
                { status: 500 }
            );
        }

        const ttsData = await ttsResponse.json();
        if (!ttsData.success || !ttsData.task_id) {
            return NextResponse.json(
                { error: 'Failed to create cloned voice task' },
                { status: 500 }
            );
        }

        const taskResult = await pollTaskStatus(ttsData.task_id, apiKey);
        const audioUrl = taskResult.metadata?.audio_url;

        if (!audioUrl) {
            return NextResponse.json(
                { error: 'No audio URL returned from cloned voice task' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            audioUrl,
            taskId: ttsData.task_id,
            clonedVoiceId,
            creditsRemaining: ttsData.ec_remain_credits,
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
