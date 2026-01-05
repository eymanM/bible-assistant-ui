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
            {t.about.description}
          </p>

          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t.about.technicalImplementation}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Code2 size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">{t.about.frontend}</h4>
              </div>
              <p className="text-xs text-slate-500">{t.about.frontendDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Server size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">{t.about.backendAI}</h4>
              </div>
              <p className="text-xs text-slate-500">{t.about.backendDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                   <Shield size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">{t.about.authCloud}</h4>
              </div>
              <p className="text-xs text-slate-500">{t.about.authDesc}</p>
            </div>
             
             <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                   <CreditCard size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">{t.about.payments}</h4>
              </div>
               <p className="text-xs text-slate-500">{t.about.paymentsDesc}</p>
            </div>
          </div>

          {/* Language Support Notice */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                <Languages size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">{t.about.languageSupport}</h4>
                <p className="text-xs text-slate-600">{t.about.languageSupportDesc}</p>
              </div>
            </div>
          </div>
          
           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                {t.about.createdBy}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
