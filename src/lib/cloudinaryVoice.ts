import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';

let configured = false;

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    return { cloudName, apiKey, apiSecret };
}

function ensureConfigured() {
    if (configured) return;
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary is not configured for voice uploads');
    }
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    configured = true;
}

export async function uploadVoiceBufferToCloudinary(
    audioBuffer: Buffer,
    options?: {
        folder?: string;
        publicIdPrefix?: string;
    }
) {
    ensureConfigured();
    if (!audioBuffer.length) {
        throw new Error('Voice audio buffer is empty');
    }

    const folder = options?.folder || process.env.CLOUDINARY_VOICE_FOLDER || 'memorial/voices';
    const publicIdPrefix = options?.publicIdPrefix || 'voice';
    const publicId = `${publicIdPrefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;

    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video', // Cloudinary audio is handled under "video"
                folder,
                public_id: publicId,
                format: 'mp3',
                overwrite: false,
                use_filename: false,
                unique_filename: false,
            },
            (error, result) => {
                if (error || !result?.secure_url) {
                    reject(error || new Error('Cloudinary did not return a secure URL'));
                    return;
                }
                resolve(result.secure_url);
            }
        );

        stream.end(audioBuffer);
    });
}
