import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import logger from '@/lib/logger';
import { isAdmin } from '../metrics/route';

export async function GET(req: NextRequest) {
  try {
    const isUserAdmin = await isAdmin(req);
    
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch downvoted searches
    // We join searches to get the query and the LLM response.
    const flaggedResult = await pool.query(`
       SELECT 
         us.id as user_search_id,
         us.created_at,
         us.user_id,
         s.query,
         s.response,
         s.language
       FROM bible_assistant.user_searches us
       JOIN bible_assistant.searches s ON us.search_id = s.id
       WHERE us.thumbs_down = true
       ORDER BY us.created_at DESC
       LIMIT $1
    `, [limit]);

    return NextResponse.json({
      success: true,
      flagged: flaggedResult.rows
    });

  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching admin flagged searches');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
