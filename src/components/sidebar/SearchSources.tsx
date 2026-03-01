'use client';

import React from 'react';
import { MessageSquareText, BookOpen, Scroll, Lightbulb, Check, MonitorPlay } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { SearchSettings } from '@/lib/search-settings';

interface SearchSourcesProps {
  settings: SearchSettings;
  setSettings: React.Dispatch<React.SetStateAction<SearchSettings>>;
}

const SearchSources: React.FC<SearchSourcesProps> = ({ settings, setSettings }) => {
  const { t } = useLanguage();

  const handleToggle = (key: keyof SearchSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { key: 'insights', label: t.sidebar.aiInsights, icon: Lightbulb },
    { key: 'oldTestament', label: t.sidebar.oldTestament, icon: Scroll },
    { key: 'newTestament', label: t.sidebar.newTestament, icon: BookOpen },
    { key: 'commentary', label: t.sidebar.commentary, icon: MessageSquareText },
    { key: 'media', label: t.sidebar.media, icon: MonitorPlay },
  ];

  return (
    <>
      <div className="px-1 mb-3">
        <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          {t.sidebar.searchSources}
        </h2>
      </div>
      
      <div className="space-y-2 mb-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = settings[item.key as keyof SearchSettings];
          const isPremium = item.key === 'insights';
          const isDisabled = item.key === 'media';

          return (
            <button
              key={item.key}
              onClick={() => {
                if (!isDisabled) {
                  handleToggle(item.key as keyof SearchSettings);
                }
              }}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                isDisabled
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-transparent'
                  : isActive 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
              aria-label={`Toggle ${item.label}`}
              aria-pressed={isActive}
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isDisabled ? 'text-slate-300' : isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${isDisabled ? 'text-slate-400' : ''}`}>{item.label}</span>
                  {isPremium && (
                    <span className="text-[10px] font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                      PREMIUM
                    </span>
                  )}
                  {isDisabled && (
                    <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                      WKRÓTCE
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`w-5 h-5 ml-2 flex-shrink-0 rounded-md border flex items-center justify-center transition-all ${
                isDisabled
                  ? 'border-slate-200 bg-slate-100'
                  : isActive 
                    ? 'bg-indigo-600 border-indigo-600 shadow-sm' 
                    : 'border-slate-200 bg-white group-hover:border-slate-300'
              }`}>
                {isActive && !isDisabled && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default SearchSources;
