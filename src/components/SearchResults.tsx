import React from 'react';
import { Book, MessageCircle, Sparkles, BookOpen } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import { useLanguage } from '../lib/language-context';

interface SearchResultsProps {
  query: string;
  bibleResults: string[];
  commentaryResults: string[];
  llmResponse: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  query, 
  bibleResults = [], 
  commentaryResults = [], 
  llmResponse
}) => {
  const { t } = useLanguage();

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
      {llmResponse && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-indigo-50/50 border-b border-indigo-100 p-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-900">{t.main.aiInsight}</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{llmResponse}</p>
          </div>
        </section>
      )}

      {bibleResults.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Book className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800">{t.main.scriptureMatches}</h3>
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
            <h3 className="text-lg font-semibold text-slate-800">{t.main.commentary}</h3>
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
  );
};

export default SearchResults;