'use client';

import React, { useMemo } from 'react';
import { MessageSquareText, BookOpen, Scroll, Lightbulb, Check, MonitorPlay, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
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

  const MENU_ITEMS_CONFIG: Record<string, { label: string; icon: React.ElementType }> = useMemo(() => ({
    'insights': { label: t.sidebar.aiInsights, icon: Lightbulb },
    'oldTestament': { label: t.sidebar.oldTestament, icon: Scroll },
    'newTestament': { label: t.sidebar.newTestament, icon: BookOpen },
    'commentary': { label: t.sidebar.commentary, icon: MessageSquareText },
    'media': { label: t.sidebar.media, icon: MonitorPlay },
  }), [t]);

  // Fallback to default if somehow missing
  const currentOrder = settings.sourceOrder && settings.sourceOrder.length > 0 
    ? settings.sourceOrder 
    : ['insights', 'oldTestament', 'newTestament', 'commentary', 'media'];

  const handleReorder = (newOrder: string[]) => {
    setSettings((prev) => ({ ...prev, sourceOrder: newOrder }));
  };

  return (
    <>
      <div className="px-1 mb-3">
        <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          {t.sidebar.searchSources}
        </h2>
      </div>
      
      <Reorder.Group axis="y" values={currentOrder} onReorder={handleReorder} className="space-y-2 mb-8">
        {currentOrder.map((key) => {
          const item = MENU_ITEMS_CONFIG[key];
          if (!item) return null; // Defensive check
          
          const Icon = item.icon;
          const isActive = settings[key as keyof SearchSettings] as boolean;
          const isPremium = key === 'insights';
          const isDisabled = key === 'media';

          return (
            <Reorder.Item
              key={key}
              value={key}
              className="relative rounded-xl"
            >
              <div
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isDisabled
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-transparent'
                    : isActive 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent bg-white'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1 -ml-2 select-none flex-shrink-0" title="Przeciągnij by zmienić kolejność">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <Icon className={`flex-shrink-0 w-5 h-5 ${isDisabled ? 'text-slate-300' : isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0 leading-tight">
                      <span className={`font-medium text-sm truncate max-w-full ${isDisabled ? 'text-slate-400' : ''}`}>{item.label}</span>
                      {isPremium && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-1.5 py-0.5 rounded shadow-sm flex-shrink-0">
                          PREMIUM
                        </span>
                      )}
                      {isDisabled && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded shadow-sm flex-shrink-0">
                          WKRÓTCE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => !isDisabled && handleToggle(key as keyof SearchSettings)}
                  disabled={isDisabled}
                  className={`w-5 h-5 ml-2 flex-shrink-0 rounded-md border flex items-center justify-center transition-all focus:outline-none ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-100'
                    : isActive 
                      ? 'bg-indigo-600 border-indigo-600 shadow-sm' 
                      : 'border-slate-200 bg-white group-hover:border-slate-300'
                }`}>
                  {isActive && !isDisabled && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </>
  );
};

export default SearchSources;
