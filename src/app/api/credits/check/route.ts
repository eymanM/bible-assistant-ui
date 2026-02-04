import { NextRequest, NextResponse } from 'next/server';
import { getUserByCognitoSub } from '../../../../lib/users';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(request);

    const user = await getUserByCognitoSub(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    return NextResponse.json({ success: true, credits: user.credits });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error checking credits');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
