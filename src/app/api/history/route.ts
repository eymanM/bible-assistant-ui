
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
      'SELECT * FROM bible_assistant.search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    // Parse JSON fields
    const history = result.rows.map(row => ({
      ...row,
      bible_results: row.bible_results ? JSON.parse(row.bible_results) : [],
      commentary_results: row.commentary_results ? JSON.parse(row.commentary_results) : [],
      settings: row.settings || null
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

    const result = await pool.query(
      'INSERT INTO bible_assistant.search_history (user_id, query, response, bible_results, commentary_results, language, settings) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, query, response || null, JSON.stringify(bible_results || []), JSON.stringify(commentary_results || []), language || 'en', settings ? JSON.stringify(settings) : null]
    );

    return NextResponse.json({ success: true, entry: result.rows[0] });
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

    // Delete only if it belongs to the user
    const result = await pool.query(
      'DELETE FROM bible_assistant.search_history WHERE id = $1 AND user_id = $2 RETURNING *',
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
