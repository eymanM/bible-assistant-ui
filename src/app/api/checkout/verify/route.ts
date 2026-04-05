import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrCreateUser, addCredits } from '@/lib/users';
import { getTransactionBySessionId, updateTransactionStatus, createTransaction } from '@/lib/transactions';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' as any })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Check if already processed to avoid double assignment
      const tx = await getTransactionBySessionId(sessionId);
      if (tx && tx.status === 'succeeded') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }
      
      const userId = session.metadata?.userId;
      const creditsAmount = parseInt(session.metadata?.creditsAmount || '0', 10);
      
      if (userId && creditsAmount > 0) {
        const userEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
        const user = await getOrCreateUser(userId, userEmail);
        
        await addCredits(userId, creditsAmount);
        
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
        const currency = session.currency?.toUpperCase() || 'USD';
        
        const updated = await updateTransactionStatus(session.id, 'succeeded');
        if (!updated) {
          await createTransaction(user.id, amountTotal, currency, creditsAmount, session.id, 'succeeded');
        }
      }
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
