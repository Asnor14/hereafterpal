import { NextRequest, NextResponse } from 'next/server';

const AI33PRO_BASE_URL = 'https://api.ai33.pro';

function buildAi33Headers(apiKey: string, includeJson = false): Record<string, string> {
    const headers: Record<string, string> = {
        'xi-api-key': apiKey,
    };
    if (includeJson) headers['Content-Type'] = 'application/json';
    return headers;
}

async function readProviderError(response: Response) {
    const fallback = `Provider request failed with status ${response.status}`;
    try {
        const body = await response.text();
        if (!body) return fallback;
        return `${fallback}: ${body.slice(0, 800)}`;
    } catch {
        return fallback;
    }
}

function normalizeLanguage(raw: string) {
    const value = raw.trim().toLowerCase();
    if (!value || value === 'en' || value === 'english') return 'English';
    if (value === 'fil' || value === 'filipino' || value === 'tl' || value === 'tagalog') return 'Filipino';
    return '';
}

function normalizeGender(raw: string) {
    const value = raw.trim().toLowerCase();
    if (value === 'male') return 'male';
    if (value === 'female') return 'female';
    return '';
}

async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 40, delayMs = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`${AI33PRO_BASE_URL}/v1/task/${taskId}`, {
            method: 'GET',
            headers: buildAi33Headers(apiKey, true),
        });

        if (!response.ok) {
            throw new Error(await readProviderError(response));
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
                { error: 'AI33PRO API not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const text = String(formData.get('text') || '').trim();
        const voiceName = String(formData.get('voiceName') || '').trim();
        const targetLang = String(formData.get('targetLang') || process.env.AI33PRO_MINIMAX_CLONE_LANGUAGE || 'English');
        const gender = String(formData.get('gender') || '').trim();
        const languageTag = normalizeLanguage(targetLang);
        const genderTag = normalizeGender(gender);

        if (!file) {
            return NextResponse.json({ error: 'Voice sample file is required' }, { status: 400 });
        }
        if (!text) {
            return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
        }
        if (!genderTag) {
            return NextResponse.json({ error: 'Gender must be male or female' }, { status: 400 });
        }
        if (!languageTag) {
            return NextResponse.json({ error: 'Language must be English or Filipino' }, { status: 400 });
        }
        if (text.length > 10000) {
            return NextResponse.json({ error: 'Text must be 10000 characters or less' }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: 'Audio file must be 20MB or less' }, { status: 400 });
        }
        if (!file.type.startsWith('audio/')) {
            return NextResponse.json({ error: 'Only audio files are supported for voice cloning' }, { status: 400 });
        }
        if (!file.name.toLowerCase().endsWith('.mp3')) {
            return NextResponse.json({ error: 'Only .mp3 audio files are supported for voice cloning' }, { status: 400 });
        }

        const clonePayload = new FormData();
        clonePayload.append('file', file, file.name);
        clonePayload.append('voice_name', voiceName || 'Memorial Voice');
        clonePayload.append('preview_text', text.slice(0, 500));
        clonePayload.append('language_tag', languageTag);
        clonePayload.append('need_noise_reduction', 'true');
        clonePayload.append('gender_tag', genderTag);

        const cloneResponse = await fetch(`${AI33PRO_BASE_URL}/v1m/voice/clone`, {
            method: 'POST',
            headers: buildAi33Headers(apiKey),
            body: clonePayload,
        });

        if (!cloneResponse.ok) {
            const providerError = await readProviderError(cloneResponse);
            console.error('AI33 Minimax clone error:', providerError);
            return NextResponse.json(
                { error: providerError },
                { status: cloneResponse.status || 500 }
            );
        }

        const cloneResult = await cloneResponse.json();
        const clonedVoiceId = cloneResult?.cloned_voice_id;
        if (!cloneResult?.success || !clonedVoiceId) {
            return NextResponse.json({ error: cloneResult?.error || 'Failed to create cloned voice' }, { status: 500 });
        }

        const ttsResponse = await fetch(`${AI33PRO_BASE_URL}/v1m/task/text-to-speech`, {
            method: 'POST',
            headers: buildAi33Headers(apiKey, true),
            body: JSON.stringify({
                model: process.env.AI33PRO_MINIMAX_MODEL_ID || 'speech-2.6-hd',
                text,
                language_boost: languageTag,
                with_transcript: false,
                voice_setting: {
                    voice_id: String(clonedVoiceId),
                    speed: 1,
                    vol: 1,
                    pitch: 0,
                },
            }),
        });

        if (!ttsResponse.ok) {
            const providerError = await readProviderError(ttsResponse);
            console.error('AI33 Minimax TTS start error:', providerError);
            return NextResponse.json(
                { error: providerError },
                { status: ttsResponse.status || 500 }
            );
        }

        const ttsTask = await ttsResponse.json();
        if (!ttsTask?.success || !ttsTask?.task_id) {
            return NextResponse.json(
                { error: 'Failed to start cloned voice generation task' },
                { status: 500 }
            );
        }

        const taskResult = await pollTaskStatus(String(ttsTask.task_id), apiKey);
        const sourceAudioUrl = taskResult?.metadata?.audio_url;
        if (!sourceAudioUrl) {
            return NextResponse.json({ error: 'No audio URL in task result' }, { status: 500 });
        }

        const audioResponse = await fetch(String(sourceAudioUrl));
        if (!audioResponse.ok) {
            const providerError = await readProviderError(audioResponse);
            return NextResponse.json({ error: providerError }, { status: 500 });
        }

        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        if (!audioBuffer.length) {
            return NextResponse.json({ error: 'No audio data returned from AI33 Minimax' }, { status: 500 });
        }

        const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

        return NextResponse.json({
            success: true,
            audioUrl,
            clonedVoiceId: String(clonedVoiceId),
            voiceName: voiceName || 'Memorial Voice',
            text,
            taskId: String(ttsTask.task_id),
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
