import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportHub',
  description: 'Sports court booking platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
