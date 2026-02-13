'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Mail, Camera, Save, Shield, Bell, CreditCard } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import type { User as SupabaseUser } from '@supabase/supabase-js'

function AccountContent() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

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
        console.error(error)
      } else if (profile) {
        setFullName(profile.full_name || '')
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase, router])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast.error('No user found.')
      return
    }

    setSaving(true)
    const loadingToast = toast.loading('Saving profile...')

    let publicAvatarUrl = avatarUrl

    if (avatarFile) {
      const filePath = `${user.id}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        toast.dismiss(loadingToast)
        toast.error(`Error uploading avatar: ${uploadError.message}`)
        setSaving(false)
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

    toast.dismiss(loadingToast)

    if (profileError) {
      toast.error(`Error updating profile: ${profileError.message}`)
    } else {
      setAvatarUrl(publicAvatarUrl)
      toast.success('Profile updated successfully!')
    }
    setSaving(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="account-page">
      {/* Page Header */}
      <div className="account-header">
        <h1 className="account-title">Account Settings</h1>
        <p className="account-subtitle">Manage your profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="account-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`account-tab ${activeTab === tab.id ? 'account-tab-active' : ''}`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="account-content">
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="account-form">
            {/* Avatar Section */}
            <div className="account-avatar-section">
              <div className="account-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="account-avatar-img" />
                ) : (
                  <span className="account-avatar-placeholder">
                    {getInitials(user?.email)}
                  </span>
                )}
                <label htmlFor="avatar-upload" className="account-avatar-edit">
                  <Camera size={16} />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="account-avatar-info">
                <h3 className="text-lg font-medium text-memorial-text dark:text-memorialDark-text">
                  Profile Photo
                </h3>
                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                  Click the camera icon to upload a new photo
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="account-form-grid">
              <div className="account-form-field">
                <label htmlFor="email" className="account-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  className="input-memorial opacity-60 cursor-not-allowed"
                  disabled
                />
                <p className="account-field-hint">Email cannot be changed</p>
              </div>

              <div className="account-form-field">
                <label htmlFor="fullName" className="account-label">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-memorial"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="account-form-actions">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="account-placeholder">
            <Shield size={48} className="text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
            <h3>Security Settings</h3>
            <p>Password and security options coming soon</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="account-placeholder">
            <Bell size={48} className="text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
            <h3>Notification Preferences</h3>
            <p>Email and push notification settings coming soon</p>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="account-placeholder">
            <CreditCard size={48} className="text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
            <h3>Billing & Subscription</h3>
            <p>Manage your subscription and payment methods coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <DashboardLayout>
      <AccountContent />
    </DashboardLayout>
  )
}
