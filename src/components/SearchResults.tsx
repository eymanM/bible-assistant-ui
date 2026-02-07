import React, { useCallback, useMemo } from 'react';
import { Book, MessageCircle, Sparkles, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import AIInsights from './AIInsights';
import RelatedMedia from './RelatedMedia';
import { useLanguage } from '../lib/language-context';
import { SearchSettings } from '../lib/search-settings';

interface SearchResultsProps {
  query: string;
  bibleResults: string[];
  commentaryResults: string[];
  llmResponse: string;
  onVote?: (vote: 'up' | 'down') => void;
  voteStatus?: 'up' | 'down' | null;
  settings?: Pick<SearchSettings, 'media'>;
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
  const handleVote = useCallback((type: 'up' | 'down') => {
    if (!onVote) return;
    onVote(type);
  }, [onVote]);

  const feedbackLabel = useMemo(() => t.main.feedback || 'Was this helpful?', [t]);

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
        <AISection
          llmResponse={llmResponse}
          onVote={onVote}
          voteStatus={voteStatus}
          onVoteClick={handleVote}
          feedbackLabel={feedbackLabel}
        />

        <BibleResultsSection
          results={bibleResults}
          label={t.main.bibleResults || 'Możliwe wersety odpowiedzi'}
        />

        <CommentarySection
          results={commentaryResults}
          label={t.main.commentary}
        />
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

const AISection = React.memo(function AISection({
  llmResponse,
  onVote,
  voteStatus,
  onVoteClick,
  feedbackLabel
}: {
  llmResponse: string;
  onVote?: (vote: 'up' | 'down') => void;
  voteStatus?: 'up' | 'down' | null;
  onVoteClick: (vote: 'up' | 'down') => void;
  feedbackLabel: string;
}) {
  if (!llmResponse) return null;

  return (
    <section>
      <AIInsights content={llmResponse} />
      {onVote && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-slate-400 mr-2">{feedbackLabel}</span>
          <button 
            onClick={() => onVoteClick('up')}
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
            onClick={() => onVoteClick('down')}
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
  );
});

const BibleResultsSection = React.memo(function BibleResultsSection({
  results,
  label
}: {
  results: string[];
  label: string;
}) {
  if (!results.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Book className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{label}</h3>
      </div>
      <div className="grid gap-4">
        {results.map((result, index) => {
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
  );
});

const CommentarySection = React.memo(function CommentarySection({
  results,
  label
}: {
  results: string[];
  label: string;
}) {
  if (!results.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <MessageCircle className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{label}</h3>
      </div>
      <div className="grid gap-4">
        {results.map((result, index) => {
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
  );
});
