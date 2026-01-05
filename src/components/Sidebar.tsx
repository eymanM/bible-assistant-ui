'use client';

import React from 'react';
import { MessageSquareText, BookOpen, Scroll, Languages, Lightbulb, Check, History, X } from 'lucide-react';
import AboutModal from './AboutModal';
import HistoryModal from './HistoryModal';
import { version } from '../../package.json';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';

interface SidebarProps {
  settings: {
    oldTestament: boolean;
    newTestament: boolean;
    commentary: boolean;
    insights: boolean;
  };
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
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onSearch, onHistoryClick, refreshTrigger, isOpen = false, onClose, onLanguageChange }) => {
  const { t, language, setLanguage } = useLanguage();

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (lang: 'en' | 'pl') => {
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  const menuItems = [
    { key: 'insights', label: t.sidebar.aiInsights, icon: Lightbulb },
    { key: 'oldTestament', label: t.sidebar.oldTestament, icon: Scroll },
    { key: 'newTestament', label: t.sidebar.newTestament, icon: BookOpen },
    { key: 'commentary', label: t.sidebar.commentary, icon: MessageSquareText },
  ];

  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  // Close sidebar on mobile when history or about is clicked, or update this logic if needed.
  // Actually usually we might want to keep it open or close it. I'll leave it for now.

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col h-screen shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-100
        md:translate-x-0 md:sticky md:top-0 md:shadow-lg md:z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.sidebar.title}</h1>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
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
            >
              <Languages className="w-4 h-4" />
              <span>{t.sidebar.polish}</span>
            </button>
          </div>

          <div className="mb-2 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {t.sidebar.searchSources}
            </h2>
          </div>
          
          <div className="space-y-2 mb-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = settings[item.key as keyof typeof settings];
              
              // Skip rendering language in this list if it was somehow included
              if (item.key === 'language') return null;

              return (
                <button
                  key={item.key}
                  onClick={() => handleToggle(item.key as keyof typeof settings)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 shadow-sm' 
                      : 'border-slate-200 bg-white group-hover:border-slate-300'
                  }`}>
                    {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* History Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all mt-4 border border-slate-200 hover:border-indigo-200 hover:shadow-sm"
          >
            <History className="w-4 h-4" />
            <span className="font-medium">{t.sidebar.recentSearches}</span>
          </button>

        </div>

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