import { Search, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/language-context';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  showCreditsWarning?: boolean;
  currentQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled, isLoading, showCreditsWarning = true, currentQuery }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(currentQuery || '');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const limit = 150;
  const helperId = 'search-helper';


  useEffect(() => {
    if (disabled) {
      setQuery('');
    }
  }, [disabled]);

  useEffect(() => {
    if (currentQuery !== undefined) {
      setQuery(currentQuery);
    }
  }, [currentQuery]);

  const handleSearch = () => {
    if (!disabled && query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLoading) handleSearch();
      }}
      className="w-full max-w-3xl mx-auto transform transition-all hover:scale-[1.01]"
    >
      <div className="relative flex items-center group">
        <input
          aria-label={t.main.searchPlaceholder}
          aria-describedby={helperId}
          type="search"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setShowLimitWarning(val.length >= limit);
          }}
          disabled={disabled || isLoading}
          maxLength={limit}
          placeholder={disabled ? t.main.loginRequired : t.main.searchPlaceholder}
          className={`w-full py-5 pl-14 pr-36 text-lg bg-white border-2 rounded-2xl transition-all duration-300 outline-none
            ${disabled || isLoading
              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed placeholder-gray-400' 
              : 'border-slate-100 shadow-lg shadow-indigo-500/5 text-slate-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 hover:border-indigo-500/30'
            }`}
        />
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${
           disabled || isLoading ? 'text-gray-300' : 'text-indigo-500 group-hover:text-indigo-600'
        }`} />

        {query && !disabled && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setShowLimitWarning(false);
            }}
            className="absolute right-28 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <button 
          type="submit"
          disabled={disabled || isLoading || !query.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            disabled || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : !query.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transform active:scale-[0.96]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{t.main.searchButton}</span>
            </div>
          ) : (
            t.main.searchButton
          )}
        </button>
      </div>
      
      {!disabled && showCreditsWarning && (
        <p id={helperId} className="text-xs text-slate-500 text-center mt-3" aria-live="polite">
          {showLimitWarning ? (
            <span className="text-red-500 font-medium animate-pulse">
              {t.main.inputLimitReached}
            </span>
          ) : (
            t.main.creditsOnlyFor
          )}
          <span className="ml-2 text-slate-400">{query.length}/{limit}</span>
        </p>
      )}
    </form>
  );
};

export default SearchBar;
