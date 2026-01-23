'use client';

import React from 'react';
import Link from 'next/link';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

import { User } from '@/lib/types';

interface UserProfileProps {
  user: User | undefined;
  onLogout?: () => void;
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onClose }) => {
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="px-4 mb-2">
       <div className="mb-2 px-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {t.main.account}
        </h2>
      </div>
      
      <Link
        href="/account"
        onClick={onClose}
        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 group"
      >
        <div className="flex items-center gap-3">
          <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
          <span className="font-medium text-sm">{t.main.account}</span>
        </div>
      </Link>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-red-50 text-slate-600 hover:text-red-600 group mb-2"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-medium text-sm">{t.main.logout}</span>
        </div>
      </button>
    </div>
  );
};

export default UserProfile;
