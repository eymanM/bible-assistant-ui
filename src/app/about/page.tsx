import React from 'react';
import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Bible Assistant | AI Scripture Tool',
  description: 'Bridges ancient scripture with modern understanding. AI-powered theological insights accessible to everyone.',
};

export default function About() {
  return <AboutClient />;
}

