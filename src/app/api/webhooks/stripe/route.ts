import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits, getOrCreateUser } from '@/lib/users';
import { createTransaction, updateTransactionStatus } from '@/lib/transactions';

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

        // Record or Update transaction
        try {
          const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
          const currency = session.currency?.toUpperCase() || 'USD';
          
          // Try to update existing 'pending' transaction first
          const updated = await updateTransactionStatus(session.id, 'succeeded');
          
          if (!updated) {
               // Fallback: Create new if not found (e.g. created before we started tracking pending)
               await createTransaction(
                 user.id, 
                 amountTotal,
                 currency,
                 creditsAmount,
                 session.id,
                 'succeeded'
               );
               console.log(`Transaction created (fallback) for user ${userId}`);
          } else {
             console.log(`Transaction status updated to succeeded for user ${userId}`);
          }
        } catch (error) {
           console.error('Failed to record transaction:', error);
        }
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Checkout session expired: ${session.id}`);
    await updateTransactionStatus(session.id, 'canceled');
  } else if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Async payment failed for session: ${session.id}`);
    await updateTransactionStatus(session.id, 'failed');
  }

  return NextResponse.json({ received: true });
}
