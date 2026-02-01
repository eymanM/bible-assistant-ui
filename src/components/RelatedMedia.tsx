import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { searchMedia, MediaItem } from '@/lib/media-service';
import { useLanguage } from '@/lib/language-context';

interface RelatedMediaProps {
  query: string;
}

export default function RelatedMedia({ query }: RelatedMediaProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    
    const fetchMedia = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const results = await searchMedia(query, language);
        if (isMounted) {
            setMedia(results);
        }
      } catch (error) {
        console.error("Failed to fetch media", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
    };
  }, [query]);

  // Filter only for articles as requested
  const articles = media.filter(item => item.type === 'article');

  if (!query || (!loading && articles.length === 0)) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight pb-3">
            {t.sidebar.media}
        </h3>
        {loading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mb-3" />}
      </div>
      
      {articles.length === 0 && !loading ? (
           <div className="text-center py-8 text-slate-500 text-sm">
               Brak artykułów w tej kategorii.
           </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all hover:border-indigo-100"
              >
               {item.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                    <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700 flex items-center gap-1">
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
