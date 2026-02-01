'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';
import { useAuth } from './auth-context';

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

  // Load language from localStorage on mount, or detect browser
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pl')) {
      setLanguageState(savedLanguage);
    } else {
        // Detect browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('pl')) {
            setLanguageState('pl');
        }
        // else default is 'en'
    }
    setMounted(true);
  }, []);

  // Sync with user settings
  useEffect(() => {
    if (dbUser && dbUser.settings) {
        if (dbUser.settings.language && (dbUser.settings.language === 'en' || dbUser.settings.language === 'pl')) {
             // If remote has language, prioritize it
             if (dbUser.settings.language !== language) {
                 setLanguageState(dbUser.settings.language);
                 localStorage.setItem('language', dbUser.settings.language);
             }
        } else {
            // If remote has NO language, save current local language to remote
             fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: dbUser.cognito_sub,
                  settings: { language }
                })
             }).catch(console.error);
        }
    }
  }, [dbUser]);

  // Save language to localStorage when it changes
  // Save language to localStorage when it changes, and sync with DB if logged in
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (dbUser && dbUser.cognito_sub) {
        fetch('/api/user/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: dbUser.cognito_sub,
              settings: { language: lang }
            })
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
