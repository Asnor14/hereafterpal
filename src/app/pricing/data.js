export const pricingPlans = [
  {
    planKey: 'free', // Add this
    planName: 'Free Trial',
    price: '₱0',
    frequency: 'one-time',
    description: 'Experience Hereafter, Pal with no commitment.',
    features: [
      'Create 1 Memorial',
      'Memorial is Private',
      'No AI Voice',
    ],
    isBestValue: false,
  },
  {
    planKey: 'legacy', // Add this
    planName: 'The Legacy',
    price: '₱299',
    frequency: 'per month',
    description: 'A lasting tribute to your loved one.',
    features: [
      'Create 3 Memorials',
      'Publish Memorials Publicly',
      'AI Voice Enabled',
      'Full support',
    ],
    isBestValue: true,
  },
  {
    planKey: 'evermore', // Add this
    planName: 'The Evermore',
    price: '₱3,499',
    frequency: 'per year',
    description: 'A premium, lasting tribute.',
    features: [
      'Unlimited Memorials',
      'Publish Memorials Publicly',
      'AI Voice Enabled',
      'Priority support',
    ],
    isBestValue: false,
  },
]

