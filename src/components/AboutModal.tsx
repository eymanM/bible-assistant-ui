'use client';

import React from 'react';
import { X, Code2, Server, Database, Shield, CreditCard } from 'lucide-react';
import { version } from '../../package.json';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            About Bible Assistant
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
            Bible Assistant is an advanced AI-powered Bible study tool designed to provide deeper insights into scripture through modern technology. 
            It combines traditional study methods with cutting-edge artificial intelligence to offer context, commentary, and semantic search capabilities.
          </p>

          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Technical Implementation</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Code2 size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">Frontend</h4>
              </div>
              <p className="text-xs text-slate-500">Built with <strong>Next.js 16</strong>, <strong>React 19</strong>, and <strong>TailwindCSS</strong> for a responsive, performant user interface.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Server size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">Backend & AI</h4>
              </div>
              <p className="text-xs text-slate-500">Python server powering advanced vector search and LLM integration for semantic understanding.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                   <Shield size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">Auth & Cloud</h4>
              </div>
              <p className="text-xs text-slate-500">Secure authentication via <strong>AWS Cognito</strong> and cloud infrastructure on <strong>AWS</strong>.</p>
            </div>
             
             <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                   <CreditCard size={18} />
                </div>
                <h4 className="font-semibold text-slate-800">Payments</h4>
              </div>
               <p className="text-xs text-slate-500">Integrated <strong>Stripe</strong> payment processing for credit management and premium features.</p>
            </div>
          </div>
          
           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Created by [Your Name] &bull; 2026
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
