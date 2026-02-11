'use client';

import React from 'react';
import { X, History, Trash2 } from 'lucide-react';
import { useLanguage } from '../lib/language-context';
import { useSearchHistory } from '../hooks/useSearchHistory';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryClick: (item: { query: string; response?: string; bible_results?: string[]; commentary_results?: string[] }) => void;
  refreshTrigger?: number;
}

export default function HistoryModal({ isOpen, onClose, onHistoryClick }: HistoryModalProps) {
  const { t } = useLanguage();
  const { 
    data: history, 
    isLoading: loading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    deleteItem 
  } = useSearchHistory();
  
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => {
      const root = dialogRef.current;
      if (!root) return [];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (bottom && hasNextPage && !loading && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, loading, isFetchingNextPage, fetchNextPage]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(id);
  };

  const handleItemClick = (item: any) => {
    onHistoryClick(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h2 id="history-title" className="text-xl font-bold text-white flex items-center gap-2">
            <History size={24} />
            {t.history.title}
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            aria-label="Close history dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">{t.sidebar.loading}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <History size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">{t.history.noHistory}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className="p-4 hover:bg-slate-50 rounded-xl group cursor-pointer transition-all border border-slate-100 hover:border-indigo-200 hover:shadow-sm relative active:scale-[0.99]"
                >
                  <div className="pr-8">
                    <p className="text-base font-semibold text-slate-800 mb-1">{item.query}</p>
                    {item.response && (
                      <p className="text-sm text-slate-600 line-clamp-2">{item.response}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600"
                    title={t.history.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
