
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const user = await getOrCreateUser(userId, email);

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
