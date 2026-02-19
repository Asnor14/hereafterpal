'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CldImage } from 'next-cloudinary'
import toast from 'react-hot-toast'
import { Trash, Check, Lock, Upload, Image as ImageIcon, X, Plus } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { canAccess, getPhotoLimit, isPaidPlan } from '@/lib/planFeatures'
import { processImage } from '@/lib/imageUtils'

interface PendingUpload {
  id: string
  file: File
  preview: string
  caption: string
  status: 'pending' | 'uploading' | 'success' | 'error'
}

export default function EditMemorialPage() {
  const [memorial, setMemorial] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [photos, setPhotos] = useState([])

  const [bio, setBio] = useState('')
  const [familyPassword, setFamilyPassword] = useState('')
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bio')
  const [visibility, setVisibility] = useState('private')
  const [gender, setGender] = useState('female')
  const [verifiedRoles, setVerifiedRoles] = useState<string[]>([])
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [rolePassword, setRolePassword] = useState('')
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [isUploadingBulk, setIsUploadingBulk] = useState(false)

  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const { id: memorialId } = params

  // --- 1. Fetch all data for editing ---
  const fetchAll = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in.')
      router.push('/login')
      return
    }

    // Fetch memorial AND check ownership
    const { data: memorialData, error: memorialError } = await supabase
      .from('memorials')
      .select('*')
      .eq('id', memorialId)
      .eq('user_id', user.id) // IMPORTANT: ONLY OWNERS can edit
      .single()

    if (memorialError || !memorialData) {
      toast.error('Memorial not found or you are not the owner.')
      router.push('/dashboard')
      return
    }
    setMemorial(memorialData)
    setBio(memorialData.bio || '')
    setFamilyPassword(memorialData.family_password || '')
    setVisibility(memorialData.visibility || 'private')
    setGender(memorialData.gender || 'female')

    // Auto-verify creator's own role
    if (memorialData.creator_relationship) {
      setVerifiedRoles([memorialData.creator_relationship])
    }

    // Fetch subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()
    setSubscription(subData)

    // Fetch gallery photos
    const { data: photosData } = await supabase.from('gallery_photos').select('*').eq('memorial_id', memorialId).order('created_at');
    setPhotos(photosData || [])

    // Fetch guestbook letters
    const { data: lettersData } = await supabase.from('guestbook_entries').select('*').eq('memorial_id', memorialId).order('created_at');
    setLetters(lettersData || [])

    setLoading(false)
  }

  useEffect(() => {
    if (memorialId) fetchAll()
  }, [memorialId, supabase, router])

  // --- 2. Handle Bio/Visibility Update ---
  const handleUpdateBio = async (e) => {
    e.preventDefault()

    // Check for publishing
    if (visibility === 'public' && !isPaidPlan(subscription?.plan)) {
      toast.error('You must have a paid plan to make a memorial public.')
      setVisibility('private')
      return
    }

    const toastId = toast.loading('Saving changes...')
    const { error } = await supabase
      .from('memorials')
      .update({
        bio: bio,
        visibility: visibility,
        gender: gender,
        family_password: familyPassword.toUpperCase()
      })
      .eq('id', memorialId)

    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Memorial updated!')
    }
  }

  // --- 3. Handle Gallery Photo Upload Flow ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const limit = getPhotoLimit(subscription?.plan)
    const availableSlots = limit - photos.length - pendingUploads.length

    if (files.length > availableSlots) {
      toast.error(`You can only add ${availableSlots} more photos on your current plan.`)
      return
    }

    const newUploads: PendingUpload[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      status: 'pending'
    }))

    setPendingUploads(prev => [...prev, ...newUploads])
    // Reset input
    e.target.value = ''
  }

  const removePendingUpload = (id: string) => {
    setPendingUploads(prev => {
      const filtered = prev.filter(u => u.id !== id)
      // Cleanup URL
      const removed = prev.find(u => u.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return filtered
    })
  }

  const updatePendingCaption = (id: string, caption: string) => {
    setPendingUploads(prev => prev.map(u => u.id === id ? { ...u, caption } : u))
  }

  const handleBulkUpload = async () => {
    if (pendingUploads.length === 0) return
    setIsUploadingBulk(true)
    const toastId = toast.loading(`Uploading ${pendingUploads.length} photos...`)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Session expired.')
      setIsUploadingBulk(false)
      toast.dismiss(toastId)
      return
    }

    let successCount = 0
    let failCount = 0
    const uploadedPhotos = []

    for (const upload of pendingUploads) {
      try {
        // 1. Compress and convert to WebP
        const compressedBlob = await processImage(upload.file, {
          maxWidth: 1600,
          quality: 0.8,
          format: 'image/webp'
        })

        // 2. Upload to Cloudinary using Unsigned Preset
        const formData = new FormData()
        formData.append('file', compressedBlob)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')
        formData.append('folder', 'memory_lane')

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        if (result.error) throw new Error(result.error.message)

        // 3. Save to Supabase
        const { data: newPhoto, error: dbError } = await supabase
          .from('gallery_photos')
          .insert({
            memorial_id: memorialId,
            user_id: user.id,
            image_url: result.public_id,
            caption: upload.caption || 'Memory'
          })
          .select()
          .single()

        if (dbError) throw dbError

        uploadedPhotos.push(newPhoto)
        successCount++
      } catch (err) {
        console.error('Upload failed:', err)
        failCount++
      }
    }

    setPhotos(prev => [...prev, ...uploadedPhotos])
    setPendingUploads([])
    setIsUploadingBulk(false)
    toast.dismiss(toastId)

    if (failCount === 0) {
      toast.success(`Successfully uploaded ${successCount} photos!`)
    } else {
      toast.error(`Uploaded ${successCount} photos, but ${failCount} failed.`)
    }
  }

  // --- 4. Handle Photo Deletion ---
  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId)
    if (error) {
      toast.error(error.message)
    } else {
      setPhotos(photos.filter(p => p.id !== photoId))
      toast.success('Photo removed.')
    }
    // Cloudinary assets persist, but DB record is removed
  }

  // --- 5. Handle Guestbook Deletion (Moderation) ---
  const handleVerifyRole = (role: string) => {
    if (role === 'Stranger' || !role) return true;
    if (verifiedRoles.includes(role)) return true;

    setPendingRole(role);
    setIsPasswordModalOpen(true);
    return false;
  };

  const handleDeleteLetter = async (letterId: string, role: string) => {
    if (!canAccess(subscription?.plan, 'letters_of_love')) {
      toast.error('Moderating letters requires a paid plan.');
      return;
    }

    if (!handleVerifyRole(role)) {
      toast.error(`Please verify your role to moderate ${role} letters.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this message?')) return

    const { error } = await supabase.from('guestbook_entries').delete().eq('id', letterId)
    if (error) {
      toast.error(error.message)
    } else {
      setLetters(letters.filter(l => l.id !== letterId))
      toast.success('Message removed.')
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPrimaryOwner = memorial?.creator_relationship === pendingRole;
    // For primary owners, we don't need a password check here since they are already checked at login/fetch
    // BUT the user wants the creator NOT to view the other's letters.
    // So if pendingRole is the OTHER role, we check against memorial.family_password

    const otherRole = memorial?.creator_relationship === 'Mom' ? 'Dad' : 'Mom';
    const requiredPassword = pendingRole === otherRole ? memorial?.family_password : null;

    if (pendingRole && (isPrimaryOwner || rolePassword === requiredPassword)) {
      setVerifiedRoles(prev => [...prev, pendingRole]);
      setIsPasswordModalOpen(false);
      setRolePassword('');
      setPendingRole(null);
      toast.success(`Verified for ${pendingRole} moderation!`);
    } else {
      toast.error('Incorrect password or unauthorized role.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-memorial-textSecondary dark:text-memorialDark-textSecondary">
          <div className="loading-spinner mx-auto mb-4" />
          <p>Loading Editor...</p>
        </div>
      </DashboardLayout>
    )
  }

  const isPaid = isPaidPlan(subscription?.plan)

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif font-semibold mb-2 text-memorial-text dark:text-memorialDark-text">Edit: {memorial.name}</h1>
        <Link href={`/memorial/${memorial.id}`} className="text-memorial-accent dark:text-memorialDark-accent underline mb-8 block hover:opacity-80 transition-opacity">
          View Public Page
        </Link>

        {/* --- Tab Navigation --- */}
        <div className="flex border-b border-memorial-border dark:border-memorialDark-border mb-8">
          <button onClick={() => setTab('bio')} className={`py-2 px-4 ${tab === 'bio' ? 'border-b-2 border-memorial-accent dark:border-memorialDark-accent font-semibold text-memorial-text dark:text-memorialDark-text' : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors'}`}>
            Bio & Settings
          </button>
          <button onClick={() => setTab('gallery')} className={`py-2 px-4 ${tab === 'gallery' ? 'border-b-2 border-memorial-accent dark:border-memorialDark-accent font-semibold text-memorial-text dark:text-memorialDark-text' : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors'}`}>
            Memory Lane
          </button>
          <button onClick={() => setTab('letters')} className={`py-2 px-4 ${tab === 'letters' ? 'border-b-2 border-memorial-accent dark:border-memorialDark-accent font-semibold text-memorial-text dark:text-memorialDark-text' : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors'}`}>
            Letters of Love
          </button>
        </div>

        {/* --- Tab Content --- */}
        <div className="bg-memorial-surface dark:bg-memorialDark-surface p-6 rounded-memorial-lg shadow-memorial border border-memorial-border dark:border-memorialDark-border">

          {/* === TAB 1: Bio & Settings === */}
          {tab === 'bio' && (
            <form onSubmit={handleUpdateBio} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="bio">
                  Biography or Tribute
                </label>
                <textarea
                  id="bio"
                  rows={10}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-memorial w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="visibility">
                  Memorial Visibility
                </label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="select-memorial w-full"
                >
                  <option value="private">Private (Only you can see)</option>
                  <option value="public" disabled={!isPaid}>
                    Public (Visible to anyone with the link) {isPaid ? ' (Plan Active)' : ' (Paid Plan Required)'}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="select-memorial w-full"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text" htmlFor="family-key">
                  Family Key (for sharing with Mom/Dad)
                </label>
                <div className="relative">
                  <input
                    id="family-key"
                    type="text"
                    maxLength={6}
                    value={familyPassword}
                    onChange={(e) => setFamilyPassword(e.target.value.toUpperCase())}
                    className="input-memorial w-full font-mono tracking-widest uppercase"
                    placeholder="ENTER6"
                  />
                  <p className="mt-1 text-[11px] text-memorial-textSecondary italic">
                    Share this 6-character key with the other family member to let them join the memorial.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* === TAB 2: Memory Lane === */}
          {tab === 'gallery' && (
            <div>
              {!isPaid && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-memorial flex items-start gap-3">
                  <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">Free Plan Limit</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      You can upload up to 3 photos on the free plan.
                      <Link href="/pricing" className="underline ml-1 font-medium hover:text-yellow-900 dark:hover:text-yellow-300">Upgrade for unlimited photos.</Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Interface */}
              <div className="mb-8 space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-memorial-divider dark:border-memorialDark-divider rounded-memorial p-8 bg-memorial-surfaceAlt/20 hover:bg-memorial-surfaceAlt/40 transition-colors">
                  <input
                    type="file"
                    id="bulk-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploadingBulk}
                  />
                  <label
                    htmlFor="bulk-upload"
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-memorial-accent/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="text-memorial-accent" size={24} />
                    </div>
                    <span className="text-memorial-text dark:text-memorialDark-text font-medium">Click to select photos</span>
                    <span className="text-xs text-memorial-textSecondary mt-1 uppercase tracking-widest">Multi-select supported</span>
                  </label>
                </div>

                {/* Pending Queue */}
                <AnimatePresence>
                  {pendingUploads.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-4 bg-memorial-surfaceAlt/30 p-4 rounded-memorial border border-memorial-border/50"
                    >
                      <div className="flex justify-between items-center px-1">
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-memorial-textSecondary">Pending Uploads ({pendingUploads.length})</h4>
                        <button
                          onClick={handleBulkUpload}
                          disabled={isUploadingBulk}
                          className="btn-primary py-1.5 px-6 text-xs flex items-center gap-2"
                        >
                          {isUploadingBulk ? <div className="loading-spinner w-3 h-3" /> : <Upload size={14} />}
                          {isUploadingBulk ? 'Uploading...' : 'Confirm & Upload All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingUploads.map((upload) => (
                          <div key={upload.id} className="flex gap-4 bg-memorial-surface dark:bg-memorialDark-surface p-3 rounded-memorial border border-memorial-border relative group">
                            <div className="w-20 h-20 relative rounded-sm overflow-hidden shrink-0">
                              <img src={upload.preview} alt="preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <input
                                type="text"
                                placeholder="Add a caption..."
                                value={upload.caption}
                                onChange={(e) => updatePendingCaption(upload.id, e.target.value)}
                                className="input-memorial py-1 text-xs w-full"
                              />
                            </div>
                            <button
                              onClick={() => removePendingUpload(upload.id)}
                              className="absolute -top-2 -right-2 bg-memorial-text text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Published Gallery */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-memorial-textSecondary px-1">Memory Lane Gallery ({photos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-memorial overflow-hidden shadow-memorial group">
                      <CldImage width="300" height="300" src={photo.image_url} alt={photo.caption || 'photo'} className="w-full h-full object-cover" />

                      {/* Caption display on overlay */}
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white line-clamp-2 italic">{photo.caption}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-lg"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-memorial-divider opacity-40 rounded-memorial">
                      <ImageIcon size={48} className="mb-2" />
                      <span className="text-sm">No photos yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === TAB 3: Letters of Love === */}
          {tab === 'letters' && (
            <div className="space-y-4">
              {!isPaid && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-memorial flex items-start gap-3">
                  <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">Moderation Locked</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      Upgrade to a paid plan to delete or moderate messages.
                      <Link href="/pricing" className="underline ml-1 font-medium hover:text-yellow-900 dark:hover:text-yellow-300">View Plans</Link>
                    </p>
                  </div>
                </div>
              )}

              {letters.length > 0 ? letters.map((letter) => {
                const isPrivate = letter.role === 'Mom' || letter.role === 'Dad';
                const isVerified = !isPrivate || verifiedRoles.includes(letter.role);

                return (
                  <div key={letter.id} className="flex justify-between items-center bg-memorial-bg dark:bg-memorialDark-bg p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border">
                    <div className="flex-1 relative">
                      {!isVerified ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-memorial-accent/60">
                            <Lock size={14} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{letter.role} Letter (Private)</span>
                          </div>
                          <p className="text-memorial-text/20 dark:text-memorialDark-text/20 blur-[4px] select-none">
                            This is a private letter from {letter.role}. Even as the creator, you cannot read this without the Family Key.
                          </p>
                          <span className="text-[10px] text-memorial-textTertiary dark:text-memorialDark-textTertiary italic">
                            - {letter.author_name} (Identity Verified)
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-memorial-text dark:text-memorialDark-text mb-1">{letter.message}</p>
                          <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                            - {letter.author_name} {letter.role && <span className="text-xs opacity-60 ml-1">({letter.role})</span>}
                          </span>
                        </>
                      )}
                    </div>
                    {isPaid && (
                      <button
                        onClick={() => handleDeleteLetter(letter.id, letter.role)}
                        className="bg-red-600/10 text-red-600 p-2 rounded-memorial hover:bg-red-600 hover:text-white transition-all ml-4 shrink-0"
                        title="Delete message"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                )
              }) : (
                <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary text-center py-8">No letters yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-memorial-surface dark:bg-memorialDark-surface rounded-memorial-lg p-6 max-w-sm w-full shadow-2xl border border-memorial-border dark:border-memorialDark-border relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPendingRole(null);
                setRolePassword('');
              }}
              className="absolute top-4 right-4 p-2 text-memorial-textSecondary hover:bg-memorial-bg dark:hover:bg-memorialDark-bg rounded-full transition-colors"
            >
              <Lock size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-memorial-accent/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-memorial-accent" size={24} />
              </div>
              <h2 className="text-xl font-serif text-memorial-text dark:text-memorialDark-text">Verify Role</h2>
              <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary mt-2">
                Enter the Family Key for <strong>{pendingRole}</strong> access.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Family Key"
                value={rolePassword}
                onChange={(e) => setRolePassword(e.target.value.toUpperCase())}
                className="input-memorial w-full text-center text-lg font-mono tracking-widest uppercase"
                autoFocus
              />
              <button type="submit" className="btn-primary w-full shadow-md">
                Verify & Unlock
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
