'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Authenticator 
        loginMechanisms={['email']}
        signUpAttributes={['email']}
        components={{
          Header: () => (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Bible Assistant</h1>
              <p className="text-gray-500">Sign in to continue</p>
            </div>
          )
        }}
      >
        {({ signOut, user }) => (
          <div className="text-center">
             <p>Welcome, {user?.signInDetails?.loginId}</p>
             <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}
