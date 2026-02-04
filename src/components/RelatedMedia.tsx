import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { searchMedia, MediaItem } from '@/lib/media-service';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';

interface RelatedMediaProps {
  query: string;
}

export default function RelatedMedia({ query }: RelatedMediaProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    
    const fetchMedia = async () => {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      try {
        const results = await searchMedia(query, language);
        if (isMounted) {
            setMedia(results);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch media');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
    };
  }, [query, language]);

  const articles = media.filter(item => item.type === 'article');

  if (!query) return null;
  if (!loading && articles.length === 0 && !error) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight pb-3">
            {t.sidebar.media}
        </h3>
        {loading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mb-3" />}
      </div>

      
      {error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-start gap-3 mt-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            {error.includes('Daily media search limit exceeded') 
              ? t.apiErrors.mediaLimitExceeded 
              : error}
          </p>
        </div>
      ) : articles.length === 0 && !loading ? (
           <div className="text-center py-8 text-slate-500 text-sm">
               {t.sidebar.noArticles}
           </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all hover:border-indigo-100"
              >
               {item.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <Image 
                        src={item.imageUrl} 
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700 flex items-center gap-1 z-10">
                        <FileText size={12}/>
                        {item.source}
                    </div>
                </div>
               )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
      )}
    </div>
  );
}
