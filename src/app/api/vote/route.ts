import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { historyId, voteType } = body;

    // historyId refers to bible_assistant.user_searches.id
    if (!historyId || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const isUp = voteType === 'up';

    // Update the specific user's interaction
    // We toggle the vote: if up is clicked, up=true, down=false
    const result = await pool.query(
      `UPDATE bible_assistant.user_searches 
       SET thumbs_up = $1, thumbs_down = $2
       WHERE id = $3 
       RETURNING thumbs_up, thumbs_down`,
      [isUp, !isUp, historyId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'History item not found' }, { status: 404 });
    }

    // Return current state (booleans converted to what frontend might expect if it wants verification)
    // Note: The previous API returned counts, but now this is a user-specific action.
    // If the frontend expects total counts, we would need to query the aggregate from user_searches for this search_id.
    // However, for the user's immediate feedback, reflecting their choice is usually sufficient.
    
    return NextResponse.json({ 
      success: true, 
      vote: {
        thumbsUp: result.rows[0].thumbs_up,
        thumbsDown: result.rows[0].thumbs_down
      }
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
