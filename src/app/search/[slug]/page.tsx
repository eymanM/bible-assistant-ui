import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import SearchResults from '@/components/SearchResults';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour

interface Props {
  params: { slug: string };
}

async function getSearchData(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const queryText = decodedSlug.replace(/-/g, ' ');

  const result = await pool.query(
    `SELECT query, response, bible_results, commentary_results 
     FROM bible_assistant.searches 
     WHERE query ILIKE $1 AND response IS NOT NULL
     ORDER BY created_at DESC 
     LIMIT 1`,
    [queryText]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  
  // Safely parse JSON fields
  let bibleResults = [];
  try { bibleResults = typeof row.bible_results === 'string' ? JSON.parse(row.bible_results) : row.bible_results; } catch (e) {}
  
  let commentaryResults = [];
  try { commentaryResults = typeof row.commentary_results === 'string' ? JSON.parse(row.commentary_results) : row.commentary_results; } catch (e) {}

  return {
    query: row.query,
    llmResponse: row.response,
    bibleResults: bibleResults || [],
    commentaryResults: commentaryResults || []
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getSearchData(params.slug);
  
  if (!data) {
    return {
      title: 'Search Not Found | Bible Assistant'
    };
  }

  // Use the first 150 characters of the LLM response for the meta description
  const description = data.llmResponse 
    ? data.llmResponse.substring(0, 150) + '...'
    : `Explore what the Bible says about ${data.query}`;

  return {
    title: `${data.query} - Bible Study Insights | Bible Assistant`,
    description
  };
}

export default async function PublicSearchPage({ params }: Props) {
  const data = await getSearchData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full glass px-4 md:px-8 py-4 mb-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <span className="text-sm text-slate-500 hidden sm:block">Public Research Archive</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl px-4 md:px-8 pb-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight capitalize">
            {data.query}
          </h1>
          <p className="text-slate-500 text-lg">
            AI-generated biblical insights and related scriptures.
          </p>
        </div>

        <SearchResults 
          query={data.query}
          bibleResults={data.bibleResults}
          commentaryResults={data.commentaryResults}
          llmResponse={data.llmResponse}
          // Intentionally omitting 'onVote' to make this read-only for public SEO visitors
        />
        
        <div className="mt-16 text-center">
           <Link 
             href="/"
             className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
           >
             Ask your own question
           </Link>
        </div>
      </main>
    </div>
  );
}
