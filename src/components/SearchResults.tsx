import React from 'react';
import { Book, MessageCircle, Sparkles, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import AIInsights from './AIInsights';
import RelatedMedia from './RelatedMedia';
import { useLanguage } from '../lib/language-context';

interface SearchResultsProps {
  query: string;
  bibleResults: string[];
  commentaryResults: string[];
  llmResponse: string;
  onVote?: (vote: 'up' | 'down') => void;
  voteStatus?: 'up' | 'down' | null;
  settings?: {
    media: boolean;
  };
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  query, 
  bibleResults = [], 
  commentaryResults = [], 
  llmResponse,
  onVote,
  voteStatus = null,
  settings
}) => {
  const { t } = useLanguage();

  const handleVote = (type: 'up' | 'down') => {
    if (!onVote) return;
    onVote(type);
  };

  if (!query && !llmResponse && bibleResults.length === 0) {
    return (
      <div className="text-center py-12 opacity-50">
        <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">{t.main.readyToSearch}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        {llmResponse && (
          <section>
            <AIInsights content={llmResponse} />
            
            {onVote && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <span className="text-xs text-slate-400 mr-2">{t.main.feedback || 'Was this helpful?'}</span>
                <button 
                  onClick={() => handleVote('up')}
                  className={`p-1.5 rounded-full transition-all ${
                    voteStatus === 'up' 
                      ? 'bg-green-100 text-green-600' 
                      : voteStatus 
                        ? 'text-slate-300' 
                        : 'text-slate-400 hover:bg-slate-100 hover:text-green-600'
                  }`}
                  aria-label="Thumbs up"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleVote('down')}
                  className={`p-1.5 rounded-full transition-all ${
                    voteStatus === 'down' 
                      ? 'bg-red-100 text-red-600' 
                      : voteStatus 
                        ? 'text-slate-300' 
                        : 'text-slate-400 hover:bg-slate-100 hover:text-red-600'
                  }`}
                  aria-label="Thumbs down"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {bibleResults.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Book className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{t.main.bibleResults || 'Możliwe wersety odpowiedzi'}</h3>
            </div>
            <div className="grid gap-4">
              {bibleResults.map((result, index) => {
                const [source, content] = result.split("\nContent: ");
                return (
                  <SearchResultItem
                    key={index}
                    source={source}
                    content={content}
                    borderColor="border-indigo-500"
                    textColor="text-indigo-600"
                  />
                );
              })}
            </div>
          </section>
        )}
        
        {commentaryResults.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageCircle className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{t.main.commentary}</h3>
            </div>
            <div className="grid gap-4">
              {commentaryResults.map((result, index) => {
                const [source, content] = result.split("\nContent: ");
                return (
                  <SearchResultItem
                    key={index}
                    source={source}
                    content={content}
                    borderColor="border-amber-500"
                    textColor="text-amber-600"
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Related Media Section - Only if enabled in settings */}
      {settings?.media && (
         <div className="pt-8 border-t border-slate-100">
             <RelatedMedia query={query} />
         </div>
      )}
    </div>
  );
};

export default SearchResults;