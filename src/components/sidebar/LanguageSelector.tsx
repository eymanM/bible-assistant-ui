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

      <h2 className="text-xl font-bold mb-4">{t.sidebar.languageSettings}</h2>

      <div className="flex gap-4">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-base font-medium transition-all border ${
            language === 'en'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500 ring-offset-2'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
          aria-label="Select English language"
          title={t.sidebar.english}
        >
          <Languages className="w-5 h-5" />
          <span>{t.sidebar.english}</span>
        </button>
        <button
          onClick={() => handleLanguageChange('pl')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-base font-medium transition-all border ${
            language === 'pl'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500 ring-offset-2'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
