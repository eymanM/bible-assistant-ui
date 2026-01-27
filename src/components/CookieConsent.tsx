'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay to not overwhelm user immediately on load
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
        >
          <div className="mx-4 sm:mx-0 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shrink-0">
                <Cookie className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Cookies
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group">
                  {t.cookies.text}{' '}
                  <Link 
                    href="/privacy-policy" 
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2 transition-colors"
                  >
                    {t.cookies.privacyPolicy}
                  </Link>.
                </p>
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={acceptCookies}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform active:scale-95"
                  >
                    {t.cookies.accept}
                  </button>
                  <button
                     onClick={() => setShow(false)}
                     className="p-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                     aria-label="Close"
                  >
                     <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
