'use client';

import React from 'react';
import { Settings, BookOpen, Scroll, Languages, Lightbulb, Check } from 'lucide-react';
import AboutModal from './AboutModal';
import { version } from '../../package.json';

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
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings }) => {
  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { key: 'insights', label: 'AI Insights', icon: Lightbulb },
    { key: 'oldTestament', label: 'Old Testament', icon: Scroll },
    { key: 'newTestament', label: 'New Testament', icon: BookOpen },
    { key: 'commentary', label: 'Commentary', icon: Settings },
  ];

  const [isAboutOpen, setIsAboutOpen] = React.useState(false);

  return (
    <>
      <aside className="w-72 bg-white flex flex-col h-screen sticky top-0 shadow-lg shadow-slate-200/50 z-20 transition-all duration-300 border-r border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Bible Assistant</h1>
          </div>
          <p className="text-xs text-slate-500 mt-2 px-1">Advanced Study Tool</p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-2 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Search Sources
            </h2>
          </div>
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = settings[item.key as keyof typeof settings];
              
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
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
            onClick={() => setIsAboutOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all mb-2 border border-transparent hover:border-slate-200 hover:shadow-sm"
          >
             <span className="font-medium">About Project</span>
           </button>
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>{version}</span>
            <span>Made with ❤️</span>
          </div>
        </div>
      </aside>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default Sidebar;