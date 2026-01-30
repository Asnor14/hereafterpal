'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-memorial-borderLight dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Copyright */}
          <div className="text-center md:text-left">
            <Link href="/" className="font-serif text-lg text-memorial-text dark:text-memorialDark-text mb-2 inline-block">
              <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
            </Link>
            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
              © {currentYear} Hereafter, Pal. All rights reserved.
            </p>
          </div>

          {/* Links */}
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
