'use client';

import { ThemeProvider } from './theme-provider'
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}
