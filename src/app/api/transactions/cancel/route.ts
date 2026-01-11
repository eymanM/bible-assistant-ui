import { NextRequest, NextResponse } from 'next/server';
import { updateTransactionStatus } from '@/lib/transactions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const updatedTransaction = await updateTransactionStatus(sessionId, 'canceled');

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
