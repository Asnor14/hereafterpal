import { NextRequest, NextResponse } from 'next/server';

const CARTESIA_BASE_URL = 'https://api.cartesia.ai';

function buildCartesiaHeaders(apiKey: string, apiVersion: string, includeJson = false): Record<string, string> {
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
        'Cartesia-Version': apiVersion,
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
    if (!value) return 'en';
    if (value === 'english') return 'en';
    // Product rule: when user chooses Tagalog, send Malay in the background.
    if (value === 'tagalog' || value === 'tl' || value === 'malay') return 'ms';
    return value;
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.CARTESIA_API_KEY;
        const apiVersion = process.env.CARTESIA_VERSION || '2025-04-16';
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Cartesia API not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const text = String(formData.get('text') || '').trim();
        const voiceName = String(formData.get('voiceName') || '').trim();
        const targetLang = String(formData.get('targetLang') || process.env.CARTESIA_CLONE_LANGUAGE || 'en');
        const baseVoiceId = String(formData.get('baseVoiceId') || process.env.CARTESIA_CLONE_BASE_VOICE_ID || '').trim();

        if (!file) {
            return NextResponse.json({ error: 'Voice sample file is required' }, { status: 400 });
        }
        if (!text) {
            return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
        }
        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text must be 5000 characters or less' }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: 'Audio file must be 20MB or less' }, { status: 400 });
        }
        if (!file.type.startsWith('audio/')) {
            return NextResponse.json({ error: 'Only audio files are supported for voice cloning' }, { status: 400 });
        }

        const clonePayload = new FormData();
        clonePayload.append('clip', file, file.name);
        clonePayload.append('name', voiceName || 'Memorial Voice');
        clonePayload.append('language', normalizeLanguage(targetLang));
        if (baseVoiceId) {
            clonePayload.append('base_voice_id', baseVoiceId);
        }

        const cloneResponse = await fetch(`${CARTESIA_BASE_URL}/voices/clone`, {
            method: 'POST',
            headers: buildCartesiaHeaders(apiKey, apiVersion),
            body: clonePayload,
        });

        if (!cloneResponse.ok) {
            const providerError = await readProviderError(cloneResponse);
            console.error('Cartesia clone error:', providerError);
            return NextResponse.json(
                { error: providerError },
                { status: cloneResponse.status || 500 }
            );
        }

        const cloneResult = await cloneResponse.json();
        const clonedVoiceId = cloneResult?.id;
        if (!clonedVoiceId) {
            return NextResponse.json({ error: 'Failed to create cloned voice' }, { status: 500 });
        }

        const ttsResponse = await fetch(`${CARTESIA_BASE_URL}/tts/bytes`, {
            method: 'POST',
            headers: buildCartesiaHeaders(apiKey, apiVersion, true),
            body: JSON.stringify({
                model_id: process.env.CARTESIA_TTS_MODEL_ID || 'sonic-2',
                transcript: text,
                voice: {
                    mode: 'id',
                    id: String(clonedVoiceId),
                },
                language: normalizeLanguage(targetLang),
                output_format: {
                    container: 'mp3',
                    sample_rate: 44100,
                    bit_rate: 128000,
                },
            }),
        });

        if (!ttsResponse.ok) {
            const providerError = await readProviderError(ttsResponse);
            console.error('Cartesia TTS error:', providerError);
            return NextResponse.json(
                { error: providerError },
                { status: ttsResponse.status || 500 }
            );
        }

        const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
        if (!audioBuffer.length) {
            return NextResponse.json({ error: 'No audio data returned from Cartesia' }, { status: 500 });
        }

        const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

        return NextResponse.json({
            success: true,
            audioUrl,
            clonedVoiceId: String(clonedVoiceId),
            voiceName: voiceName || 'Memorial Voice',
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
