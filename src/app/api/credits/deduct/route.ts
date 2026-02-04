import { NextRequest, NextResponse } from 'next/server';
import { deductCredits } from '../../../../lib/users';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(request);
    
    const { amount = 1 } = await request.json();

    const updatedUser = await deductCredits(userId, amount);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Insufficient credits or user not found' }, { status: 400 });
    }

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error deducting credits');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
