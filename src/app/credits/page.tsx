'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export const dynamic = 'force-dynamic';

const stripePromise = null;

type Currency = 'USD' | 'PLN';

function CreditsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<Currency>(language === 'pl' ? 'PLN' : 'USD');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(100);

  useEffect(() => {
    // Optional: Auto-detect currency or persist selection
    if (success) {
      const checkAndRedirect = async () => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          try {
            await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });
          } catch (e) {
            console.error('Verification failed', e);
          }
        }
        setTimeout(() => {
          router.push('/');
        }, 5000);
      };
      
      checkAndRedirect();
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

  async function handleBuy(creditsToBuy: number) {
    if (!user) {
      setErrorMsg(t.credits.loginRequired);
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId, // Cognito sub
          email: user.signInDetails?.loginId,
          credits: creditsToBuy,
          locale: currency === 'PLN' ? 'pl' : 'en',
          currency: currency,
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
        // Dynamically import stripe to keep initial bundle size small
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
        if (stripe) {
            await (stripe as any).redirectToCheckout({ sessionId });
        } else {
            throw new Error('Failed to load Stripe SDK. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
        }
      }
      else {
        console.error('Missing checkout URL or Session ID');
        throw new Error('Invalid response from server: Missing URL');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`${t.credits.paymentFailed}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function getRateCents(amount: number) {
    const cappedAmount = Math.min(500, Math.max(10, amount));
    const steps = Math.max(0, Math.floor((cappedAmount - 20) / 20));
    return 14 - (steps * 0.25);
  }

  function getPriceEstimate(amount: number, curr: Currency) {
    const rateCents = getRateCents(amount);
    let finalRateCents = rateCents;
    if (curr === 'PLN') finalRateCents = rateCents * 4;

    const totalCents = Math.round(amount * finalRateCents);
    
    if (curr === 'USD') return `${(totalCents / 100).toFixed(2)} USD`;
    if (curr === 'PLN') return `${(totalCents / 100).toFixed(2)} zł`;
    return '';
  }

  function getBasePriceEstimate(amount: number, curr: Currency) {
    let rateCents = 14;
    let finalRateCents = rateCents;
    if (curr === 'PLN') finalRateCents = rateCents * 4;
    
    const totalCents = Math.round(amount * finalRateCents);
    
    if (curr === 'USD') return `${(totalCents / 100).toFixed(2)} USD`;
    if (curr === 'PLN') return `${(totalCents / 100).toFixed(2)} zł`;
    return '';
  }

  function getDiscountPercentage(amount: number) {
    const rateCents = getRateCents(amount);
    if (rateCents >= 14) return 0;
    const discount = 1 - (rateCents / 14);
    return Math.round(discount * 100);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
             <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t.credits.back}
            </button>
            <h1 className="text-3xl font-bold">{t.credits.title}</h1>
        </div>
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="p-2 border rounded bg-white shadow-sm"
        >
          <option value="USD">{t.credits.usd}</option>
          <option value="PLN">{t.credits.pln}</option>
        </select>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>{t.credits.paymentSuccessful}</p>
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>{t.credits.paymentCanceled}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-pulse">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="max-w-xl mx-auto border rounded-xl p-8 shadow-sm bg-white hover:shadow-md transition-shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t.credits.creditsWord} ({t.credits.aiRequestCredits})</h2>
        
        <div className="mb-8">
          <label className="block text-gray-600 text-sm mb-4 text-center">
             Wybierz ilość kredytów. Im więcej kupujesz, tym <span className="font-semibold text-green-600">większy rabat</span> otrzymujesz!
          </label>
          <div className="flex items-center justify-center gap-4 mb-6">
             <button 
               onClick={() => setCredits(Math.max(10, credits - 10))} 
               className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
             >
               -
             </button>
             <input 
                type="number" 
                min="10" max="500" step="10" 
                value={credits}
                onChange={(e) => setCredits(Math.min(500, Math.max(10, Number(e.target.value))))}
                className="w-24 text-center text-xl font-bold border rounded py-2"
             />
             <button 
               onClick={() => setCredits(Math.min(500, credits + 10))} 
               className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
             >
               +
             </button>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>10</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>

        <div className="text-center mb-8 bg-gray-50 p-6 rounded-lg relative overflow-hidden border border-gray-100" translate="no">
          {getDiscountPercentage(credits) > 0 && (
             <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
               Rabat {getDiscountPercentage(credits)}%
             </div>
          )}
          <p className="text-gray-500 mb-2 font-medium">Całkowity koszt:</p>
          <div className="flex items-end justify-center gap-3">
             {getDiscountPercentage(credits) > 0 && (
                <p className="text-2xl font-semibold text-gray-400 line-through mb-1">{getBasePriceEstimate(credits, currency)}</p>
             )}
             <p className="text-4xl font-bold text-blue-600">{getPriceEstimate(credits, currency)}</p>
          </div>
          <p className="text-sm text-gray-400 mt-3 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Bezpieczna płatność Stripe
          </p>
        </div>

        <button
          onClick={() => handleBuy(credits)}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? t.credits.processing : t.credits.buyNow}
        </button>
      </div>
    </div>
  );
}

export default function CreditsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <CreditsContent />
        </Suspense>
    );
}
