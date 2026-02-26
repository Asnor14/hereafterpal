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
        const targetLang = String(formData.get('targetLang') || 'en').trim();

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

        const dubbingPayload = new FormData();
        dubbingPayload.append('file', file, file.name);
        dubbingPayload.append('num_speakers', '0');
        dubbingPayload.append('disable_voice_cloning', 'false');
        dubbingPayload.append('source_lang', 'auto');
        dubbingPayload.append('target_lang', targetLang);

        const startResponse = await fetch('https://api.ai33.pro/v1/task/dubbing', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: dubbingPayload,
        });

        if (!startResponse.ok) {
            const errorData = await startResponse.text();
            console.error('ai33 dubbing start error:', errorData);
            return NextResponse.json(
                { error: 'Failed to start voice cloning task. Please try again.' },
                { status: 500 }
            );
        }

        const startResult = await startResponse.json();
        if (!startResult.success || !startResult.task_id) {
            return NextResponse.json(
                { error: 'Failed to create voice cloning task' },
                { status: 500 }
            );
        }

        const taskResult = await pollTaskStatus(startResult.task_id, apiKey);
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
            taskId: startResult.task_id,
            creditsRemaining: startResult.ec_remain_credits,
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
