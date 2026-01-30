'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, Heart, Eye, Users } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import MemorialCard from '@/components/MemorialCard'
import StatsCard from '@/components/StatsCard'

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

function DashboardContent() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [memorials, setMemorials] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMemorials: 0,
    totalVisitors: 0,
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
          totalVisitors: 0, // Placeholder - would need analytics
        })
      }
      setLoading(false)
    }
    fetchUserAndMemorials()
  }, [supabase])

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif text-memorial-text dark:text-memorialDark-text">
          Welcome Back
        </h1>
        <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-1">
          Manage your memorials and honor your loved ones.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon={Heart}
          label="Total Memorials"
          value={loading ? '—' : stats.totalMemorials}
        />
        <StatsCard
          icon={Eye}
          label="Total Views"
          value={loading ? '—' : stats.totalVisitors}
        />
        <StatsCard
          icon={Users}
          label="Guestbook Messages"
          value={loading ? '—' : '0'}
        />
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">
          Your Memorials
        </h2>
        <Link href="/create-memorial" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">Create Memorial</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Memorials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <MemorialCardSkeleton key={i} />
          ))}
        </div>
      ) : memorials.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {memorials.map((memorial, index) => (
            <motion.div
              key={memorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MemorialCard memorial={memorial} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 memorial-card"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
            <Heart size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
          </div>
          <h3 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
            No Memorials Yet
          </h3>
          <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6 max-w-sm mx-auto">
            Create your first memorial to honor and celebrate the life of someone special.
          </p>
          <Link href="/create-memorial" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Create Your First Memorial
          </Link>
        </motion.div>
      )}
    </>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
