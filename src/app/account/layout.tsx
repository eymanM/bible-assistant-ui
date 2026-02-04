import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your Bible Assistant account settings, view transaction history, and update your preferences.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${baseUrl}/account`,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
