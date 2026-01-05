'use client';

import { Amplify } from 'aws-amplify';
import { CookieStorage, Hub } from 'aws-amplify/utils';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';



// Configure token storage to use cookies for SSR compatibility if needed, 
// strictly speaking for client-side valid auth default is sufficient but specific cookie config helps next.js middleware.
// For now, we'll stick to default storage to keep it simple unless we need middleware protection.

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
    const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID;
    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID;

    console.log("AuthContext: Configuring Amplify");
    console.log("AuthContext: IDs ->", { 
      poolId: userPoolId ? `...${userPoolId.slice(-4)}` : 'MISSING', 
      clientId: clientId ? `...${clientId.slice(-4)}` : 'MISSING' 
    });

    try {
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: userPoolId!,
            userPoolClientId: clientId!,
          }
        }
      });
      console.log("AuthContext: Amplify configured successfully");
    } catch (e) {
      console.error("Amplify Config Error", e);
    }
    
    // Subscribe to auth events
    const hubListenerCancel = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    checkUser();

    return () => hubListenerCancel();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
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
