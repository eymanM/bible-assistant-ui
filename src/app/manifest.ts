import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isPolish = acceptLanguage.includes('pl');

  return {
    name: isPolish ? 'Asystent Biblijny' : 'Bible Assistant',
    short_name: isPolish ? 'Biblia' : 'Bible',
    description: isPolish 
      ? 'Nowoczesny asystent biblijny wspierany przez AI' 
      : 'A modern AI-powered Bible study assistant',
    start_url: '/',
    display: 'standalone',
    background_color: '#122d4a',
    theme_color: '#122d4a',
    orientation: 'portrait-primary',
    prefer_related_applications: false,
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable' as any,
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable' as any,
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable' as any,
      },
    ],
  };
}
