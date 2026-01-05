import { NextRequest, NextResponse } from 'next/server';
import { deductCredits } from '../../../../lib/users';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount = 1 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await deductCredits(userId, amount);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Insufficient credits or user not found' }, { status: 400 });
    }

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
