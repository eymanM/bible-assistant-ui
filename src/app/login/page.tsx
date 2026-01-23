'use client';

import { Authenticator, translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { I18n } from 'aws-amplify/utils';
import { useLanguage } from '@/lib/language-context';

export default function LoginPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Configure Amplify translations
    // @ts-ignore - Amplify types mismatch sometimes with I18n
    I18n.putVocabularies(translations);
    I18n.setLanguage(language);

    // Add custom translations
    I18n.putVocabularies({
      en: {
        'Sign in to continue': 'Sign in to continue',
        'Bible Assistant': 'Bible Assistant'
      },
      pl: {
        'Sign in to continue': 'Zaloguj się, aby kontynuować',
        'Bible Assistant': 'Asystent Biblijny',
        'Sign In': 'Zaloguj się',
        'Sign Up': 'Zarejestruj się',
        'Create Account': 'Utwórz konto',
        'Forgot your password?': 'Zapomniałeś hasła?',
        'Enter your email': 'Wpisz swój email',
        'Enter your password': 'Wpisz swoje hasło',
        'Phone Number': 'Numer telefonu',
        'Username': 'Nazwa użytkownika',
        'Email': 'Email',
        'Password': 'Hasło',
        'New password': 'Nowe hasło',
        'Confirm Password': 'Potwierdź hasło',
        'Send code': 'Wyślij kod',
        'Resend Code': 'Wyślij kod ponownie',
        'Confirmation Code': 'Kod potwierdzenia',
        'Confirm': 'Potwierdź',
        'Verify Contact': 'Weryfikacja kontaktu',
        'Account recovery requires verified contact information': 'Odzyskiwanie konta wymaga zweryfikowanych danych kontaktowych',
        'User does not exist.': 'Użytkownik nie istnieje.',
        'Incorrect username or password.': 'Nieprawidłowa nazwa użytkownika lub hasło.'
      }
    });

    setMounted(true);
    if (user) {
      router.push('/');
    }
  }, [user, router, language]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Authenticator 
        loginMechanisms={['email']}
        signUpAttributes={['email']}
        components={{
          Header: () => (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{I18n.get('Bible Assistant')}</h1>
              <p className="text-gray-500">{I18n.get('Sign in to continue')}</p>
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
