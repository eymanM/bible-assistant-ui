import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/language-context';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  showCreditsWarning?: boolean;
  currentQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled, showCreditsWarning = true, currentQuery }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(currentQuery || '');
  const [showLimitWarning, setShowLimitWarning] = useState(false);


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
    <div className="w-full max-w-3xl mx-auto transform transition-all hover:scale-[1.01]">
      <div className="relative flex items-center group">
        <input
          aria-label={t.main.searchPlaceholder}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setShowLimitWarning(val.length >= 150);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={disabled}
          maxLength={150}
          placeholder={disabled ? t.main.loginRequired : t.main.searchPlaceholder}
          className={`w-full py-5 pl-14 pr-32 text-lg bg-white border-2 rounded-2xl transition-all duration-300 outline-none
            ${disabled 
              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed placeholder-gray-400' 
              : 'border-slate-100 shadow-lg shadow-indigo-500/5 text-slate-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10'
            }`}
        />
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${
           disabled ? 'text-gray-300' : 'text-indigo-500 group-hover:text-indigo-600'
        }`} />
        
        <button 
          onClick={handleSearch}
          disabled={disabled || !query.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : !query.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transform active:scale-95'
          }`}
        >
          {t.main.searchButton}
        </button>
      </div>
      
      {!disabled && showCreditsWarning && (
        <p className="text-xs text-slate-500 text-center mt-3">
          {showLimitWarning ? (
              <span className="text-red-500 font-medium animate-pulse">
                {t.main.inputLimitReached}
              </span>
          ) : (
             t.main.creditsOnlyFor
          )}
        </p>
      )}
    </div>
  );
};

export default SearchBar;