'use client';

import React from 'react';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import SearchResults from './SearchResults';
import { useBibleSearch } from '../hooks/useBibleSearch';

import { useAuth } from '../lib/auth-context';
import Link from 'next/link';

const BibleApp: React.FC = () => {
  const { query, settings, setSettings, results, loading, error, search } = useBibleSearch();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar settings={settings} setSettings={setSettings} query={query} />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        <header className="sticky top-0 z-10 glass px-8 py-4 mb-8 flex items-center justify-between">
          <div className="flex flex-col">
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover</h1>
             <p className="text-sm text-slate-500">Explore scripture with AI-powered insights</p>
          </div>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <div className="flex items-center gap-3 mr-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-slate-600">{user.signInDetails?.loginId}</span>
                </div>
                
                <Link 
                  href="/credits" 
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Buy Credits
                </Link>
                
                <Link 
                  href="/account"
                  className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Account
                </Link>
                
                <button
                  onClick={logout}
                  className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </header>
        
        <div className="px-8 pb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center py-10">
               <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">What would you like to explore?</h2>
               <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
                 Search across multiple translations, commentaries, and get AI-driven insights instantly.
               </p>

               {!loading && !results.bible.length && !results.commentary.length && !results.llmResponse && (
                 <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {[
                     "Sermon on the Mount",
                     "Psalms for Anxiety", 
                     "History of David",
                     "Fruit of the Spirit",
                     "Paul's Missionary Journeys"
                   ].map((suggestion) => (
                     <button
                       key={suggestion}
                       onClick={() => search(suggestion)}
                       disabled={!user}
                       className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {suggestion}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <SearchBar onSearch={search} disabled={!user} />
            
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
