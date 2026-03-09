'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const dashboardRoutes = ['/dashboard', '/create-memorial', '/account', '/pricing', '/memorial'];
  const isDashboardPage = dashboardRoutes.some(route => pathname?.startsWith(route));

  if (isDashboardPage) {
    return null;
  }

  return (
    <footer className="border-t border-memorial-borderLight dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="mb-2 inline-flex items-center gap-3">
              <Image
                src="/hereafterpal_logo.png"
                alt="HereafterPal logo"
                width={34}
                height={34}
                className="h-8 w-8 rounded-sm"
              />
              <span className="font-serif text-lg text-memorial-text dark:text-memorialDark-text">
                HereafterPal
              </span>
            </Link>
            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
              Copyright {currentYear} HereafterPal. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/about"
              className="text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
            >
              Pricing
            </Link>
            <a
              href="mailto:support@hereafterpal.com"
              className="text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
