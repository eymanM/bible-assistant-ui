'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import type { AuthUser } from 'aws-amplify/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        try {
            const [{ Amplify }, { Hub }, { getCurrentUser }] = await Promise.all([
              import('aws-amplify'),
              import('aws-amplify/utils'),
              import('aws-amplify/auth')
            ]);

            const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID;
            const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID;

            if (userPoolId && clientId) {
                try {
                Amplify.configure({
                    Auth: {
                    Cognito: {
                        userPoolId,
                        userPoolClientId: clientId,
                    }
                    }
                });
                console.log("AuthContext: Amplify configured successfully");
                } catch (e) {
                console.error("Amplify Config Error", e);
                }
            }

            // Subscribe to auth events
            const hubListenerCancel = Hub.listen('auth', (data) => {
                switch (data.payload.event) {
                case 'signedIn':
                    checkUser(getCurrentUser);
                    break;
                case 'signedOut':
                    setUser(null);
                    break;
                }
            });

            await checkUser(getCurrentUser);

            return () => hubListenerCancel();
        } catch (error) {
            console.error("Failed to load Amplify:", error);
            setLoading(false);
        }
    };
    initAuth();
  }, []);

  async function checkUser(getCurrentUserFn?: () => Promise<AuthUser>) {
    try {
      const getUser = getCurrentUserFn || (await import('aws-amplify/auth')).getCurrentUser;
      const currentUser = await getUser();
      setUser(currentUser);

      // Sync user to DB
      if (currentUser?.userId && currentUser?.signInDetails?.loginId) {
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.userId,
            email: currentUser.signInDetails.loginId
          })
        }).catch(err => console.error('Failed to sync user to DB:', err));
      }

    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
