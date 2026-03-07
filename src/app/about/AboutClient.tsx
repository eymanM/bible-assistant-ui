'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

export default function AboutClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 text-slate-900 tracking-tight">{t.about.title}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
             {t.about.subtitle}
          </p>
        </header>

        <div className="prose prose-slate prose-lg max-w-none text-slate-700">
          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">{t.about.missionTitle}</h2>
            <p className="mb-6 text-lg leading-relaxed">
              {t.about.missionText}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 my-8 md:my-12 not-prose">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{t.about.stats.years}</div>
                <div className="text-sm text-slate-500 font-medium">{t.about.stats.yearsDesc}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{t.about.stats.qa}</div>
                <div className="text-sm text-slate-500 font-medium">{t.about.stats.qaDesc}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center sm:col-span-2 md:col-span-1">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{t.about.stats.accuracy}</div>
                <div className="text-sm text-slate-500 font-medium">{t.about.stats.accuracyDesc}</div>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="mb-12 md:mb-16 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900">{t.about.toolsTitle}</h2>
            <p className="mb-6">
              {t.about.toolsText}
            </p>
            <p className="text-slate-600 italic">
              {t.about.charityText}
            </p>
          </section>

          {/* Accessibility Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">{t.about.accessibilityTitle}</h2>
            <p>
              {t.about.accessibilityText}
            </p>
          </section>

          <section className="border-t border-slate-200 pt-10">
             <div className="flex gap-4 justify-center">
               <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                 {t.footer.privacy}
               </Link>
               <span className="text-slate-300">|</span>
               <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                 {t.footer.contact}
               </Link>
             </div>
          </section>
        </div>
      </div>
    </main>
  );
}
