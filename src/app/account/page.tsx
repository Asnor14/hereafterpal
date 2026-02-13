'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Mail, Camera, Save, Shield, Bell, CreditCard, Crown, Calendar, RefreshCw, Zap, Clock, Check, ArrowRight } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { pricingPlans } from '@/app/pricing/data'

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
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)

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

  // Fetch subscriptions when billing tab is opened
  useEffect(() => {
    if (activeTab === 'billing' && user) {
      fetchSubscriptions(user.id)
    }
  }, [activeTab, user])

  const fetchSubscriptions = async (uid: string) => {
    setLoadingSubs(true)
    try {
      const res = await fetch(`/api/subscriptions?user_id=${uid}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setSubscriptions(data)
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
    } finally {
      setLoadingSubs(false)
    }
  }

  const getSubProgress = (sub: any) => {
    if (!sub?.start_date || !sub?.end_date) return { daysLeft: 0, totalDays: 0, pct: 0 }
    const now = new Date()
    const start = new Date(sub.start_date)
    const end = new Date(sub.end_date)
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
    const pct = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))
    return { daysLeft, totalDays, pct }
  }

  const activeSubs = subscriptions.filter(s => s.status === 'active')
  const pendingSubs = subscriptions.filter(s => s.status === 'pending')
  const ownedPlanKeys = subscriptions.map(s => s.plan)
  const availablePlans = pricingPlans.filter(p => p.planKey !== 'free' && !ownedPlanKeys.includes(p.planKey))

  const getPlanDisplayName = (key: string) => {
    const found = pricingPlans.find(p => p.planKey === key)
    return found?.planName || key
  }

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
          <div className="space-y-6">
            {loadingSubs ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner" />
              </div>
            ) : (
              <>
                {/* Active Subscriptions */}
                {activeSubs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text flex items-center gap-2">
                      <Crown size={20} className="text-amber-500" />
                      Your Active Plans
                    </h3>
                    {activeSubs.map((sub) => {
                      const progress = getSubProgress(sub)
                      const planInfo = pricingPlans.find(p => p.planKey === sub.plan)
                      return (
                        <div key={sub.id} className="rounded-xl border-2 border-amber-400/50 dark:border-amber-600/50 bg-amber-50/50 dark:bg-amber-900/10 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl font-bold text-memorial-text dark:text-memorialDark-text">
                                  {getPlanDisplayName(sub.plan)}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                  ● Active
                                </span>
                              </div>
                              {planInfo && (
                                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                  {planInfo.description}
                                </p>
                              )}
                              {planInfo && (
                                <div className="mt-2 text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                  <span className="font-semibold text-memorial-accent">{planInfo.price}</span> / {planInfo.frequency}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/checkout?plan=${sub.plan}&billing=monthly`}
                                className="flex items-center gap-1.5 px-4 py-2 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-all text-sm font-medium"
                              >
                                <RefreshCw size={14} />
                                Renew / Extend
                              </Link>
                            </div>
                          </div>

                          {/* Features */}
                          {planInfo && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                              {planInfo.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                  <Check size={12} className="text-green-500 flex-shrink-0" />
                                  {f}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Progress Bar */}
                          {sub.end_date && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary flex items-center gap-1">
                                  <Calendar size={12} />
                                  Subscription Period
                                </span>
                                <span className={`text-xs font-bold ${progress.daysLeft <= 7 ? 'text-red-500' : progress.daysLeft <= 14 ? 'text-yellow-500' : 'text-green-500'
                                  }`}>
                                  {progress.daysLeft > 0 ? `${progress.daysLeft} days left` : 'Expired'}
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${progress.daysLeft <= 7
                                      ? 'bg-gradient-to-r from-red-400 to-red-600'
                                      : progress.daysLeft <= 14
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                        : 'bg-gradient-to-r from-amber-400 to-amber-600'
                                    }`}
                                  style={{ width: `${100 - progress.pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-[10px] text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                                <span>{new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>{new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>

                              {progress.daysLeft > 0 && progress.daysLeft <= 7 && (
                                <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
                                  <Clock size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-red-700 dark:text-red-300">
                                    Expiring in {progress.daysLeft} day{progress.daysLeft !== 1 ? 's' : ''}! Renew now to keep your features.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Pending Subscriptions */}
                {pendingSubs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text flex items-center gap-2">
                      <Clock size={20} className="text-yellow-500" />
                      Pending Approval
                    </h3>
                    {pendingSubs.map((sub) => (
                      <div key={sub.id} className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10 p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-memorial-text dark:text-memorialDark-text">
                            {getPlanDisplayName(sub.plan)}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                            Waiting for admin approval
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Active Plans */}
                {activeSubs.length === 0 && pendingSubs.length === 0 && (
                  <div className="rounded-xl border border-memorial-borderLight dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface p-6 text-center">
                    <CreditCard size={40} className="mx-auto mb-3 text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
                    <h3 className="text-lg font-medium text-memorial-text dark:text-memorialDark-text mb-1">Free Plan</h3>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-4">
                      You're on the free preview. Upgrade to unlock full features.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-all font-medium"
                    >
                      <Zap size={16} />
                      View Plans
                    </Link>
                  </div>
                )}

                {/* Available Plans to Purchase */}
                {availablePlans.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-memorial-text dark:text-memorialDark-text">
                      {activeSubs.length > 0 ? 'Add Another Plan' : 'Available Plans'}
                    </h3>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                      {activeSubs.length > 0
                        ? 'You can purchase additional plans to unlock more memorial types.'
                        : 'Choose a plan to get started.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availablePlans.map((p) => (
                        <div
                          key={p.planKey}
                          className="rounded-xl border border-memorial-borderLight dark:border-memorialDark-border bg-memorial-surface dark:bg-memorialDark-surface p-5 flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-memorial-text dark:text-memorialDark-text">
                                {p.icon && <span className="mr-1">{p.icon}</span>}
                                {p.planName}
                              </h4>
                              {p.subtitle && (
                                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary">{p.subtitle}</p>
                              )}
                            </div>
                            {p.isBestValue && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-memorial-accent text-white">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-3">
                            {p.description}
                          </p>
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-memorial-accent">{p.price}</span>
                            <span className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary"> / {p.frequency}</span>
                          </div>
                          <div className="space-y-1.5 mb-4 flex-1">
                            {p.features.slice(0, 4).map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                                <Check size={12} className="text-green-500 flex-shrink-0" />
                                {f}
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/checkout?plan=${p.planKey}&billing=monthly`}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-memorial-accent text-white rounded-lg hover:bg-memorial-accent/90 transition-all text-sm font-medium"
                          >
                            Purchase
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All plans owned */}
                {availablePlans.length === 0 && activeSubs.length > 0 && (
                  <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 p-5 text-center">
                    <Check size={32} className="mx-auto mb-2 text-green-500" />
                    <p className="font-medium text-memorial-text dark:text-memorialDark-text">You have all available plans!</p>
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-1">
                      You're enjoying full access to all memorial types.
                    </p>
                  </div>
                )}
              </>
            )}
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
