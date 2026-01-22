'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: 'en' | 'pl') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'pl') => {
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <>
      <div className="mb-2 px-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {t.sidebar.languageSettings}
        </h2>
      </div>

      <div className="bg-slate-50 rounded-xl p-1 flex mb-8">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            language === 'en'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Select English language"
          title={t.sidebar.english}
        >
          <Languages className="w-4 h-4" />
          <span>{t.sidebar.english}</span>
        </button>
        <button
          onClick={() => handleLanguageChange('pl')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            language === 'pl'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Wybierz język polski"
          title={t.sidebar.polish}
        >
          <Languages className="w-4 h-4" />
          <span>{t.sidebar.polish}</span>
        </button>
      </div>
    </>
  );
};

export default LanguageSelector;
