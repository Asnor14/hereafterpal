// src/app/api/create-checkout/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Price list
const prices = {
  legacy: { amount: 29900, name: 'The Legacy Plan' },
  evermore: { amount: 349900, name: 'The Evermore Plan' },
}

export async function POST(request) {
  try {
    // Use require inside function to avoid bundling issues
    const Paymongo = require('paymongo')
    const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY)

    const { plan, userId } = await request.json()
    if (!plan || !userId) throw new Error('Plan and User ID are required')
    if (!prices[plan]) throw new Error('Invalid plan')

    const selectedPrice = prices[plan]

    // Create a new checkout session with PayMongo
    const { data: session } = await paymongo.checkoutSessions.create({
      attributes: {
        payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay'],
        line_items: [
          {
            amount: selectedPrice.amount,
            currency: 'PHP',
            images: [],
            name: selectedPrice.name,
            quantity: 1,
          },
        ],
        metadata: {
          supabase_user_id: userId,
          plan: plan,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=cancel`,
      },
    })
    
    return NextResponse.json({ checkoutUrl: session.attributes.checkout_url })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
