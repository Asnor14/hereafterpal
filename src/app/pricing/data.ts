export interface PricingPlan {
  planKey: string
  planName: string
  subtitle?: string
  price: string
  priceAnnual?: string
  frequency: string
  frequencyAnnual?: string
  description: string
  features: string[]
  badge: string | null
  isBestValue: boolean
  savings?: string
  icon?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    planKey: 'free',
    planName: 'Free Trial',
    price: '₱0',
    frequency: 'preview',
    description: 'Experience Hereafter, Pal before committing.',
    features: [
      'Create 1 Memorial Preview',
      'Explore all features',
      'Memorial is private only',
      'Limited storage',
    ],
    badge: 'Preview Only',
    isBestValue: false,
  },
  {
    planKey: 'eternal_echo',
    planName: 'Eternal Echo',
    subtitle: 'Human Memorials',
    price: '₱399',
    priceAnnual: '₱3,499',
    frequency: 'month',
    frequencyAnnual: 'year',
    description: 'A lasting tribute to honor your loved ones.',
    features: [
      'Full access to Memory Lane',
      'Full access to Letters of Love',
      'Full access to Pick-A-Mood AI Voice',
      'Unlimited photo uploads',
      'Publish memorials publicly',
      'Priority support',
    ],
    badge: 'Most Popular',
    isBestValue: true,
    savings: '₱1,289 saved annually',
  },
  {
    planKey: 'paws',
    planName: 'Paws But Not Forgotten',
    subtitle: 'Pet Memorials',
    price: '₱299',
    priceAnnual: '₱2,499',
    frequency: 'month',
    frequencyAnnual: 'year',
    description: 'A heartwarming tribute for your beloved pets.',
    features: [
      'Full access to Memory Lane',
      'Full access to Letters of Love',
      'Full access to Pick-A-Mood AI Voice',
      'Unlimited photo uploads',
      'Pet-themed memorial templates',
      'Standard support',
    ],
    badge: null,
    isBestValue: false,
    savings: '₱1,089 saved annually',
    icon: '🐾',
  },
]
