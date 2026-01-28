import React from 'react';
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Support | Bible Assistant',
  description: 'Contact Bible Assistant team for support or feedback. We help you make the most of your AI Bible study experience.',
};

export default function Contact() {
  return <ContactClient />;
}

