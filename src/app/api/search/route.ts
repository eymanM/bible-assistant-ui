import { NextRequest, NextResponse } from 'next/server';
import { API_DOMAIN } from '../../../config/apiConfig';
import { pool } from '../../../lib/db';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, settings } = body;

    // 1. Attempt to find cached result
    if (query && settings) {
      try {
        const { language, ...querySettings } = settings;
        
        // Fetch matching result directly from DB using JSONB containment
        // Filter out results where aggregate thumbs_down > thumbs_up
        // Use COALESCE to handle cases with no user_searches entries yet
        const result = await pool.query(
          `SELECT s.*, 
                  COALESCE(SUM(CASE WHEN us.thumbs_up THEN 1 ELSE 0 END), 0) as up_votes,
                  COALESCE(SUM(CASE WHEN us.thumbs_down THEN 1 ELSE 0 END), 0) as down_votes
           FROM bible_assistant.searches s
           LEFT JOIN bible_assistant.user_searches us ON s.id = us.search_id
           WHERE s.query = $1 
           AND s.language = $2 
           AND s.settings @> $3::jsonb
           GROUP BY s.id
           HAVING COALESCE(SUM(CASE WHEN us.thumbs_down THEN 1 ELSE 0 END), 0) <= COALESCE(SUM(CASE WHEN us.thumbs_up THEN 1 ELSE 0 END), 0)
           ORDER BY s.created_at DESC 
           LIMIT 1`,
          [query, language || 'en', JSON.stringify(querySettings)]
        );

        const match = result.rows[0];

        if (match) {
          const encoder = new TextEncoder();
          const cleanString = (str: string) => str ? str.replace(/\n/g, " ") : "";
          

          const stream = new ReadableStream({
            async start(controller) {
              try {
                // Send Results Event
                const bibleResults = match.bible_results ? (typeof match.bible_results === 'string' ? JSON.parse(match.bible_results) : match.bible_results) : [];
                const commentaryResults = match.commentary_results ? (typeof match.commentary_results === 'string' ? JSON.parse(match.commentary_results) : match.commentary_results) : [];

                const resultsData = JSON.stringify({
                  bible_results: bibleResults,
                  commentary_results: commentaryResults,
                  search_id: match.id // Return search_id instead of history_id
                });
                
                controller.enqueue(encoder.encode(`event: results\n`));
                controller.enqueue(encoder.encode(`data: ${cleanString(resultsData)}\n\n`));

                // Send Token Events (Simulate Streaming)
                const fullResponse = match.response || '';
                const chunkSize = 5; // Characters per chunk

                for (let i = 0; i < fullResponse.length; i += chunkSize) {
                  const chunk = fullResponse.slice(i, i + chunkSize);
                  const tokenData = JSON.stringify({ token: chunk });
                  
                  controller.enqueue(encoder.encode(`event: token\n`));
                  controller.enqueue(encoder.encode(`data: ${cleanString(tokenData)}\n\n`));
                  
                  await delay(10 + Math.random() * 10); // Simulate typing speed (10-20ms)
                }
              } catch (e) {
                console.error('Error in simulated stream:', e);
                controller.error(e);
              } finally {
                controller.close();
              }
            },
          });

          return new NextResponse(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      } catch (dbError) {
        console.warn('Error checking cache, falling back to live search:', dbError);
        // Continue to live search on error
      }
    }

    // 2. Fallback to live search
    const response = await fetch(`${API_DOMAIN}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'X-API-KEY': process.env.BACKEND_API_KEY || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend response error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body from backend');
    }

    // Forward the stream
    // Forward the stream and capture data for saving
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    let bibleResults = '[]';
    let commentaryResults = '[]';
    let searchId: number | null = null;

    const stream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        const text = decoder.decode(chunk, { stream: true });
        
        // Simple SSE parsing to capture data
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.bible_results) {
                bibleResults = JSON.stringify(data.bible_results);
              }
              if (data.commentary_results) {
                commentaryResults = JSON.stringify(data.commentary_results);
              }
              if (data.token) {
                fullResponse += data.token;
              }
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      },
      async flush(controller) {
        // Save logic moved to /api/history to avoid duplication and race conditions
        // The frontend calls /api/history with the complete response after streaming finishes
      }
    });

    if (!response.body) return new NextResponse(null, { status: 500 });
    
    return new NextResponse(response.body.pipeThrough(stream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
