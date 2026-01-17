'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to view this page.')
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        toast.error('Could not fetch profile.')
        console.error(error)
      } else if (profile) {
        setFullName(profile.full_name || '')
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase, router])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    if (!user) {
      toast.error('No user found.')
      return
    }

    setLoading(true)
    toast.loading('Saving profile...')

    let publicAvatarUrl = avatarUrl

    if (avatarFile) {
      const filePath = `${user.id}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        toast.dismiss()
        toast.error(`Error uploading avatar: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

      publicAvatarUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: publicAvatarUrl,
      })
      .select()

    toast.dismiss()

    if (profileError) {
      toast.error(`Error updating profile: ${profileError.message}`)
    } else {
      setAvatarUrl(publicAvatarUrl)
      toast.success('Profile updated successfully!')
    }
    setLoading(false)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-light-textSecondary dark:text-dark-textSecondary">
        Loading Account...
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-center mb-8">Your Account</h1>
      <form
        onSubmit={handleUpdateProfile}
        className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg border border-light-border dark:border-dark-border"
      >
        {avatarUrl && (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-light-background dark:bg-dark-background">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="avatar">
            Update Profile Picture
          </label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-light-primaryButton file:text-light-buttonText dark:file:bg-dark-primaryButton dark:file:text-dark-buttonText"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2.5 px-4 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

