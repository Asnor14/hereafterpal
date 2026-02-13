'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, Heart, Search } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import MemorialCard from '@/components/MemorialCard'
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

function MemorialsContent() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [memorials, setMemorials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

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
            }
            setLoading(false)
        }
        fetchUserAndMemorials()
    }, [supabase])

    // Handle memorial deletion
    const handleDeleteMemorial = (deletedId: string) => {
        setMemorials(prev => prev.filter(m => m.id !== deletedId))
    }

    // Filter memorials by search query
    const filteredMemorials = memorials.filter(memorial =>
        memorial.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="dashboard-content">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                    All Memorials
                </h1>
                <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    View and manage all your memorials
                </p>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-memorial-textSecondary dark:text-memorialDark-textSecondary pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search memorials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-memorial bg-memorial-surface dark:bg-memorialDark-surface border border-memorial-border dark:border-memorialDark-border text-memorial-text dark:text-memorialDark-text placeholder:text-memorial-textTertiary dark:placeholder:text-memorialDark-textTertiary focus:border-memorial-accent dark:focus:border-memorialDark-accent focus:outline-none focus:ring-2 focus:ring-memorial-accent/20 dark:focus:ring-memorialDark-accent/20 transition-all"
                    />
                </div>
                <Link
                    href="/create-memorial"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-6"
                >
                    <Plus size={18} />
                    Create Memorial
                </Link>
            </div>

            {/* Memorials Grid */}
            {loading ? (
                <div className="memorial-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <MemorialCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredMemorials.length > 0 ? (
                <div className="memorial-grid">
                    {filteredMemorials.map((memorial, index) => (
                        <motion.div
                            key={memorial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MemorialCard
                                memorial={memorial}
                                onDelete={handleDeleteMemorial}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : searchQuery ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 memorial-card"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
                        <Search size={28} className="text-memorial-accent dark:text-memorialDark-accent" />
                    </div>
                    <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                        No Results Found
                    </h3>
                    <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary max-w-sm mx-auto">
                        No memorials match "{searchQuery}". Try a different search term.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
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
    )
}

export default function MemorialsPage() {
    return (
        <DashboardLayout>
            <MemorialsContent />
        </DashboardLayout>
    )
}
