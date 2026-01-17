'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Heart, Camera, BookOpen, MessageCircle, Home } from 'lucide-react';

export default function MemorialNav({ memorialId, activeSection = 'home' }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll to show/hide background
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, href: '#home' },
        { id: 'life-story', label: 'Life Story', icon: BookOpen, href: '#life-story' },
        { id: 'photos', label: 'Photos', icon: Camera, href: '#photos' },
        { id: 'guestbook', label: 'Guestbook', icon: MessageCircle, href: '#guestbook' },
    ];

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setIsMenuOpen(false);

        // Smooth scroll to section
        const element = document.querySelector(href);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed nav height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth',
            });
        }
    };

    return (
        <>
            {/* Desktop/Tablet Navigation - Top Horizontal */}
            <nav
                className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 no-print ${isScrolled
                        ? 'bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md shadow-memorial'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-center gap-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-memorial transition-all duration-200 ${isActive
                                            ? 'text-memorial-gold dark:text-memorialDark-gold font-medium'
                                            : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text'
                                        }`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation - Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md border-t border-memorial-divider dark:border-memorialDark-divider no-print">
                <div className="grid grid-cols-4 gap-1 p-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-memorial min-h-touch transition-colors duration-200 ${isActive
                                        ? 'text-memorial-gold dark:text-memorialDark-gold'
                                        : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary'
                                    }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Hamburger Menu (Alternative - uncomment if preferred over bottom tab bar) */}
            {/* 
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md rounded-full shadow-memorial min-h-touch min-w-touch flex items-center justify-center no-print"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-memorial-surface dark:bg-memorialDark-surface no-print"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-full gap-2 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center gap-4 w-full px-6 py-4 rounded-memorial min-h-touch text-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-memorial-gold/10 dark:bg-memorialDark-gold/10 text-memorial-gold dark:text-memorialDark-gold font-medium'
                        : 'text-memorial-text dark:text-memorialDark-text hover:bg-memorial-bg dark:hover:bg-memorialDark-bg'
                    }`}
                  >
                    <Icon size={24} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      */}
        </>
    );
}
