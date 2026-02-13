import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        // Return a mock response or error if keys are missing to prevent crash
        return NextResponse.json({
            storage: { used_percent: 0, usage: 0, limit: 1000000000 } // Mock
        });
    }

    try {
        // Fetch usage details
        const result = await cloudinary.api.usage();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching Cloudinary stats:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
