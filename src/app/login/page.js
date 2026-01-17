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
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      toast.dismiss()
      toast.error(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleAuthAction = async (e) => {
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
      toast.error(`Error: ${error.message}`)
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
      <h1 className="text-3xl font-semibold text-center mb-8">
        {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
      </h1>
      <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border font-medium py-2.5 px-4 rounded-lg mb-4 hover:bg-light-background dark:hover:bg-dark-background disabled:opacity-50"
        >
          <Check size={18} />
          Sign in with Google
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-light-border dark:border-dark-border"></div>
          <span className="mx-4 text-sm text-light-textSecondary dark:text-dark-textSecondary">OR</span>
          <div className="flex-grow border-t border-light-border dark:border-dark-border"></div>
        </div>
        <form onSubmit={handleAuthAction}>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1" htmlFor="role">
                    Your Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pr-10 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-light-textSecondary dark:text-dark-textSecondary"
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
                <div className="mb-6 relative">
                  <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 pr-10 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2.5 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-light-accent dark:text-dark-accent hover:underline"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

