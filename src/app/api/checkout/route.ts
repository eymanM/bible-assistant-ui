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

    const { userId, email, credits, locale, currency = 'USD' } = await req.json();

    if (!userId || !credits || typeof credits !== 'number' || credits < 10) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    // Dynamic Volume Pricing Logic - Linear Scale
    // Base rate is 14 cents per credit (starts at 10 credits).
    // Lowest rate is 8 cents per credit (500 credits maximum).
    // Decreases the rate by 0.25 cents for every full 20 credits added (starting from 40).
    const cappedCredits = Math.min(500, Math.max(10, credits));
    const steps = Math.max(0, Math.floor((cappedCredits - 20) / 20)); // 0 to 24
    let rateCents = 14 - (steps * 0.25);

    let finalRateCents = rateCents;
    if (currency === 'PLN') {
      finalRateCents = rateCents * 4; // 1 cent USD = 4 grosze PLN
    }

    const totalAmountCents = credits * finalRateCents;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      locale: locale === 'pl' ? 'pl' : 'en',
      allow_promotion_codes: true,
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${credits} AI Request Credits`,
            },
            unit_amount: Math.round(totalAmountCents),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/credits?success=true`,
      cancel_url: `${baseUrl}/credits?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: {
        userId, // Cognito Sub
        creditsAmount: credits.toString(), // Use passed credits
      },
    });

    // --- Record Pending Transaction ---
    try {
       // Look up internal ID
       const user = await getOrCreateUser(userId, email || 'unknown@example.com');
       
       const amountEstimate = totalAmountCents / 100;
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
