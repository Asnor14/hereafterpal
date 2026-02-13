import './globals.css';
import { playfair, inter } from './fonts';
import { ThemeProvider } from './theme-provider'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/context/AuthContext';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-memorial-bg dark:bg-memorialDark-bg font-sans selection:bg-memorial-accent/20 selection:text-memorial-text">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ToastProvider />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-nav">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
