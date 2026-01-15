import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { historyId, voteType } = body;

    if (!historyId || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const column = voteType === 'up' ? 'thumbs_up' : 'thumbs_down';

    // Increment the vote count safely
    const result = await pool.query(
      `UPDATE bible_assistant.search_history 
       SET ${column} = COALESCE(${column}, 0) + 1 
       WHERE id = $1 
       RETURNING thumbs_up, thumbs_down`,
      [historyId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'History item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      counts: {
        thumbsUp: result.rows[0].thumbs_up,
        thumbsDown: result.rows[0].thumbs_down
      }
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
