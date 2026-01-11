'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

const stripePromise = null;

const CREDIT_PACKAGES = {
  USD: [
    {
      priceId: 'price_1Slv0VFBQnSs6CN8tEafNsmp',
      name: '10 Credits',
      credits: 10,
      price: '$5.00',
    },
    {
      priceId: 'price_1Slv1fFBQnSs6CN8Jd2twuoK',
      name: '50 Credits',
      credits: 50,
      price: '$20.00',
    }
  ],
  EUR: [
    {
      priceId: 'price_1Slv3jFBQnSs6CN8uDtqOeho',
      name: '10 Credits',
      credits: 10,
      price: '€5.00',
    },
    {
      priceId: 'price_1Slv4DFBQnSs6CN8CnfEQwkX',
      name: '50 Credits',
      credits: 50,
      price: '€20.00',
    }
  ],
  PLN: [
    {
      priceId: 'price_1Slv54FBQnSs6CN8Bvk1ZWZ3',
      name: '10 Credits',
      credits: 10,
      price: '20.00 zł',
    },
    {
      priceId: 'price_1Slv5gFBQnSs6CN8GXEm7LIb',
      name: '50 Credits',
      credits: 50,
      price: '80.00 zł',
    }
  ]
};

type Currency = keyof typeof CREDIT_PACKAGES;

function CreditsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    // Optional: Auto-detect currency or persist selection
    if (success) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (canceled) {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // optimistically mark as canceled in DB
        fetch('/api/transactions/cancel', {
            method: 'POST',
            body: JSON.stringify({ sessionId })
        }).catch(err => console.error('Failed to mark as canceled', err));
      }
    }
  }, [success, canceled, router, searchParams]);

  async function handleBuy(priceId: string, credits: number) {
    if (!user) {
      alert('Please log in first');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.userId, // Cognito sub
          email: user.signInDetails?.loginId,
          credits: credits
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment initialization failed');
      }

      const { url, sessionId } = await response.json(); 
      
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        // Placeholder Stripe logic
        alert('Stripe client redirect not implemented fully without key');
      }
      else {
        console.error('Missing checkout URL or Session ID');
        throw new Error('Invalid response from server: Missing URL');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
             <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Purchase Credits</h1>
        </div>
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="p-2 border rounded bg-white shadow-sm"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="PLN">PLN (zł)</option>
        </select>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>Payment successful! Credits have been added to your account.</p>
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>Payment canceled.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CREDIT_PACKAGES[currency].map((pkg) => (
          <div key={pkg.name} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{pkg.name}</h2>
            <p className="text-3xl font-bold mb-4">{pkg.price}</p>
            <p className="text-gray-600 mb-6">{pkg.credits} AI Request Credits</p>
            <button
              onClick={() => handleBuy(pkg.priceId, pkg.credits)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreditsPage() {
    return (
        <Suspense fallback={<div>Loading credits...</div>}>
            <CreditsContent />
        </Suspense>
    );
}
