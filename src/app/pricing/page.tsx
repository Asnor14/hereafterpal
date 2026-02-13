'use client'
import { pricingPlans } from './data'
import { Check, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSelectPlan = async (planKey: string) => {
    if (!user) {
      toast.error('Please log in to select a plan.')
      router.push('/login')
      return
    }

    if (planKey === 'free') {
      router.push('/create-memorial')
    } else {
      router.push(`/checkout?plan=${planKey}&billing=${billingCycle}`)
    }
  }

  return (
    <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
            Select the plan that best honors your loved one's memory. All plans include our core features.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="tab-nav">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`tab-item ${billingCycle === 'monthly' ? 'tab-item-active' : ''}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`tab-item ${billingCycle === 'annual' ? 'tab-item-active' : ''}`}
            >
              Annual
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Save up to 30%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.planKey}
              className={`pricing-card ${plan.isBestValue ? 'pricing-card-popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.isBestValue ? 'badge-popular' : 'badge-preview'}`}>
                  {plan.isBestValue && <Sparkles size={12} className="mr-1" />}
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">
                  {plan.icon && <span className="mr-2">{plan.icon}</span>}
                  {plan.planName}
                </h3>
                {plan.subtitle && (
                  <p className="text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                    {plan.subtitle}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-memorial-text dark:text-memorialDark-text">
                    {billingCycle === 'annual' && plan.priceAnnual ? plan.priceAnnual : plan.price}
                  </span>
                  <span className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    /{billingCycle === 'annual' && plan.frequencyAnnual ? plan.frequencyAnnual : plan.frequency}
                  </span>
                </div>
                {billingCycle === 'annual' && plan.savings && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {plan.savings}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary text-sm mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="flex-grow space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.planKey === 'free' ? (
                <button
                  onClick={() => handleSelectPlan('free')}
                  className="btn-ghost w-full"
                >
                  Start Free Preview
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.planKey)}
                  className={`w-full ${plan.isBestValue ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Get Started
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-16 md:mt-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
            Questions? Contact us at{' '}
            <a href="mailto:support@hereafterpal.com" className="text-memorial-accent dark:text-memorialDark-accent underline">
              support@hereafterpal.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
