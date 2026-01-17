'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { MessageSquareHeart, Menu, X, Home, Heart, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { navigateToCreateMemorial } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [mounted, supabase])

  const closeMenu = () => setIsOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    const toastId = toast.loading('Signing out...')
    await supabase.auth.signOut()
    toast.dismiss(toastId)
    toast.success('Signed out successfully!')
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/account', label: 'Account' },
  ]

  // Mobile bottom navigation items (Create is in hamburger menu)
  const mobileNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Memorials', icon: Heart, requiresAuth: true },
    { href: '/account', label: 'Profile', icon: User, requiresAuth: true },
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      {/* Desktop & Tablet Navigation - Fixed Top */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md shadow-memorial'
          : 'bg-memorial-bg/80 dark:bg-memorialDark-bg/80 backdrop-blur-sm'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
              <MessageSquareHeart size={28} className="text-memorial-gold dark:text-memorialDark-gold" />
              <span className="font-serif font-semibold text-xl text-memorial-text dark:text-memorialDark-text">
                Hereafter, Pal
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)
                    ? 'text-memorial-gold dark:text-memorialDark-gold'
                    : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {mounted && !loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    {userLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)
                          ? 'text-memorial-gold dark:text-memorialDark-gold'
                          : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text'
                          }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-red-500 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium bg-memorial-gold dark:bg-memorialDark-gold text-white px-4 py-2 rounded-memorial hover:opacity-90 transition-opacity duration-200"
                  >
                    Log In
                  </Link>
                )
              )}
            </div>

            {/* Mobile Header Right */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 rounded-memorial min-h-touch min-w-touch flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-memorial-surface dark:bg-memorialDark-surface border-t border-memorial-divider dark:border-memorialDark-divider overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-memorial text-base font-medium ${isActive(link.href)
                      ? 'bg-memorial-gold/10 text-memorial-gold dark:text-memorialDark-gold'
                      : 'text-memorial-text dark:text-memorialDark-text hover:bg-memorial-bg dark:hover:bg-memorialDark-bg'
                      }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-memorial-divider dark:border-memorialDark-divider my-2" />
                {mounted && !loading && (
                  user ? (
                    <>
                      {userLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`block px-4 py-3 rounded-memorial text-base font-medium ${isActive(link.href)
                            ? 'bg-memorial-gold/10 text-memorial-gold dark:text-memorialDark-gold'
                            : 'text-memorial-text dark:text-memorialDark-text hover:bg-memorial-bg dark:hover:bg-memorialDark-bg'
                            }`}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 rounded-memorial text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block text-center px-4 py-3 rounded-memorial text-base font-medium bg-memorial-gold dark:bg-memorialDark-gold text-white"
                      onClick={closeMenu}
                    >
                      Log In
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md border-t border-memorial-divider dark:border-memorialDark-divider safe-area-bottom">
        <div className="grid grid-cols-3 h-14">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            // Handle auth-required items
            if (item.requiresAuth && (!mounted || loading)) {
              return (
                <div key={item.href} className="flex flex-col items-center justify-center gap-0.5 opacity-50">
                  <Icon size={22} />
                  <span className="text-[10px]">{item.label}</span>
                </div>
              )
            }

            if (item.requiresAuth && !user) {
              return (
                <Link
                  key={item.href}
                  href="/login"
                  className="flex flex-col items-center justify-center gap-0.5 text-memorial-textSecondary dark:text-memorialDark-textSecondary"
                >
                  <Icon size={22} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              )
            }

            if (item.isCreate) {
              return (
                <button
                  key={item.href}
                  onClick={navigateToCreateMemorial}
                  className={`flex flex-col items-center justify-center gap-0.5 ${active
                    ? 'text-memorial-gold dark:text-memorialDark-gold'
                    : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary'
                    }`}
                >
                  <div className={`p-1.5 rounded-full ${active ? '' : 'bg-memorial-gold dark:bg-memorialDark-gold'}`}>
                    <Icon size={20} className={active ? '' : 'text-white'} />
                  </div>
                  <span className="text-[10px]">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 ${active
                  ? 'text-memorial-gold dark:text-memorialDark-gold'
                  : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary'
                  }`}
              >
                <Icon size={22} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
