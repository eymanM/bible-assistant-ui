'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';
import { useAuth } from './auth-context';
import { getAuthHeaders } from './auth-helpers';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const { dbUser, user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language;
    if (stored && (stored === 'en' || stored === 'pl')) {
        setLanguageState(stored);
      } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('pl')) {
          setLanguageState('pl');
        }
      }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dbUser && dbUser.settings) {
        if (dbUser.settings.language && (dbUser.settings.language === 'en' || dbUser.settings.language === 'pl')) {
             if (dbUser.settings.language !== language) {
                 setLanguageState(dbUser.settings.language);
                 localStorage.setItem('language', dbUser.settings.language);
             }
        } else {
             // Save current language to DB if not set
             getAuthHeaders().then(headers => {
               fetch('/api/user/settings', {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({
                   settings: { language }
                 })
               }).catch(console.error);
             }).catch(console.error);
        }
    }
  }, [dbUser]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (dbUser && dbUser.cognito_sub) {
        getAuthHeaders().then(headers => {
          fetch('/api/user/settings', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                settings: { language: lang }
              })
          }).catch(console.error);
        }).catch(console.error);
    }
  };

  const t = translations[language];

  // Prevent hydration mismatch by returning null until mounted
  // or a placeholder with the default language
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'en', setLanguage, t: translations.en }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
