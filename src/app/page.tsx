'use client';

import { motion } from 'framer-motion';
import { Heart, Camera, BookOpen, Shield, Clock, Sparkles, Image, Mail, Volume2 } from 'lucide-react';
import MemorialHomeLanding from '@/components/MemorialHomeLanding';
import QuickActions from '@/components/QuickActions';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { navigateToCreateMemorial } = useAuth();

  // Core features with new icons
  const features = [
    {
      icon: Image,
      title: 'Memory Lane',
      description: 'A visual gallery to preserve precious photos and moments that tell their story.',
    },
    {
      icon: Mail,
      title: 'Letters of Love',
      description: 'A heartfelt guestbook where family and friends can share tributes and memories.',
    },
    {
      icon: Volume2,
      title: 'Pick-A-Mood',
      description: 'AI-powered voice tributes that bring comfort and connection through personalized audio messages.',
    },
    {
      icon: Shield,
      title: 'Forever Preserved',
      description: 'Your memorial is safely stored and accessible anytime, anywhere, for generations.',
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
              Everything You Need to Honor a Life
            </h2>
            <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-2xl mx-auto">
              Beautiful features designed with care and respect
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
                    <Icon size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
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
                  <div className="w-16 h-16 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center border-2 border-memorial-accent dark:border-memorialDark-accent">
                    <span className="text-2xl font-serif font-bold text-memorial-accent dark:text-memorialDark-accent">
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
              className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
            >
              Create Your Memorial Today
            </button>
          </motion.div>
        </div>
      </section>

      {/* Free Tier CTA */}
      <section className="py-20 px-4 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-memorial-text dark:text-memorialDark-text mb-6">
            Start with our Free Tier
          </h2>
          <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-8 max-w-2xl mx-auto">
            Create a beautiful memorial for your loved one at no cost. Utilize our basic features to preserve their memory essentially forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create-memorial"
              className="px-8 py-4 rounded-full bg-memorial-accent dark:bg-memorialDark-accent text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-memorial-accent/20 dark:shadow-memorialDark-accent/20 text-lg"
            >
              Create Free Memorial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full border border-memorial-border dark:border-memorialDark-border bg-white dark:bg-memorialDark-surface text-memorial-text dark:text-memorialDark-text font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
            >
              View All Plans
            </Link>
          </div>
          <p className="mt-6 text-sm text-memorial-textTertiary dark:text-memorialDark-textTertiary">
            No credit card required for free plan. Upgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 md:py-24 px-4 bg-memorial-bg dark:bg-memorialDark-bg border-t border-memorial-borderLight dark:border-memorialDark-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
              Plans for Every Need
            </h2>
            <p className="text-lg text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-8 max-w-2xl mx-auto">
              Start with a free preview, then choose the plan that's right for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-3 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                <span className="font-serif font-semibold text-memorial-text dark:text-memorialDark-text">Eternal Echo</span>
                <span>— Human Memorials</span>
              </div>
              <span className="hidden sm:block text-memorial-divider">|</span>
              <div className="flex items-center gap-3 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                <span className="font-serif font-semibold text-memorial-text dark:text-memorialDark-text">🐾 Paws But Not Forgotten</span>
                <span>— Pet Memorials</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="btn-primary inline-flex items-center gap-2"
            >
              View All Plans
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-memorial-surface dark:bg-memorialDark-surface">
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
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                Get Started Free
              </button>
              <Link
                href="/about"
                className="btn-ghost inline-flex items-center gap-2 text-lg px-8 py-4"
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
