
import { NextRequest, NextResponse } from 'next/server';
import { getUserByCognitoSub, getOrCreateUser } from '@/lib/users';
import { getUserTransactions } from '@/lib/transactions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email'); // Optional but helpful for creation

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
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
      user,
      transactions
    });

  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
