
import { NextRequest, NextResponse } from 'next/server';
import { updateUserSettings, getUserByCognitoSub } from '@/lib/users';
import { sanitizeUser } from '@/lib/sanitize-user';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(req);
    
    const { settings } = await req.json();

    if (!settings) {
      return NextResponse.json({ error: 'Missing settings' }, { status: 400 });
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

    return NextResponse.json({ user: sanitizeUser(updatedUser) });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error updating settings');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
