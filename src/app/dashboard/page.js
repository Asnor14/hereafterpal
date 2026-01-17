'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Pencil, Eye } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [memorials, setMemorials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndMemorials = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in.')
        router.push('/login')
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
        setMemorials(data)
      }
      setLoading(false)
    }
    fetchUserAndMemorials()
  }, [supabase, router])

  if (loading) {
    return <div className="text-center py-16">Loading Dashboard...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Your Memorials</h1>
        <Link
          href="/create-memorial"
          className="flex items-center gap-2 bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2 px-4 rounded-lg transition-transform hover:scale-105"
        >
          <Plus size={20} />
          Create New
        </Link>
      </div>
      <div className="space-y-4">
        {memorials.length > 0 ? (
          memorials.map((memorial) => (
            <div
              key={memorial.id}
              className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow-lg border border-light-border dark:border-dark-border flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{memorial.name}</h2>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {memorial.service_type === 'PAWS' ? 'Pet Memorial' : 'Human Memorial'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/memorial/${memorial.id}/edit`}
                  className="p-2 rounded-lg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 text-light-accent dark:text-dark-accent transition-colors"
                  title="Edit Memorial"
                >
                  <Pencil size={20} />
                </Link>
                <Link
                  href={`/memorial/${memorial.id}`}
                  className="p-2 rounded-lg hover:bg-light-text/10 dark:hover:bg-dark-text/10 transition-colors"
                  title="View Public Page"
                >
                  <Eye size={20} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-2xl">
            <h3 className="text-xl">You haven't created any memorials yet.</h3>
            <p className="text-light-textSecondary dark:text-dark-textSecondary mt-2">
              Click "Create New" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

