import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LexGuard — AI Contract Defense System',
  description:
    'Before you sign anything, LexGuard defends you. AI-powered contract analysis that detects hidden risks, simulates consequences, and arms you with negotiation power.',
  keywords: ['contract analysis', 'AI legal', 'contract risk', 'legal tech', 'LexGuard'],
  openGraph: {
    title: 'LexGuard — AI Contract Defense System',
    description: 'Before you sign anything, LexGuard defends you.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080d1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
