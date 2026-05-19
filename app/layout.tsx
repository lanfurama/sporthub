import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportHub',
  description: 'Sports court booking platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
