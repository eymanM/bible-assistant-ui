'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, Search, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface Metrics {
  totalUsers: number;
  totalSearches: number;
  aiSearches: number;
  totalRevenueUSD: number;
  estimatedTotalCost: number;
}

interface FlaggedSearch {
  user_search_id: number;
  created_at: string;
  user_id: number;
  query: string;
  response: string;
  language: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [flagged, setFlagged] = useState<FlaggedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [metricsRes, flaggedRes] = await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/admin/flagged')
        ]);

        if (!metricsRes.ok || !flaggedRes.ok) {
          if (metricsRes.status === 403 || flaggedRes.status === 403) {
            throw new Error('Unauthorized Access. You must be an admin.');
          }
          throw new Error('Failed to fetch admin data');
        }

        const metricsData = await metricsRes.json();
        const flaggedData = await flaggedRes.json();

        setMetrics(metricsData.metrics);
        setFlagged(flaggedData.flagged);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
       <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
       </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 text-center max-w-md">{error}</p>
          <button 
             onClick={() => router.push('/')}
             className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
             Return Home
          </button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
         <header className="flex justify-between items-end border-b border-slate-200 pb-6">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
               <p className="text-slate-500 mt-1">Platform overview and flagged content</p>
            </div>
         </header>

         {/* KPI Metric Cards */}
         {metrics && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Users" 
                    value={metrics.totalUsers} 
                    icon={<Users className="w-6 h-6 text-blue-500" />} 
                />
                <MetricCard 
                    title="Total Searches" 
                    value={metrics.totalSearches} 
                    subtitle={`${metrics.aiSearches} AI generated`}
                    icon={<Search className="w-6 h-6 text-purple-500" />} 
                />
                <MetricCard 
                    title="Stripe Revenue" 
                    value={`$${metrics.totalRevenueUSD.toFixed(2)}`} 
                    icon={<DollarSign className="w-6 h-6 text-emerald-500" />} 
                />
                <MetricCard 
                    title="Est. LLM Cost" 
                    value={`$${metrics.estimatedTotalCost.toFixed(2)}`} 
                    subtitle="Based on $0.005/query"
                    icon={<Activity className="w-6 h-6 text-amber-500" />} 
                />
             </div>
         )}

         {/* Flagged AI Responses */}
         <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5 text-red-500" />
                 Flagged Searches
               </h2>
               <p className="text-sm text-slate-500 mt-1">Queries users downvoted for poor AI quality or inaccuracies.</p>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                     <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 w-1/4">Query</th>
                        <th className="px-6 py-4">AI Response Snippet</th>
                        <th className="px-6 py-4 w-24">Lang</th>
                     </tr>
                  </thead>
                  <tbody>
                     {flagged.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                No flagged searches found. Good job!
                            </td>
                        </tr>
                     ) : (
                        flagged.map((item) => (
                           <tr key={item.user_search_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  {new Date(item.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-900">
                                  {item.query}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="max-h-24 overflow-y-auto text-xs whitespace-pre-wrap pr-2 rounded bg-slate-50 p-2 border border-slate-100">
                                      {item.response || 'No AI response recorded'}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 uppercase">
                                     {item.language}
                                  </span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }: { title: string, value: string | number, subtitle?: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
                <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
            </div>
            <div className="flex flex-col">
               <span className="text-3xl font-bold text-slate-900">{value}</span>
               {subtitle && <span className="text-xs text-slate-400 mt-1">{subtitle}</span>}
            </div>
        </div>
    );
}
