import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { LIMITS } from '../../../config/limits';
import { checkRateLimit } from '../../../lib/rate-limit';

// Custom sites configuration extracted from user request
const POLISH_SITES = [
    'apologetyka.info', 
    'gosc.pl', 
    'deon.pl', 
    'mateusz.pl', 
    'aleteia.org',
    'bibliowersytet.pl', 
    'preceptpolska.org', 
    'bibliaapologety.com', 
    'bibliepolskie.pl', 
    'ewangelia.pl', 
    'katolik.pl', 
    'opoka.org.pl', 
    'studiateologiczne.pl', 
    'biblia.wiara.pl', 
    'biblia.pl'
];

const ENGLISH_SITES = [
    'christianitytoday.com', 
    'catholic.com', 
    'bible.org', 
    'studylight.org', 
    'biblehub.com', 
    'aleteia.org', 
    'desiringgod.org', 
    'thegospelcoalition.org', 
    'openbible.info', 
    'gotquestions.org', 
    'blueletterbible.org', 
    'biblegateway.com'
];

export interface MediaItem {
  id: string;
  title: string;
  source: string;
  type: 'article' | 'book' | 'video';
  imageUrl?: string;
  url: string;
}

interface SerperImageItem {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  source: string;
  domain: string;
  link: string;
  googleUrl: string;
  position: number;
}

async function getCachedMedia(query: string, lang: string): Promise<{ items: MediaItem[] | null, diagnostics: any }> {
  console.log(`Checking media_cache for query: "${query}", lang: "${lang}"`);
  const diagnostics: any = {};
  try {
    // Check specific existence with expiration
    const result = await pool.query(
      `SELECT data FROM media_cache 
       WHERE query = $1 AND lang = $2 
       AND created_at > NOW() - INTERVAL '${LIMITS.MEDIA_CACHE_EXPIRATION_DAYS} days'`,
      [query, lang]
    );
    diagnostics.resultCount = result.rows.length;
    
    if (result.rows.length > 0) {
      return { items: result.rows[0].data as MediaItem[], diagnostics };
    }
    return { items: null, diagnostics };
  } catch (error: any) {
    console.warn('Failed to fetch from media_cache:', error);
    return { items: null, diagnostics: { ...diagnostics, fatalError: error.message } };
  }
}

async function saveCachedMedia(query: string, lang: string, data: MediaItem[]) {
  console.log(`Attempting to save to media_cache. Query: "${query}", Lang: "${lang}", Items: ${data.length}`);
  if (!process.env.DATABASE_URL) {
      console.error('CRITICAL: DATABASE_URL is not defined in API route!');
  }
  try {
    const res = await pool.query(
      `INSERT INTO media_cache (query, lang, data)
       VALUES ($1, $2, $3)
       ON CONFLICT (query, lang) DO UPDATE SET data = $3, created_at = NOW() RETURNING id`,
      [query, lang, JSON.stringify(data)]
    );
    console.log('Successfully saved to media_cache. Inserted/Updated ID:', res.rows[0]?.id);
  } catch (error: any) {
    console.error('Failed to save to media_cache:', error);
    console.error('DB Error Detail:', error.message, error.code, error.detail);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lang = searchParams.get('lang') || 'en';
  const userId = searchParams.get('userId');

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  // Rate Limiting Check
  if (userId) {
    const allowed = await checkRateLimit(userId, 'media');
    if (!allowed) {
        return NextResponse.json({ error: 'Daily media search limit exceeded' }, { status: 429 });
    }
  }

  let debugDiagnostics: any = null;

  try {
    // Check Cache
    const { items: cached, diagnostics } = await getCachedMedia(query, lang);
    debugDiagnostics = diagnostics;
    if (cached) {
      return NextResponse.json({ images: cached, cached: true, debugDiagnostics });
    }
  } catch (e) {
    console.error('Cache check failed, proceeding to fetch', e);
  }

  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.error('Serper API key is missing in backend.');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  try {
    // Select sites based on language
    const sitesToSearch = lang === 'pl' ? POLISH_SITES : ENGLISH_SITES;
    
    let finalQuery = query;

    // Construct the query with site filtering
    if (sitesToSearch.length > 0) {
        const siteFilter = sitesToSearch.map(site => `site:${site}`).join(' OR ');
        // Specific subdomain exclusions + generic URL keyword exclusions
        const excludeFilter = '-site:sklep.gosc.pl -inurl:sklep -inurl:shop -inurl:store -inurl:ksiegarnia';
        finalQuery = `${query} (${siteFilter}) ${excludeFilter}`;
    }

    const gl = lang === 'pl' ? 'pl' : 'us';
    const hl = lang === 'pl' ? 'pl' : 'en';

    console.log('DEBUG: finalQuery sent to Serper:', finalQuery);

    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: finalQuery,
        num: 3,
        gl: gl, // Country
        hl: hl  // Language
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('Serper API Error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    let mediaItems: MediaItem[] = [];
    if (data.images) {
         mediaItems = data.images.map((item: SerperImageItem, index: number) => ({
            id: `serper-${index}`,
            title: item.title,
            source: item.source || item.domain || 'Unknown Source',
            type: 'article',
            imageUrl: item.imageUrl,
            url: item.link
        }));
    }

    // Save to Cache
    if (mediaItems.length > 0) {
        // Await to ensure completion
        await saveCachedMedia(query, lang, mediaItems);
    }


    return NextResponse.json({ 
        images: mediaItems, 
        cached: false, 
        debugQuery: finalQuery, 
        debugParams: { query, lang },
        debugDiagnostics
    });
  } catch (error) {
    console.error('Failed to fetch from Serper API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
