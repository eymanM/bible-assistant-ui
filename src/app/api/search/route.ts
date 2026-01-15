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
        // Filter out results where thumbs_down > thumbs_up (more negative than positive)
        const result = await pool.query(
          `SELECT * FROM bible_assistant.search_history 
           WHERE query = $1 
           AND language = $2 
           AND settings @> $3::jsonb
           AND (COALESCE(thumbs_down, 0) <= COALESCE(thumbs_up, 0))
           ORDER BY created_at DESC 
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
                  history_id: match.id // Send ID so frontend can vote on cached result
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
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) return;
        const reader = response.body.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e) {
          console.error('Streaming error:', e);
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
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
