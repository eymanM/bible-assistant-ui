'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { updatePassword } from 'aws-amplify/auth';
import { useLanguage } from '@/lib/language-context';

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  credits: number;
  created_at: string;
  stripe_session_id: string;
  status?: 'pending' | 'succeeded' | 'failed' | 'canceled';
}

interface UserData {
  user: {
    email: string;
    credits: number;
  };
  transactions: Transaction[];
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [data, setData] = useState<UserData | null>(null);
  const [fetching, setFetching] = useState(true);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading, router]);

  async function fetchUserData() {
    try {
      if (!user?.userId) return;
      const res = await fetch(`/api/user/me?userId=${user.userId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwMessage({ type: '', text: '' });

    try {
      await updatePassword({ oldPassword, newPassword });
      setPwMessage({ type: 'success', text: t.account.passwordUpdateSuccess });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      setPwMessage({ type: 'error', text: err.message || t.account.passwordUpdateFailed });
    } finally {
      setPwLoading(false);
    }
  }

  if (loading || fetching) return <div className="p-8 text-center">{t.account.loadingAccountData}</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.account.myAccount}</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t.account.backToHome}
        </button>
      </div>
      
      {/* Account Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-1">{t.account.emailAddress}</h2>
          <p className="text-lg font-medium">{user.signInDetails?.loginId || user.username}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-1">{t.account.availableCredits}</h2>
          <p className="text-4xl font-bold text-blue-600">{data?.user?.credits || 0}</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">{t.account.changePassword}</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
           {pwMessage.text && (
             <div className={`p-3 rounded text-sm ${pwMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {pwMessage.text}
             </div>
           )}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t.account.oldPassword}</label>
             <input 
               type="password" 
               required
               value={oldPassword}
               onChange={(e) => setOldPassword(e.target.value)}
               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">{t.account.newPassword}</label>
             <input 
               type="password" 
               required
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
             />
           </div>
           <button 
             type="submit" 
             disabled={pwLoading}
             className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
           >
             {pwLoading ? t.account.updating : t.account.updatePassword}
           </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">{t.account.transactionHistory}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">{t.account.date}</th>
                <th className="px-6 py-3 font-medium text-gray-500">{t.account.amount}</th>
                <th className="px-6 py-3 font-medium text-gray-500">{t.account.credits}</th>
                <th className="px-6 py-3 font-medium text-gray-500">{t.account.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.transactions?.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-4 text-center text-gray-500">{t.account.noTransactions}</td>
                 </tr>
              ) : (
                data?.transactions?.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{tx.amount} {tx.currency}</td>
                    <td className="px-6 py-4">+{tx.credits}</td>
                    <td className={`px-6 py-4 font-medium ${
                        tx.status === 'succeeded' ? 'text-green-600' :
                        tx.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                        {tx.status === 'succeeded' ? t.account.completed : (tx.status || 'unknown')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
