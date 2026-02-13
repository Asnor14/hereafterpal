'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Check, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Family')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    toast.loading('Redirecting to Google...')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) {
      toast.dismiss()
      toast.error(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const operation = isSignUp ? 'Signing Up...' : 'Signing In...'
    const loadingToast = toast.loading(operation)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (!fullName) {
          throw new Error('Please enter your full name')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        })
        if (error) throw error

        toast.dismiss(loadingToast)
        toast.success('Sign up successful! Please check your email to confirm.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        toast.dismiss(loadingToast)
        toast.success('Signed in successfully!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(`Error: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const fieldVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3 } },
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif font-semibold text-center mb-8 text-memorial-text dark:text-memorialDark-text">
        {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
      </h1>
      <div className="memorial-card p-8">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 btn-ghost mb-4 disabled:opacity-50"
        >
          <Check size={18} />
          Sign in with Google
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-memorial-divider dark:border-memorialDark-divider"></div>
          <span className="mx-4 text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">OR</span>
          <div className="flex-grow border-t border-memorial-divider dark:border-memorialDark-divider"></div>
        </div>
        <form onSubmit={handleAuthAction} className="space-y-4">
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                layout
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-memorial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="role">
                    Your Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="select-memorial w-full"
                  >
                    <option value="Family">Family</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-memorial"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-memorial pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-memorial-textSecondary dark:text-memorialDark-textSecondary"
              aria-label="Show or hide password"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                layout
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden"
              >
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-memorial pr-10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-memorial-accent dark:text-memorialDark-accent hover:underline"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

