import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createFishModel(apiKey: string, file: File, voiceName: string) {
    const createModelData = new FormData();
    createModelData.append('type', 'tts');
    createModelData.append('title', voiceName || 'Memorial Voice Clone');
    createModelData.append('visibility', 'private');
    createModelData.append('train_mode', 'fast');
    createModelData.append('enhance_audio_quality', 'true');
    createModelData.append('voices', file, file.name);

    const response = await fetch('https://api.fish.audio/model', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: createModelData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Fish model: ${errorText}`);
    }

    const data = await response.json();
    const modelId = String(data?._id || '');
    if (!modelId) {
        throw new Error('Fish model creation did not return a model ID');
    }

    return modelId;
}

async function synthesizeWithFish(apiKey: string, modelId: string, text: string) {
    let lastError = 'Fish TTS failed';

    for (let attempt = 0; attempt < 12; attempt++) {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                model: 's1',
            },
            body: JSON.stringify({
                text,
                reference_id: modelId,
                format: 'mp3',
            }),
        });

        if (response.ok) {
            return Buffer.from(await response.arrayBuffer());
        }

        lastError = await response.text();
        await sleep(2500);
    }

    throw new Error(`Failed to generate cloned voice audio: ${lastError}`);
}

async function uploadAudioToCloudinary(audioBuffer: Buffer) {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        return null;
    }

    return new Promise<string>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
            {
                folder: 'memorial_voice',
                resource_type: 'video',
                format: 'mp3',
            },
            (error, result) => {
                if (error || !result?.secure_url) {
                    reject(error || new Error('Cloudinary upload failed'));
                    return;
                }
                resolve(result.secure_url);
            }
        );

        upload.end(audioBuffer);
    });
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.FISH_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Fish API not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const text = String(formData.get('text') || '').trim();
        const voiceName = String(formData.get('voiceName') || '').trim();

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

        const modelId = await createFishModel(apiKey, file, voiceName);
        const audioBuffer = await synthesizeWithFish(apiKey, modelId, text);

        let audioUrl: string | null = null;
        try {
            audioUrl = await uploadAudioToCloudinary(audioBuffer);
        } catch (uploadError) {
            console.error('Cloudinary upload failed, falling back to data URL:', uploadError);
        }

        if (!audioUrl) {
            const base64Audio = audioBuffer.toString('base64');
            audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        }

        return NextResponse.json({
            success: true,
            audioUrl,
            clonedVoiceId: modelId,
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
