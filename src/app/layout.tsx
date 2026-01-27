import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Bible Assistant - AI-Powered Bible Study & Research Tool',
    template: '%s | Bible Assistant',
  },
  description: 'A modern AI-powered Bible study assistant. Explore scripture, commentaries, and theological insights with advanced artificial intelligence.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bible Assistant',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Bible Assistant - AI-Powered Bible Study & Research Tool',
    description: 'A modern AI-powered Bible study assistant. Explore scripture, commentaries, and theological insights.',
    siteName: 'Bible Assistant',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Bible Assistant Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Bible Assistant - AI-Powered Bible Study',
    description: 'Explore scripture and theology with AI assistance.',
    images: ['/icons/icon-512x512.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport = {
  themeColor: '#122d4a',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <div className="min-h-screen bg-gray-50">{children}</div>
            <CookieConsent />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}