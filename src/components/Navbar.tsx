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
    { href: '/#about', label: 'About', id: 'about' },
    { href: '/#benefits', label: 'Features', id: 'benefits' },
    { href: '/#how-it-works', label: 'How it Works', id: 'how-it-works' },
    { href: '/#pricing', label: 'Pricing', id: 'pricing' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        closeMenu();
      }
    }
  };

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

  // Render Public Navbar - Architectural Redesign
  // "Roofline" style: h-20, solid/frosted bg, minimal border
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center border-b ${scrolled
        ? 'bg-memorial-bg/95 dark:bg-memorialDark-bg/95 backdrop-blur-md border-memorial-border/50 dark:border-memorialDark-border/50'
        : 'bg-transparent border-transparent'
        }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo - Minimalist */}
          <Link href="/" className="flex items-center gap-3 z-50 relative group" onClick={closeMenu}>
            <div className="bg-memorial-accent/5 dark:bg-memorialDark-accent/5 p-2 rounded-md group-hover:bg-memorial-accent/10 transition-colors">
              <MessageSquareHeart size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
            </div>
            <span className="font-serif font-bold text-xl text-memorial-text dark:text-memorialDark-text tracking-tight">
              HereAfter, Pal
            </span>
          </Link>

          {/* Desktop Navigation - Micro-copy style */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:-translate-y-0.5 ${isActive(link.href)
                  ? 'text-memorial-accent dark:text-memorialDark-accent'
                  : 'text-memorial-textSecondary/80 dark:text-memorialDark-textSecondary/80 hover:text-memorial-text dark:hover:text-memorialDark-text'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <div className="w-px h-8 bg-memorial-border/50 dark:bg-memorialDark-border/50 hidden md:block" />

            {mounted && !loading ? (
              user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-xs uppercase tracking-widest font-medium text-memorial-textSecondary hover:text-memorial-accent transition-colors"
                  >
                    Dashboard
                  </Link>
                  <ProfileDropdown user={user} onSignOut={handleSignOut} />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-xs uppercase tracking-widest font-medium text-memorial-textSecondary hover:text-memorial-text transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login?signup=true"
                    className="h-11 px-6 flex items-center justify-center bg-memorial-accent text-memorial-bg dark:text-memorialDark-bg rounded-sm text-xs uppercase tracking-widest font-medium hover:bg-memorial-accentHover transition-all hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-memorial-surfaceAlt animate-pulse" />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4 z-[60] relative">
            <ThemeToggle />
            <button
              className="p-2 text-memorial-text dark:text-memorialDark-text hover:bg-memorial-surfaceAlt/50 rounded-md transition-colors cursor-pointer relative z-[60]"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              type="button"
            >
              {isOpen ? <X size={24} className="relative z-[60]" /> : <Menu size={24} className="relative z-[60]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Architectural */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-0 bg-memorial-bg dark:bg-memorialDark-bg z-40 md:hidden pt-28 px-6 flex flex-col h-screen"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-2xl font-serif font-medium border-b border-memorial-border/20 dark:border-memorialDark-border/20 pb-4 ${isActive(link.href)
                    ? 'text-memorial-accent dark:text-memorialDark-accent'
                    : 'text-memorial-text dark:text-memorialDark-text'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto mb-12 space-y-6">
              {mounted && !loading && (
                user ? (
                  <div className="space-y-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-4 p-4 rounded-md bg-memorial-surfaceAlt/30 border border-memorial-border/50"
                      onClick={closeMenu}
                    >
                      <div className="w-10 h-10 rounded-full bg-memorial-accent text-white flex items-center justify-center text-sm font-serif">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-medium text-memorial-text dark:text-memorialDark-text">
                          Dashboard
                        </span>
                        <span className="text-xs text-memorial-textSecondary font-sans">
                          {user.email}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full h-14 flex items-center justify-center text-red-500 font-medium rounded-md border border-red-200 hover:bg-red-50 transition-colors uppercase tracking-widest text-xs"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      href="/login"
                      className="w-full h-14 flex items-center justify-center font-medium rounded-sm border border-memorial-border text-memorial-text dark:text-memorialDark-text uppercase tracking-widest text-xs"
                      onClick={closeMenu}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="w-full h-14 flex items-center justify-center font-medium rounded-sm bg-memorial-accent text-white hover:bg-memorial-accentHover transition-colors uppercase tracking-widest text-xs"
                      onClick={closeMenu}
                    >
                      Get Started
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
