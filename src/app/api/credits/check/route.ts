import { NextRequest, NextResponse } from 'next/server';
import { getUserByCognitoSub } from '../../../../lib/users';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await getUserByCognitoSub(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    return NextResponse.json({ success: true, credits: user.credits });
  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
