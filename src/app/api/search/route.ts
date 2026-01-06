import { NextRequest, NextResponse } from 'next/server';
import { API_DOMAIN } from '../../../config/apiConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
