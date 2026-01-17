'use client'
import { pricingPlans } from './data'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const [user, setUser] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSelectPlan = async (planKey) => {
    if (!user) {
      toast.error('Please log in to select a plan.')
      router.push('/login')
      return
    }

    setLoadingPlan(planKey)
    const toastId = toast.loading('Redirecting to payment...')

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, userId: user.id }),
      })
      
      const { checkoutUrl, error } = await response.json()

      if (error) throw new Error(error)

      // Redirect to PayMongo
      window.location.href = checkoutUrl

    } catch (error) {
      toast.dismiss(toastId)
      toast.error(error.message)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold">Choose your pricing plan</h1>
        <p className="text-lg mt-2 text-light-textSecondary dark:text-dark-textSecondary">
          Select the plan that best honors your loved one's memory.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.planName}
            className={`relative flex flex-col bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border ${
              plan.isBestValue
                ? 'border-amber-500'
                : 'border-light-border dark:border-dark-border'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* ... (rest of the plan UI is the same) ... */}
            <h3 className="text-xl font-semibold mb-1">{plan.planName}</h3>
            <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-4">
              {plan.description}
            </p>
            <div className="mb-4">
              <span className="text-4xl font-semibold">{plan.price}</span>
              <span className="text-light-textSecondary dark:text-dark-textSecondary">
                /{plan.frequency}
              </span>
            </div>
            <ul className="flex-grow space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-light-textSecondary dark:text-dark-textSecondary">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            {/* --- NEW BUTTON LOGIC --- */}
            {plan.planKey === 'free' ? (
              <button
                disabled
                className="w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border font-medium py-2 px-4 rounded-lg opacity-50"
              >
                Your Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleSelectPlan(plan.planKey)}
                disabled={loadingPlan === plan.planKey}
                className="w-full bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {loadingPlan === plan.planKey ? 'Redirecting...' : 'Select Plan'}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

