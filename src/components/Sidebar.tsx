'use client';

import React from 'react';
import { History, X } from 'lucide-react';
import Image from 'next/image';
import AboutModal from './AboutModal';
import HistoryModal from './HistoryModal';
import { version } from '../../package.json';
import { useLanguage } from '../lib/language-context';
import LanguageSelector from './sidebar/LanguageSelector';
import SearchSources from './sidebar/SearchSources';
import UserProfile from './sidebar/UserProfile';

import { User } from '@/lib/types';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /**
   * Configuration settings for search sources.
   */
  settings: {
    oldTestament: boolean;
    newTestament: boolean;
    commentary: boolean;
    insights: boolean;
  };
  /**
   * State setter for settings.
   */
  setSettings: React.Dispatch<React.SetStateAction<{
    oldTestament: boolean;
    newTestament: boolean;
    commentary: boolean;
    insights: boolean;
  }>>;
  query: string;
  onSearch: (query: string) => void;
  onHistoryClick: (item: { query: string; response?: string; bible_results?: string[]; commentary_results?: string[] }) => void;
  refreshTrigger?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onLanguageChange?: () => void;
  /**
   * Current user object, if logged in.
   */
  user?: User;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onHistoryClick, refreshTrigger, isOpen = false, onClose, onLanguageChange, user, onLogout }) => {
  const { t } = useLanguage();
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col h-screen shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-100
        md:translate-x-0 md:sticky md:top-0 md:shadow-lg md:z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/icons/icon-192.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="rounded-lg" 
            />
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.sidebar.title}</h1>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <LanguageSelector onLanguageChange={onLanguageChange} />

          <SearchSources settings={settings} setSettings={setSettings} />

          {/* History Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all mt-4 border border-slate-200 hover:border-indigo-200 hover:shadow-sm"
          >
            <History className="w-4 h-4" />
            <span className="font-medium">{t.sidebar.recentSearches}</span>
          </button>

        </div>

        {/* User Section - visible on mobile mostly */}
        <UserProfile user={user} onLogout={onLogout} onClose={onClose} />

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
            onClick={() => setIsAboutOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all mb-2 border border-transparent hover:border-slate-200 hover:shadow-sm"
          >
             <span className="font-medium">{t.sidebar.aboutProject}</span>
           </button>
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>{version}</span>
          </div>
        </div>
      </aside>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onHistoryClick={onHistoryClick}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
};

export default Sidebar;