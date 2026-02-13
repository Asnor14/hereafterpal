import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// GET: Fetch transactions (admin sees all, user sees own)
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }
    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('GET /api/transactions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

// POST: Insert a new transaction
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();

    try {
        const body = await request.json();

        // user_id is required due to foreign key constraint
        if (!body.user_id) {
            return NextResponse.json(
                { error: 'user_id is required. Please ensure a user is logged in.' },
                { status: 400 }
            );
        }

        const insertData: any = {
            user_id: body.user_id,
            amount: body.amount,
            currency: body.currency || 'PHP',
            status: body.status || 'pending',
            payment_method: body.payment_method,
            reference_no: body.reference_no,
        };

        // Only store proof_url if it's a real URL (not a blob: URL)
        if (body.proof_url && !body.proof_url.startsWith('blob:')) {
            insertData.proof_url = body.proof_url;
        }

        console.log('Inserting transaction:', insertData);

        const { data, error } = await supabase
            .from('transactions')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('POST /api/transactions error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('POST /api/transactions catch:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update transaction status (approve/disapprove)
export async function PATCH(request: NextRequest) {
    const supabase = getAdminClient();

    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('transactions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('PATCH /api/transactions error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('PATCH /api/transactions catch:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST handler for uploading proof image to Supabase Storage
export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const transactionId = formData.get('transactionId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${transactionId || Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error('Upload proof error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error: any) {
        console.error('PUT /api/transactions catch:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
