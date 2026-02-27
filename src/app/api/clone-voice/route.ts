import { NextRequest, NextResponse } from 'next/server';

const CARTESIA_BASE_URL = 'https://api.cartesia.ai';

function normalizeLanguage(raw: string) {
    const value = raw.trim().toLowerCase();
    if (!value) return 'en';
    if (value === 'english') return 'en';
    if (value === 'tagalog') return 'tl';
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
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Cartesia-Version': apiVersion,
            },
            body: clonePayload,
        });

        if (!cloneResponse.ok) {
            const errorBody = await cloneResponse.text();
            console.error('Cartesia clone error:', errorBody);
            return NextResponse.json(
                { error: 'Failed to clone voice sample. Please try again.' },
                { status: 500 }
            );
        }

        const cloneResult = await cloneResponse.json();
        const clonedVoiceId = cloneResult?.id;
        if (!clonedVoiceId) {
            return NextResponse.json({ error: 'Failed to create cloned voice' }, { status: 500 });
        }

        const ttsResponse = await fetch(`${CARTESIA_BASE_URL}/tts/bytes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Cartesia-Version': apiVersion,
                'Content-Type': 'application/json',
            },
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
            const errorBody = await ttsResponse.text();
            console.error('Cartesia TTS error:', errorBody);
            return NextResponse.json(
                { error: 'Failed to generate cloned voice audio. Please try again.' },
                { status: 500 }
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
