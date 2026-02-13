'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, Heart, Eye, MessageSquare, Image, Upload, Mail } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import WelcomeBanner from '@/components/WelcomeBanner'
import QuickActionCard from '@/components/QuickActionCard'
import MemorialCard from '@/components/MemorialCard'
import StatsCard from '@/components/StatsCard'
import ActivityFeed from '@/components/ActivityFeed'
import type { User } from '@supabase/supabase-js'

// Skeleton component for loading state
function MemorialCardSkeleton() {
  return (
    <div className="memorial-card overflow-hidden">
      <div className="h-40 md:h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/2 skeleton rounded" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-9 skeleton rounded" />
          <div className="w-9 h-9 skeleton rounded" />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {action && <div className="section-action">{action}</div>}
    </div>
  )
}

function DashboardContent() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [memorials, setMemorials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMemorials: 0,
    totalViews: 0,
    totalMessages: 0,
    totalPhotos: 0,
  })

  useEffect(() => {
    const fetchUserAndMemorials = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from('memorials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Could not fetch memorials.')
      } else {
        setMemorials(data || [])
        setStats({
          totalMemorials: data?.length || 0,
          totalViews: 0, // Placeholder
          totalMessages: 0, // Placeholder
          totalPhotos: 0, // Placeholder
        })
      }
      setLoading(false)
    }
    fetchUserAndMemorials()
  }, [supabase])

  return (
    <div className="dashboard-home">
      {/* Welcome Banner */}
      <WelcomeBanner user={user} memorialCount={stats.totalMemorials} />

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <QuickActionCard
          icon={Plus}
          title="Create Memorial"
          description="Start a new tribute"
          href="/create-memorial"
          variant="primary"
        />
        <QuickActionCard
          icon={Upload}
          title="Add Photos"
          description="Upload to Memory Lane"
        />
        <QuickActionCard
          icon={Mail}
          title="Invite Friends"
          description="Share a memorial link"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Heart}
          label="Memorials"
          value={loading ? '—' : stats.totalMemorials}
        />
        <StatsCard
          icon={Eye}
          label="Total Views"
          value={loading ? '—' : stats.totalViews}
        />
        <StatsCard
          icon={MessageSquare}
          label="Messages"
          value={loading ? '—' : stats.totalMessages}
        />
        <StatsCard
          icon={Image}
          label="Photos"
          value={loading ? '—' : stats.totalPhotos}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Memorials List */}
        <div className="lg:col-span-2">
          <SectionHeader title="Your Memorials" />

          {/* Memorials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[1, 2].map((i) => (
                <MemorialCardSkeleton key={i} />
              ))}
            </div>
          ) : memorials.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
            >
              {memorials.map((memorial, index) => (
                <motion.div
                  key={memorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MemorialCard
                    memorial={memorial}
                    onDelete={(id) => {
                      setMemorials(prev => prev.filter(m => m.id !== id));
                      setStats(prev => ({ ...prev, totalMemorials: prev.totalMemorials - 1 }));
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 memorial-card"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
                <Heart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
              </div>
              <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                No Memorials Yet
              </h3>
              <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6 max-w-sm mx-auto">
                Create your first memorial to honor someone special.
              </p>
              <Link href="/create-memorial" className="btn-primary inline-flex items-center gap-2">
                <Plus size={18} />
                Create Your First Memorial
              </Link>
            </motion.div>
          )}
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-1">
          <SectionHeader title="Recent Activity" />
          <div className="memorial-card p-4">
            <ActivityFeed memorialIds={memorials.map(m => m.id)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
