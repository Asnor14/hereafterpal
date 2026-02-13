import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// GET: Fetch subscriptions
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    // Order by start_date since there's no created_at column
    let query = supabase.from('subscriptions').select('*').order('start_date', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }
    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

// POST: Create or update a subscription for a user
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();

    try {
        const body = await request.json();
        console.log('📝 POST /api/subscriptions body:', JSON.stringify(body));

        if (!body.user_id) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
        }

        const plan = body.plan || 'free';
        const status = body.status || 'pending';

        // Check if user already has a subscription
        const { data: existing } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', body.user_id)
            .maybeSingle();

        if (existing) {
            // Update existing subscription
            console.log('⚠️ User already has subscription, updating plan to:', plan);
            const { data: updated, error: updateError } = await supabase
                .from('subscriptions')
                .update({ plan, status })
                .eq('user_id', body.user_id)
                .select()
                .single();

            if (updateError) {
                console.error('❌ Update error:', JSON.stringify(updateError, null, 2));
                return NextResponse.json({
                    error: updateError.message || 'Update failed',
                    code: updateError.code,
                }, { status: 500 });
            }

            console.log('✅ Subscription updated:', updated?.id);
            return NextResponse.json(updated);
        }

        // Insert new - only use columns that exist in the table
        console.log('📝 Inserting new subscription for:', body.user_id);
        const { data: inserted, error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: body.user_id,
                plan,
                status,
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert error:', JSON.stringify(insertError, null, 2));
            return NextResponse.json({
                error: insertError.message || 'Insert failed',
                code: insertError.code,
            }, { status: 500 });
        }

        console.log('✅ Subscription created:', inserted?.id);
        return NextResponse.json(inserted);

    } catch (error: any) {
        console.error('❌ POST /api/subscriptions catch:', error?.message || error);
        return NextResponse.json({
            error: error?.message || String(error) || 'Internal server error'
        }, { status: 500 });
    }
}

// PATCH: Update subscription (activate, expire, etc.)
export async function PATCH(request: NextRequest) {
    const supabase = getAdminClient();

    try {
        const body = await request.json();
        console.log('🔧 PATCH /api/subscriptions body:', JSON.stringify(body));

        if (!body.id && !body.user_id) {
            return NextResponse.json({ error: 'id or user_id is required' }, { status: 400 });
        }

        const userId = body.user_id;

        // Build update object — only columns that exist in the table
        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.plan) updateData.plan = body.plan;
        if (body.start_date) updateData.start_date = body.start_date;
        if (body.end_date) {
            updateData.end_date = body.end_date;
            updateData.expiry_date = body.end_date;
        }
        if (body.auto_renew !== undefined) updateData.auto_renew = body.auto_renew;

        // Check if subscription exists
        const { data: existing } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            console.log('🔧 Updating existing subscription:', existing.id);
            const { data: updated, error: updateError } = await supabase
                .from('subscriptions')
                .update(updateData)
                .eq('user_id', userId)
                .select()
                .single();

            if (updateError) {
                console.error('❌ PATCH update error:', JSON.stringify(updateError, null, 2));
                return NextResponse.json({
                    error: updateError.message || 'Update failed',
                    code: updateError.code,
                }, { status: 500 });
            }

            console.log('✅ Subscription updated:', updated?.id);
            return NextResponse.json(updated);
        }

        // No subscription exists — create one
        console.log('📝 No subscription found, creating for:', userId);
        const insertData: any = {
            user_id: userId,
            plan: body.plan || 'free',
            status: body.status || 'active',
        };
        if (body.start_date) insertData.start_date = body.start_date;
        if (body.end_date) {
            insertData.end_date = body.end_date;
            insertData.expiry_date = body.end_date;
        }

        const { data: inserted, error: insertError } = await supabase
            .from('subscriptions')
            .insert(insertData)
            .select()
            .single();

        if (insertError) {
            console.error('❌ PATCH insert error:', JSON.stringify(insertError, null, 2));
            return NextResponse.json({
                error: insertError.message || 'Insert failed',
                code: insertError.code,
            }, { status: 500 });
        }

        console.log('✅ Subscription created via PATCH:', inserted?.id);
        return NextResponse.json(inserted);

    } catch (error: any) {
        console.error('❌ PATCH /api/subscriptions catch:', error?.message || error);
        return NextResponse.json({
            error: error?.message || String(error) || 'Internal server error'
        }, { status: 500 });
    }
}
