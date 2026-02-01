'use client';

import React from 'react';
import { MessageSquareText, BookOpen, Scroll, Lightbulb, Check, MonitorPlay } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Settings {
  oldTestament: boolean;
  newTestament: boolean;
  commentary: boolean;
  insights: boolean;
  media: boolean;
}

interface SearchSourcesProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SearchSources: React.FC<SearchSourcesProps> = ({ settings, setSettings }) => {
  const { t } = useLanguage();

  const handleToggle = (key: keyof Settings) => {
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
          const isActive = settings[item.key as keyof Settings];

          return (
            <button
              key={item.key}
              onClick={() => handleToggle(item.key as keyof Settings)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
              aria-label={`Toggle ${item.label}`}
              aria-pressed={isActive}
              title={item.label}
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
    </>
  );
};

export default SearchSources;
