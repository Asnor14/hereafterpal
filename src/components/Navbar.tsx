'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import ProfileDropdown from './ProfileDropdown'
import { MessageSquareHeart, Menu, Search, Bell, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

import { type User } from '@supabase/supabase-js'

interface NavbarProps {
  isDashboard?: boolean
  user?: User | null
  onSignOut?: () => void
  onMenuClick?: () => void
}

export function Navbar({ isDashboard = false, user: propUser, onSignOut, onMenuClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(propUser || null)
  const [loading, setLoading] = useState(!propUser)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notificationCount] = useState(0) // UI only for now
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
    if (!mounted || propUser) return

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
  }, [mounted, supabase, propUser])

  // Update user from props
  useEffect(() => {
    if (propUser !== undefined) {
      setUser(propUser)
      setLoading(false)
    }
  }, [propUser])

  const closeMenu = () => setIsOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    if (onSignOut) {
      onSignOut()
    } else {
      const toastId = toast.loading('Signing out...')
      await supabase.auth.signOut()
      toast.dismiss(toastId)
      toast.success('Signed out successfully!')
      router.push('/')
      router.refresh()
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const isActive = (href) => pathname === href

  // Dashboard navbar (simplified with search)
  if (isDashboard) {
    return (
      <nav className="top-nav">
        <div className="max-w-full mx-auto px-4 md:px-6 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Menu button (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-memorial hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt"
                onClick={onMenuClick}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <Link href="/dashboard" className="flex items-center gap-2">
                <MessageSquareHeart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
                <span className="font-serif font-semibold text-lg text-memorial-text dark:text-memorialDark-text hidden sm:block">
                  <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
                </span>
              </Link>
            </div>

            {/* Right: Notifications + Theme + Profile */}
            <div className="flex items-center gap-2 md:gap-4">

              {/* Notifications */}
              <button className="relative p-2 rounded-memorial hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>

              <ThemeToggle />

              {mounted && !loading && user && (
                <ProfileDropdown user={user} onSignOut={handleSignOut} />
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Public navbar (landing pages)
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-memorial-surface/95 dark:bg-memorialDark-surface/95 backdrop-blur-md shadow-nav'
          : 'bg-memorial-bg/80 dark:bg-memorialDark-bg/80 backdrop-blur-sm'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
              <MessageSquareHeart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
              <span className="font-serif font-semibold text-xl text-memorial-text dark:text-memorialDark-text">
                <span className="decorative-letter">H</span>ereafter, <span className="decorative-letter">P</span>al
              </span>
            </Link>

            {/* Desktop Navigation Links */}
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

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {mounted && !loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text"
                    >
                      Dashboard
                    </Link>
                    <ProfileDropdown user={user} onSignOut={handleSignOut} />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg px-4 py-2 rounded-memorial hover:opacity-90 transition-opacity duration-200"
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
                      ? 'bg-memorial-accent/10 text-memorial-accent dark:text-memorialDark-accent'
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
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 rounded-memorial text-base font-medium text-memorial-text dark:text-memorialDark-text hover:bg-memorial-bg dark:hover:bg-memorialDark-bg"
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-3 rounded-memorial text-base font-medium text-memorial-text dark:text-memorialDark-text hover:bg-memorial-bg dark:hover:bg-memorialDark-bg"
                        onClick={closeMenu}
                      >
                        Account
                      </Link>
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
                      className="block text-center px-4 py-3 rounded-memorial text-base font-medium bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg"
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

      {/* Spacer for fixed navbar on landing pages */}
      <div className="h-16 md:h-[72px]" />
    </>
  )
}
