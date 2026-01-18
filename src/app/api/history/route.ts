
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
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

    // Parse JSON fields
    const history = result.rows.map(row => ({
      id: row.history_id, // Frontend expects 'id' for the history item
      user_id: row.user_id,
      query: row.query,
      response: row.response,
      bible_results: row.bible_results ? JSON.parse(row.bible_results) : [],
      commentary_results: row.commentary_results ? JSON.parse(row.commentary_results) : [],
      settings: row.settings || null,
      language: row.language,
      thumbs_up: row.thumbs_up ? 1 : 0, // Convert boolean to count for frontend compatibility if needed, or just boolean
      thumbs_down: row.thumbs_down ? 1 : 0,
      created_at: row.created_at
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, query, response, bible_results, commentary_results, language, settings } = body;

    if (!userId || !query) {
      return NextResponse.json({ error: 'Missing userId or query' }, { status: 400 });
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
      const existingSearch = await client.query(
        `SELECT id FROM bible_assistant.searches 
         WHERE query = $1 AND language = $2 AND (settings IS NOT DISTINCT FROM $3::jsonb)`,
        [query, lang, searchSettings]
      );

      if (existingSearch.rows.length > 0) {
        searchId = existingSearch.rows[0].id;
      } else {
        // Insert new search
        const insertSearch = await client.query(
          `INSERT INTO bible_assistant.searches (query, language, settings, response, bible_results, commentary_results)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (query, language, settings) DO UPDATE SET query = EXCLUDED.query -- dummy update to return id if race condition
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
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 });
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
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
