'use client';

import Link from 'next/link';
import React from 'react';
import { useLanguage } from '../lib/language-context';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Bible Assistant. {t.footer.rights}
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/about" 
              className="text-sm text-slate-600 hover:text-indigo-600 hover:underline transition-colors font-medium"
            >
              {t.footer.about}
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-slate-600 hover:text-indigo-600 hover:underline transition-colors font-medium"
            >
              {t.footer.contact}
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-sm text-slate-600 hover:text-indigo-600 hover:underline transition-colors font-medium"
            >
              {t.footer.privacy}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
