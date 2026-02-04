
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getUserIdFromRequest } from '@/lib/auth-middleware';
import logger from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(req);
    
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await pool.query(
      `SELECT us.id as history_id, us.user_id, us.thumbs_up, us.thumbs_down, us.created_at,
              s.id as search_id, s.query, s.response, s.bible_results, s.commentary_results, s.language, s.settings
       FROM bible_assistant.user_searches us
       JOIN bible_assistant.searches s ON us.search_id = s.id
       WHERE us.user_id = $1 
       ORDER BY us.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Parse JSON fields with defensive type checking
    const history = result.rows.map(row => {
      // Safely parse bible_results
      let bibleResults = [];
      if (row.bible_results) {
        try {
          bibleResults = typeof row.bible_results === 'string' 
            ? JSON.parse(row.bible_results) 
            : row.bible_results;
        } catch (e) {
          bibleResults = [];
        }
      }

      // Safely parse commentary_results
      let commentaryResults = [];
      if (row.commentary_results) {
        try {
          commentaryResults = typeof row.commentary_results === 'string' 
            ? JSON.parse(row.commentary_results) 
            : row.commentary_results;
        } catch (e) {
          commentaryResults = [];
        }
      }

      return {
        id: row.history_id, // Frontend expects 'id' for the history item
        user_id: row.user_id,
        query: row.query,
        response: row.response,
        bible_results: bibleResults,
        commentary_results: commentaryResults,
        settings: row.settings || null,
        language: row.language,
        thumbs_up: row.thumbs_up ? 1 : 0, // Convert boolean to count for frontend compatibility if needed, or just boolean
        thumbs_down: row.thumbs_down ? 1 : 0,
        created_at: row.created_at
      };
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error fetching history');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, response, bible_results, commentary_results, language, settings } = body;
    
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(req);

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert or Get Search
      // We rely on the UNIQUE constraint on (query, language, settings)
      const searchSettings = settings ? JSON.stringify(settings) : null;
      const lang = language || 'en';
      
      let searchId;

      // Try to find existing search first
      // We want the LATEST one that matches query/settings.
      const existingSearch = await client.query(
        `SELECT id, response FROM bible_assistant.searches 
         WHERE query = $1 AND language = $2 AND (settings IS NOT DISTINCT FROM $3::jsonb)
         ORDER BY created_at DESC
         LIMIT 1`,
        [query, lang, searchSettings]
      );

      let shouldUseExisting = false;
      if (existingSearch.rows.length > 0) {
        const row = existingSearch.rows[0];
        // If response matches (or both null), reuse it. 
        // We compare response to ensure we link to the specific generation user just saw.
        if (row.response === (response || null)) {
            searchId = row.id;
            shouldUseExisting = true;
        }
      }

      if (!shouldUseExisting) {
        // Insert new search
        const insertSearch = await client.query(
          `INSERT INTO bible_assistant.searches (query, language, settings, response, bible_results, commentary_results)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            query, 
            lang, 
            searchSettings, 
            response || null, 
            JSON.stringify(bible_results || []), 
            JSON.stringify(commentary_results || [])
          ]
        );
        searchId = insertSearch.rows[0].id;
      }

      // 2. Insert User Search Link
      const userSearch = await client.query(
        `INSERT INTO bible_assistant.user_searches (user_id, search_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, searchId]
      );

      await client.query('COMMIT');

      // Construct return object similar to GET
      const entry = {
        id: userSearch.rows[0].id,
        user_id: userSearch.rows[0].user_id,
        query,
        response,
        bible_results: bible_results || [],
        commentary_results: commentary_results || [],
        language: lang,
        settings: settings || null,
        created_at: userSearch.rows[0].created_at
      };

      return NextResponse.json({ success: true, entry });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error saving history');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // Get verified userId from JWT token
    const userId = await getUserIdFromRequest(req);

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Delete only from user_searches
    const result = await pool.query(
      'DELETE FROM bible_assistant.user_searches WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'History item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('token') || error.message?.includes('authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ err: error }, 'Error deleting history');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
