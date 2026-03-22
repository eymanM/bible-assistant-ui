import React from 'react';
import { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | Scripture Assistant',
  description: 'Learn how Scripture Assistant protects your data. Read our policy on collection, user rights, and security.',
};

export default function PrivacyPolicy() {
  return <PrivacyClient />;
}

