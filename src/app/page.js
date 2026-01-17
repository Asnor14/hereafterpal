'use client';

import { motion } from 'framer-motion';
import { Heart, Camera, BookOpen, Shield, Clock, Sparkles } from 'lucide-react';
import MemorialHomeLanding from '@/components/MemorialHomeLanding';
import QuickActions from '@/components/QuickActions';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { navigateToCreateMemorial } = useAuth();
  const features = [
    {
      icon: Heart,
      title: 'Preserve Memories',
      description: 'Create a lasting tribute with photos, stories, and cherished moments that celebrate a life well lived.',
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Control who can view and contribute to the memorial with privacy settings and password protection.',
    },
    {
      icon: Clock,
      title: 'Forever Accessible',
      description: 'Memorials are preserved indefinitely, accessible anytime, anywhere, for generations to come.',
    },
    {
      icon: Sparkles,
      title: 'Beautiful Design',
      description: 'Elegant, respectful design that honors your loved one with dignity and creates a peaceful space for remembrance.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Memorial',
      description: 'Begin by adding your loved one\'s name, dates, and a meaningful photo.',
    },
    {
      number: '02',
      title: 'Add Memories',
      description: 'Upload photos, write their life story, and add important milestones.',
    },
    {
      number: '03',
      title: 'Invite Others',
      description: 'Share the memorial link with family and friends to contribute messages.',
    },
    {
      number: '04',
      title: 'Cherish Forever',
      description: 'Visit anytime to remember, reflect, and keep their memory alive.',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Landing */}
      <MemorialHomeLanding />

      {/* Quick Actions Section */}
      <section id="explore" className="py-16 md:py-24 px-4 bg-memorial-surface dark:bg-memorialDark-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
              Begin Your Journey
            </h2>
            <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
              Choose how you'd like to remember and honor your loved one
            </p>
          </motion.div>

          <QuickActions />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-memorial-bg dark:bg-memorialDark-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
              A Peaceful Space for Remembrance
            </h2>
            <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
              Everything you need to create a beautiful, lasting tribute
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="memorial-card p-6 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-gold/10 dark:bg-memorialDark-gold/10 flex items-center justify-center">
                    <Icon size={28} className="text-memorial-gold dark:text-memorialDark-gold" />
                  </div>
                  <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 bg-memorial-surface dark:bg-memorialDark-surface">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
              Simple Steps to Honor a Life
            </h2>
            <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
              Creating a memorial is easy and meaningful
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-memorial-gold/10 dark:bg-memorialDark-gold/10 flex items-center justify-center border-2 border-memorial-gold dark:border-memorialDark-gold">
                    <span className="text-2xl font-serif font-bold text-memorial-gold dark:text-memorialDark-gold">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12 md:mt-16"
          >
            <button
              onClick={navigateToCreateMemorial}
              className="inline-block px-10 py-4 bg-memorial-gold dark:bg-memorialDark-gold text-white rounded-memorial hover:opacity-90 transition-all duration-300 font-medium text-lg shadow-memorial hover:shadow-memorial-lg active:scale-98"
            >
              Create Your Memorial Today
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-memorial-bg dark:bg-memorialDark-bg border-t border-memorial-divider dark:border-memorialDark-divider">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-memorial-text dark:text-memorialDark-text mb-6">
              Celebrate Their Legacy
            </h2>
            <p className="text-lg md:text-xl text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Create a beautiful, lasting memorial that honors their life, preserves their story, and keeps their memory alive for generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={navigateToCreateMemorial}
                className="px-8 py-4 bg-memorial-gold dark:bg-memorialDark-gold text-white rounded-memorial hover:opacity-90 transition-all duration-300 font-medium text-lg min-h-touch min-w-[200px] flex items-center justify-center shadow-memorial hover:shadow-memorial-lg"
              >
                Get Started Free
              </button>
              <Link
                href="/about"
                className="px-8 py-4 bg-transparent border-2 border-memorial-divider dark:border-memorialDark-divider text-memorial-text dark:text-memorialDark-text rounded-memorial hover:border-memorial-gold dark:hover:border-memorialDark-gold transition-all duration-300 font-medium text-lg min-h-touch min-w-[200px] flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
