import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            { error: 'Missing Supabase service key' },
            { status: 500 }
        );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            throw error;
        }

        // Map Supabase users to AdminUser format
        const adminUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            plan: user.user_metadata?.plan || 'Free', // Assuming plan is stored in metadata
            status: user.banned_until ? 'Suspended' : (user.email_confirmed_at ? 'Active' : 'Pending'),
            storageUsed: '0 MB / 500 MB', // Placeholder until linked with Cloudinary/Storage
            lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
            joinedDate: new Date(user.created_at).toLocaleDateString(),
        }));

        return NextResponse.json(adminUsers);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
