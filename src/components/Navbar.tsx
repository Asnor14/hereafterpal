'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageSquareHeart, ChevronRight, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { type User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  isDashboard?: boolean;
  user?: User | null;
  onSignOut?: () => void;
  onMenuClick?: () => void;
}

export function Navbar({ isDashboard = false, user: propUser, onSignOut, onMenuClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted || propUser) return;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mounted, propUser, supabase]);

  useEffect(() => {
    if (propUser !== undefined) {
      setUser(propUser);
      setLoading(false);
    }
  }, [propUser]);

  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    closeMenu();
    if (onSignOut) {
      onSignOut();
    } else {
      const toastId = toast.loading('Signing out...');
      await supabase.auth.signOut();
      toast.dismiss(toastId);
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (path: string) => pathname === path;

  // Render Dashboard Navbar
  if (isDashboard) {
    return (
      <nav className="top-nav">
        <div className="top-nav-container">
          <div className="top-nav-left">
            <button
              className="menu-toggle"
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <Link href="/dashboard" className="top-nav-logo">
              <MessageSquareHeart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
              <span className="top-nav-logo-text">
                <span className="decorative-letter">H</span>ereAfter, <span className="decorative-letter">P</span>al
              </span>
            </Link>
          </div>

          <div className="top-nav-right">
            <ThemeToggle />
            {mounted && !loading && user && (
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Render Public Navbar
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md shadow-nav'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-navbar-height">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 relative" onClick={closeMenu}>
            <div className="bg-memorial-accent/10 dark:bg-memorialDark-accent/10 p-2 rounded-lg">
              <MessageSquareHeart size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
            </div>
            <span className="font-serif font-semibold text-xl text-memorial-text dark:text-memorialDark-text tracking-tight">
              HereAfter, Pal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)
                    ? 'text-memorial-accent dark:text-memorialDark-accent'
                    : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {mounted && !loading ? (
              user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-memorial-textSecondary hover:text-memorial-accent transition-colors"
                  >
                    Dashboard
                  </Link>
                  <ProfileDropdown user={user} onSignOut={handleSignOut} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-memorial-textSecondary hover:text-memorial-text transition-colors px-3 py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login?signup=true"
                    className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                  >
                    Get Started <ChevronRight size={16} />
                  </Link>
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-memorial-surfaceAlt animate-pulse" />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2 z-50">
            <ThemeToggle />
            <button
              className="p-2 text-memorial-text dark:text-memorialDark-text"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-0 bg-memorial-bg dark:bg-memorialDark-bg z-40 md:hidden pt-24 px-4 flex flex-col h-screen"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-4 text-lg font-medium rounded-xl transition-colors ${isActive(link.href)
                      ? 'bg-memorial-surfaceAlt/50 text-memorial-accent dark:text-memorialDark-accent'
                      : 'text-memorial-text dark:text-memorialDark-text'
                    }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-memorial-divider dark:border-memorialDark-divider">
              {mounted && !loading && (
                user ? (
                  <div className="space-y-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-4 rounded-xl bg-memorial-surfaceAlt/30"
                      onClick={closeMenu}
                    >
                      <div className="w-10 h-10 rounded-full bg-memorial-accent text-white flex items-center justify-center">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-memorial-text dark:text-memorialDark-text">
                          Dashboard
                        </span>
                        <span className="text-xs text-memorial-textSecondary">
                          {user.email}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full p-4 text-left text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full p-4 text-center font-medium rounded-xl border border-memorial-border text-memorial-text dark:text-memorialDark-text"
                      onClick={closeMenu}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="w-full p-4 text-center font-medium rounded-xl bg-memorial-accent text-white"
                      onClick={closeMenu}
                    >
                      Get Started Free
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
