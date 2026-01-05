import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits, getOrCreateUser } from '@/lib/users';
import { createTransaction } from '@/lib/transactions';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret');
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.userId;
    const creditsAmount = parseInt(session.metadata?.creditsAmount || '0', 10);

    if (userId && creditsAmount > 0) {
        // Ensure user exists (sync with DB)
        // We use customer_email from session if available fallback to one passed in metadata if we stored it
        // Check session.customer_details?.email as well.
        const userEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
        
        console.log(`Processing purchase for user ${userId} (${userEmail})`);
        
        // 1. Get or Create User
        // This ensures the UPDATE in addCredits has a row to update.
        const user = await getOrCreateUser(userId, userEmail);

        // 2. Add Credits
        console.log(`Adding ${creditsAmount} credits to user ${userId}`);
        await addCredits(userId, creditsAmount);

        // Record transaction
        try {
          const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
          const currency = session.currency?.toUpperCase() || 'USD';
          
          await createTransaction(
             user.id, // Use the internal DB ID, NOT the Cognito Sub
             amountTotal,
             currency,
             creditsAmount,
             session.id
          );
          console.log(`Transaction recorded for user ${userId} (Internal ID: ${user.id})`);
        } catch (error) {
           console.error('Failed to record transaction:', error);
        }
    }
  }

  return NextResponse.json({ received: true });
}
