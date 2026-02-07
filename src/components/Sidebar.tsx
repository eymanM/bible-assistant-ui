'use client';

import React from 'react';
import { History, X } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { version } from '../../package.json';
import { useLanguage } from '../lib/language-context';
import SearchSources from './sidebar/SearchSources';
import UserProfile from './sidebar/UserProfile';
import { SearchSettings } from '@/lib/search-settings';

const AboutModal = dynamic(() => import('./AboutModal'), { ssr: false });
const HistoryModal = dynamic(() => import('./HistoryModal'), { ssr: false });

import { User } from '@/lib/types';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /**
   * Configuration settings for search sources.
   */
  settings: SearchSettings;
  /**
   * State setter for settings.
   */
  setSettings: React.Dispatch<React.SetStateAction<SearchSettings>>;
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
              priority
            />
            <span className="text-xl font-bold tracking-tight text-slate-800">{t.sidebar.title}</span>
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
          <SearchSources settings={settings} setSettings={setSettings} />

          {/* History Section */}
          <div className="mt-8">
            <div className="px-1 mb-3">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {t.sidebar.library}
              </h2>
            </div>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-full flex items-center gap-3 p-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group"
            >
              <History className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span>{t.sidebar.recentSearches}</span>
            </button>
          </div>

        </div>

        {/* User Section - visible on mobile mostly */}
        <UserProfile user={user} onLogout={onLogout} onClose={onClose} />

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">

          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>{version}</span>
            <span>&copy; {new Date().getFullYear()}</span>
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
