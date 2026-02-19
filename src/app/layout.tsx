import './globals.css';
import { playfair, inter } from './fonts';
import { ClientLayout } from './client-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HereAfter, Pal - Eternal Digital Memorials',
  description: 'Create a lasting tribute for your loved ones with our secure, beautiful digital memorial service.',
  openGraph: {
    title: 'HereAfter, Pal - Eternal Digital Memorials',
    description: 'Create a lasting tribute for your loved ones.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-memorial-bg dark:bg-memorialDark-bg font-sans selection:bg-memorial-accent/20 selection:text-memorial-text">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
