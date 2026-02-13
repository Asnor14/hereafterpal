'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-center mb-8">About Hereafter, Pal</h1>
        <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <Image
            src="/placeholder-pet.jpg"
            alt="About us"
            fill
            className="object-cover opacity-70"
            priority
          />
        </div>
        <div className="space-y-4 text-light-textSecondary dark:text-dark-textSecondary">
          <p>
            Welcome to Hereafter, Pal. We believe that every life, whether human or animal, is a story worth telling and preserving. In a world that moves quickly, taking a moment to honor and remember those who have passed is more important than ever.
          </p>
          <p>
            Our mission is to provide a beautiful, respectful, and private space for you to build a digital memorial. A place where you can gather photos, share stories, hear their voice again through AI, and collect "Letters of Love" from friends and family around the world.
          </p>
          <p>
            This project was born from a place of love and loss, and it is our honor to help you celebrate the legacy of those you hold dear.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

