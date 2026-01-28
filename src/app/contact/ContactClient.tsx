'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

export default function ContactClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">{t.contact.title}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Info & Context */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
             <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.contact.feedbackTitle}</h2>
             <div className="prose prose-slate text-slate-600 mb-8">
               <p>
                 {t.contact.feedbackText}
               </p>
             </div>

             <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t.contact.emailSupport}</h3>
                  <p className="text-slate-500 text-sm mb-2">{t.contact.emailDesc}</p>
                  <a href="mailto:support@bibleassistant.example.com" className="text-indigo-600 font-semibold hover:underline">
                    support@bibleassistant.example.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t.contact.socialCommunity}</h3>
                  <p className="text-slate-500 text-sm mb-2">{t.contact.socialDesc}</p>
                  <div className="flex gap-4">
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Twitter</a>
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">LinkedIn</a>
                    <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">GitHub</a>
                  </div>
                </div>
              </div>

               <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t.contact.office}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Bible Assistant HQ<br/>
                    Remote / Online
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ or Form Placeholder */}
          <div className="space-y-8">
             <div className="bg-indigo-900 text-white p-8 md:p-10 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{t.contact.faqTitle}</h3>
                <ul className="space-y-4 relative z-10">
                  <li className="border-b border-white/10 pb-4">
                    <h4 className="font-semibold text-indigo-200 mb-1">{t.contact.faq.free.question}</h4>
                    <p className="text-sm text-indigo-100/80">{t.contact.faq.free.answer}</p>
                  </li>
                  <li className="border-b border-white/10 pb-4">
                    <h4 className="font-semibold text-indigo-200 mb-1">{t.contact.faq.versions.question}</h4>
                    <p className="text-sm text-indigo-100/80">{t.contact.faq.versions.answer}</p>
                  </li>
                </ul>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
               <h3 className="text-lg font-bold text-slate-900 mb-2">{t.footer.privacy}</h3>
               <p className="text-slate-500 mb-4 text-sm">{t.cookies.privacyPolicy}</p>
               <Link href="/privacy-policy" className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                 {t.cookies.privacyPolicy}
               </Link>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
