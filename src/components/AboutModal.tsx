'use client';

import React from 'react';
import { X, Code2, Server, Database, Shield, CreditCard, Languages } from 'lucide-react';
import { version } from '../../package.json';
import { useLanguage } from '../lib/language-context';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {t.about.title}
            <span className="text-xs font-normal bg-indigo-500/50 px-2 py-0.5 rounded-full border border-indigo-400/30">v{version}</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-indigo-100 hover:text-white hover:bg-indigo-500/50 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <p className="text-slate-600 mb-8 leading-relaxed">
            {t.about.missionText}
          </p>

          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t.about.subtitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">{t.about.stats.years}</div>
              <p className="text-xs text-slate-500">{t.about.stats.yearsDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
               <div className="text-2xl font-bold text-indigo-600 mb-1">{t.about.stats.qa}</div>
               <p className="text-xs text-slate-500">{t.about.stats.qaDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
               <div className="text-2xl font-bold text-indigo-600 mb-1">{t.about.stats.accuracy}</div>
               <p className="text-xs text-slate-500">{t.about.stats.accuracyDesc}</p>
            </div>
          </div>          
           
           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                {t.footer.rights}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
