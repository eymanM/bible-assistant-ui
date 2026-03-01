'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

export default function PrivacyClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium transition-colors">
            {t.account.backToHome}
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 tracking-tight">{t.privacy.title}</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
            <strong>{t.privacy.lastUpdated}</strong> 28.02.2026
          </p>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t.privacy.introTitle}</h2>
            <p className="mb-4">
              {t.privacy.introText}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t.privacy.dataCollectTitle}</h2>
            <p className="mb-4">
              {t.privacy.dataCollectText}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t.privacy.dataUseTitle}</h2>
            <ul className="list-disc pl-6 space-y-2">
                {t.privacy.dataUseList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
          </section>

          <section className="mb-10">
             <h2 className="text-2xl font-bold mb-4 text-slate-800">{t.privacy.securityTitle}</h2>
             <p>
               {t.privacy.securityText}
             </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{t.privacy.contactTitle}</h2>
            <p>
              {t.privacy.contactText} <Link href="/contact" className="text-indigo-600 hover:underline font-medium">{t.footer.contact}</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
