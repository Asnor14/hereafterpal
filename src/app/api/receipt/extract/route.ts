import { NextRequest, NextResponse } from 'next/server';

// ── Rate Limiter (in-memory, per-server-instance) ──
// Prevents excessive API calls to avoid unexpected billing
const RATE_LIMIT = {
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 100,
};

let requestLog: number[] = [];
let dailyCount = 0;
let dailyResetDate = new Date().toDateString();

function checkRateLimit(): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // Reset daily counter if it's a new day
    const today = new Date().toDateString();
    if (today !== dailyResetDate) {
        dailyCount = 0;
        dailyResetDate = today;
    }

    // Check daily limit
    if (dailyCount >= RATE_LIMIT.maxRequestsPerDay) {
        return { allowed: false, reason: `Daily limit reached (${RATE_LIMIT.maxRequestsPerDay}/day). Try again tomorrow.` };
    }

    // Check per-minute limit (sliding window)
    requestLog = requestLog.filter(t => now - t < 60000);
    if (requestLog.length >= RATE_LIMIT.maxRequestsPerMinute) {
        return { allowed: false, reason: `Too many requests. Please wait a minute before trying again.` };
    }

    // Allow and track
    requestLog.push(now);
    dailyCount++;
    return { allowed: true };
}

// ── GET: Health check ──
export async function GET() {
    const hasKey = !!process.env.GROQ_API_KEY;
    return NextResponse.json({
        status: 'Receipt extract API is running (Groq)',
        groqKeyConfigured: hasKey,
        dailyUsage: `${dailyCount}/${RATE_LIMIT.maxRequestsPerDay}`,
    });
}

// ── POST: Extract receipt data using Groq Vision ──
export async function POST(request: NextRequest) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY is not set in environment variables');
        return NextResponse.json({ success: false, error: 'Groq API key not configured' }, { status: 500 });
    }

    // Check rate limit before calling API
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
        console.warn('⚠️ Rate limit hit:', rateCheck.reason);
        return NextResponse.json({ success: false, error: rateCheck.reason }, { status: 429 });
    }

    try {
        let formData;
        try {
            formData = await request.formData();
        } catch (formErr: any) {
            console.error('FormData parsing error:', formErr.message);
            return NextResponse.json(
                { success: false, error: 'Failed to read uploaded file. File may be too large (max 5MB).' },
                { status: 400 }
            );
        }

        const file = formData.get('receipt') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
        }

        console.log('📄 Receipt file received:', file.name, '| Size:', (file.size / 1024).toFixed(1) + 'KB', '| Type:', file.type);

        // Reject files over 4MB to stay safe
        if (file.size > 4 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File too large. Please upload an image under 4MB.' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const mimeType = file.type || 'image/jpeg';

        console.log('🔑 Calling Groq Vision API...');

        // Call Groq Vision API (OpenAI-compatible format)
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are a receipt data extraction AI. Analyze this payment receipt image and extract the following fields. Return ONLY a valid JSON object with these exact keys, no markdown, no explanation:

{
  "amount": <number, the total amount paid, e.g. 4000.00>,
  "currency": "<string, currency code, default 'PHP'>",
  "reference_no": "<string, the reference number>",
  "payment_method": "<string, one of: 'GCash', 'Maya', 'SeaBank', 'Bank Transfer'>",
  "date": "<string, transaction date in ISO format YYYY-MM-DD>",
  "sender_name": "<string, name of sender if visible, otherwise null>",
  "status": "<string, 'completed' if successful, 'pending' if processing, 'failed' if failed>"
}

Rules:
- For GCash receipts: look for "Sent via GCash", "Ref No.", "Amount" or "Total Amount Sent"
- For SeaBank/MariBank receipts: look for "Transfer Amount", "Reference Number", "Transaction Date"
- For Maya receipts: look for amount, reference, date fields
- If a field cannot be found, use null
- The amount should be a number without currency symbols or commas
- Clean the reference number (remove spaces)
- Detect the payment method from the receipt branding/colors/text`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64}`,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0.1,
                max_tokens: 512,
            }),
        });

        console.log('📡 Groq response status:', groqRes.status);

        if (!groqRes.ok) {
            const errBody = await groqRes.text();
            console.error('❌ Groq API error:', errBody);
            return NextResponse.json(
                { success: false, error: `AI service error (${groqRes.status}). Please try again.` },
                { status: 500 }
            );
        }

        const groqData = await groqRes.json();

        // Extract the text response (OpenAI format)
        const responseText = groqData.choices?.[0]?.message?.content || '';

        if (!responseText) {
            console.error('⚠️ Empty Groq response:', JSON.stringify(groqData).substring(0, 500));
            return NextResponse.json(
                { success: false, error: 'AI returned empty response. Try a clearer receipt image.' },
                { status: 500 }
            );
        }

        // Parse JSON from response (strip markdown code fences if present)
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        console.log('✅ AI response:', cleanedText.substring(0, 200));

        let extracted;
        try {
            extracted = JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error('❌ JSON parse failed. Raw text:', cleanedText);
            return NextResponse.json(
                { success: false, error: 'Could not parse receipt data. Try a clearer image.' },
                { status: 500 }
            );
        }

        console.log('✅ Extracted data:', JSON.stringify(extracted));
        console.log(`📊 Usage today: ${dailyCount}/${RATE_LIMIT.maxRequestsPerDay}`);

        return NextResponse.json({
            success: true,
            data: {
                amount: extracted.amount || 0,
                currency: extracted.currency || 'PHP',
                reference_no: extracted.reference_no || '',
                payment_method: extracted.payment_method || 'Unknown',
                date: extracted.date || new Date().toISOString().split('T')[0],
                sender_name: extracted.sender_name || null,
                status: extracted.status || 'pending',
            }
        });

    } catch (error: any) {
        console.error('❌ Receipt extraction error:', error.message);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process receipt' },
            { status: 500 }
        );
    }
}
