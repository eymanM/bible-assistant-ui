
import { NextRequest, NextResponse } from 'next/server';
import { updateUserSettings, getUserByCognitoSub } from '@/lib/users';

export async function POST(req: NextRequest) {
  try {
    const { userId, settings } = await req.json();

    if (!userId || !settings) {
      return NextResponse.json({ error: 'Missing userId or settings' }, { status: 400 });
    }

    // Verify user exists
    const user = await getUserByCognitoSub(userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge with existing settings
    const existingSettings = user.settings || {};
    const newSettings = { ...existingSettings, ...settings };

    const updatedUser = await updateUserSettings(userId, newSettings);

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
