'use client';

import React from 'react';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import SearchResults from './SearchResults';
import { useBibleSearch } from '../hooks/useBibleSearch';
import { useLanguage } from '../lib/language-context';

import { useAuth } from '../lib/auth-context';
import Link from 'next/link';

const BibleApp: React.FC = () => {
  const { query, setQuery, settings, setSettings, results, loading, error, search, loadFromHistory, historyRefreshTrigger } = useBibleSearch();
  const { user, logout } = useAuth();
  const { t, setLanguage } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleHistoryClick = (item: any) => {
    loadFromHistory(item, setLanguage);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        query={query} 
        onSearch={search}
        onHistoryClick={handleHistoryClick}
        refreshTrigger={historyRefreshTrigger}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLanguageChange={() => setQuery('')}
      />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto min-w-0">
        <header className="sticky top-0 z-30 glass px-4 md:px-8 py-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100/80 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{t.main.discover}</h1>
               <p className="text-xs md:text-sm text-slate-500 hidden sm:block">{t.main.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4 items-center">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3 mr-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-slate-600">{user.signInDetails?.loginId}</span>
                </div>
                
                <Link 
                  href="/credits" 
                  className="px-3 md:px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  {t.main.buyCredits}
                </Link>
                
                <Link 
                  href="/account"
                  className="hidden md:block px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  {t.main.account}
                </Link>
                
                <button
                  onClick={logout}
                  className="hidden md:block px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {t.main.logout}
                </button>
                
                {/* Mobile User Menu (Simplified) */}
                <div className="md:hidden flex items-center">
                   <Link href="/account" className="p-2 text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   </Link>
                </div>
              </>
            ) : (
              <Link 
                href="/login"
                className="px-4 md:px-6 py-2 md:py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
              >
                {t.main.loginSignUp}
              </Link>
            )}
          </div>
        </header>
        
        <div className="px-4 md:px-8 pb-12">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="text-center py-6 md:py-10">
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{t.main.whatWouldYouLikeToExplore}</h2>
               <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 px-2">
                 {t.main.searchDescription}
               </p>

               {!loading && !results.bible.length && !results.commentary.length && !results.llmResponse && (
                 <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {t.main.exampleQueries.map((suggestion) => (
                     <button
                       key={suggestion}
                       onClick={() => search(suggestion)}
                       disabled={!user}
                       className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-white border border-slate-200 text-slate-600 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {suggestion}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <SearchBar onSearch={search} disabled={!user} showCreditsWarning={settings.insights} currentQuery={query} />
            
            {loading && (
              <div className="flex justify-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}
            
            <SearchResults 
              query={query} 
              bibleResults={results.bible} 
              commentaryResults={results.commentary} 
              llmResponse={results.llmResponse} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BibleApp;
