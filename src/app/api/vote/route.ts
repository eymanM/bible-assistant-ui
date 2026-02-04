import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getUserIdFromRequest, getOptionalUserId } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { historyId, searchId, voteType } = body;
    
    // Get verified userId from JWT token (optional for cached searches)
    const userId = await getOptionalUserId(req);

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    let finalHistoryId = historyId;

    // If no historyId but we have searchId + userId, create the user_searches link
    if (!historyId && searchId && userId) {
      try {
        const linkRes = await pool.query(
          `INSERT INTO bible_assistant.user_searches (user_id, search_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [userId, searchId]
        );
        
        if (linkRes.rows[0]) {
          finalHistoryId = linkRes.rows[0].id;
        } else {
          // ON CONFLICT DO NOTHING means it already exists, fetch it
          const existingLink = await pool.query(
            `SELECT id FROM bible_assistant.user_searches 
             WHERE user_id = $1 AND search_id = $2`,
            [userId, searchId]
          );
          if (existingLink.rows[0]) {
            finalHistoryId = existingLink.rows[0].id;
          }
        }
      } catch (linkError) {
        logger.error({ err: linkError }, 'Error creating user_searches link');
        return NextResponse.json({ error: 'Failed to create vote link' }, { status: 500 });
      }
    }

    if (!finalHistoryId) {
      return NextResponse.json({ error: 'Invalid parameters: need historyId or (searchId + userId)' }, { status: 400 });
    }

    const isUp = voteType === 'up';

    // Update the specific user's interaction
    // We toggle the vote: if up is clicked, up=true, down=false
    const result = await pool.query(
      `UPDATE bible_assistant.user_searches 
       SET thumbs_up = $1, thumbs_down = $2
       WHERE id = $3 
       RETURNING thumbs_up, thumbs_down`,
      [isUp, !isUp, finalHistoryId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'History item not found' }, { status: 404 });
    }

    // Return current state and the historyId so frontend can update its state
    return NextResponse.json({ 
      success: true,
      historyId: finalHistoryId,
      vote: {
        thumbsUp: result.rows[0].thumbs_up,
        thumbsDown: result.rows[0].thumbs_down
      }
    });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error processing vote');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
