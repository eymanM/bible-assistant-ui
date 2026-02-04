
import { NextRequest, NextResponse } from 'next/server';
import { getUserByCognitoSub, getOrCreateUser } from '@/lib/users';
import { getUserTransactions } from '@/lib/transactions';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizeUser } from '@/lib/sanitize-user';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get verified userId from JWT token (not from query params!)
    const userId = await getUserIdFromRequest(req);
    
    // Optional: Get email from query for lazy user creation
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const allowed = await checkRateLimit(userId, 'general');
    if (!allowed) {
        return NextResponse.json({ error: 'Daily request limit exceeded' }, { status: 429 });
    }

    let user = await getUserByCognitoSub(userId);
    
    // Lazy create if email is provided and user not found
    if (!user && email) {
       user = await getOrCreateUser(userId, email);
    }
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions = await getUserTransactions(user.id);

    return NextResponse.json({
      user: sanitizeUser(user),
      transactions
    });

  } catch (error: any) {
    // Check if it's an authentication error
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    logger.error({ err: error }, 'Error fetching user data');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
