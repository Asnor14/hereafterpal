'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const services = [
  {
    title: 'ETERNAL ECHO',
    description:
      'Create a meaningful tribute with a custom website, photo gallery, AI voice, and Letters of Love.',
    imageUrl: '/placeholder-human.jpg',
  },
  {
    title: 'PAWS BUT NOT FORGOTTEN',
    description:
      'Celebrate your beloved pet with a personalized website, photo gallery, Letters of Love, and support.',
    imageUrl: '/placeholder-pet.jpg',
  },
]

export function ServiceCards() {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {services.map((service, index) => (
        <motion.div
          key={service.title}
          className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden border border-light-border dark:border-dark-border"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <div className="relative w-full h-48 bg-light-background dark:bg-dark-background">
            <Image
              src={service.imageUrl}
              alt={service.title}
              fill
              className="object-cover opacity-70"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
              {service.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

