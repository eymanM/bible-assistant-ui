import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createTransaction } from '@/lib/transactions';
import { getOrCreateUser } from '@/lib/users';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe Secret Key is missing');
      return NextResponse.json({ error: 'Server configuration error: Stripe key missing' }, { status: 500 });
    }

    const { priceId, userId, email, credits } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // You can hardcode priceId mapping to credits amount here or pass it in metadata
    // For simplicity, let's say priceId is the amount of credits for now or mapped on client
    // But better to use actual Stripe Price IDs.
    // Assuming the client sends a Price ID.

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/credits?success=true`,
      cancel_url: `${baseUrl}/credits?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: {
        userId, // Cognito Sub
        creditsAmount: credits?.toString() || '10', // Use passed credits
      },
    });

    // --- Record Pending Transaction ---
    try {
       // Look up internal ID
       const user = await getOrCreateUser(userId, email || 'unknown@example.com');
       
       const amountEstimate = 0;
       const currency = 'USD';

       await createTransaction(
         user.id,
         amountEstimate,
         currency,
         credits || 0,
         session.id,
         'pending'
       );
    } catch (txErr) {
       console.error('Failed to record pending transaction:', txErr);
       // We don't block the user, just log it.
    }
    // ----------------------------------

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
