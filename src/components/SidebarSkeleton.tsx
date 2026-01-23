import React from 'react';

const SidebarSkeleton: React.FC = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col h-screen shadow-2xl border-r border-slate-100 md:sticky md:top-0 md:shadow-lg md:z-20 md:translate-x-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mb-2 px-2">
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-4" />
        </div>

        <div className="bg-slate-50 rounded-xl p-1 flex mb-8">
          <div className="flex-1 h-9 rounded-lg bg-slate-200 animate-pulse m-1" />
          <div className="flex-1 h-9 rounded-lg bg-slate-200 animate-pulse m-1" />
        </div>

        <div className="mb-2 px-2">
           <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-4" />
        </div>
        
        <div className="space-y-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="w-full h-11 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>

        <div className="w-full h-11 rounded-xl bg-slate-100 animate-pulse mt-4" />
      </div>

       <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <div className="w-full h-9 rounded-lg bg-slate-200 animate-pulse mb-2" />
          <div className="flex items-center justify-between px-2">
            <div className="h-3 w-10 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
    </aside>
  );
};

export default SidebarSkeleton;
