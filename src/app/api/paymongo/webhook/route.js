// src/app/api/paymongo/webhook/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { createRequire } from 'module'

// Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Import the CommonJS wrapper using createRequire
    const require = createRequire(import.meta.url)
    const { createPaymongoClient } = require('../../lib/paymongo.cjs')
    const paymongo = createPaymongoClient(process.env.PAYMONGO_SECRET_KEY)

    const rawBody = await request.text()
    const signature = headers().get('paymongo-signature')
    
    // Verify the webhook signature
    const event = paymongo.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.PAYMONGO_WEBHOOK_SECRET
    )

    // Handle the 'checkout.session.completed' event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.attributes.data
      const metadata = session.attributes.metadata
      const userId = metadata.supabase_user_id
      const plan = metadata.plan

      if (userId && plan) {
        const expiry_date = new Date()
        if (plan === 'legacy') {
          expiry_date.setMonth(expiry_date.getMonth() + 1)
        } else if (plan === 'evermore') {
          expiry_date.setFullYear(expiry_date.getFullYear() + 1)
        }

        // Use upsert to create or update the subscription
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: plan,
              status: 'active',
              expiry_date: expiry_date.toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (error) throw new Error(`Supabase error: ${error.message}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }
}
