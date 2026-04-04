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
    
    // For synchronous payments (cards) or instant (BLIK), payment_status is 'paid' here.
    // For delayed async payments (P24), it might be 'unpaid' here.
    if (session.payment_status === 'paid') {
      await handleSuccessfulPayment(session);
    } else {
      console.log(`Session ${session.id} completed, but payment_status is ${session.payment_status} (waiting for async_payment_succeeded)`);
    }
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Async payment succeeded for session: ${session.id}`);
    await handleSuccessfulPayment(session);
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

// Reusable function to handle credit assignment
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const creditsAmount = parseInt(session.metadata?.creditsAmount || '0', 10);

  if (userId && creditsAmount > 0) {
    const userEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
    console.log(`Processing successful payment for user ${userId} (${userEmail})`);
    
    // 1. Get or Create User
    const user = await getOrCreateUser(userId, userEmail);

    // 2. Add Credits
    console.log(`Adding ${creditsAmount} credits to user ${userId}`);
    await addCredits(userId, creditsAmount);

    // 3. Record or Update transaction
    try {
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
      const currency = session.currency?.toUpperCase() || 'USD';
      
      const updated = await updateTransactionStatus(session.id, 'succeeded');
      
      if (!updated) {
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
}

