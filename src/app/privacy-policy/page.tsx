import React from 'react';
import { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bible Assistant',
  description: 'Learn how Bible Assistant protects your data. Read our policy on collection, user rights, and security.',
};

export default function PrivacyPolicy() {
  return <PrivacyClient />;
}

