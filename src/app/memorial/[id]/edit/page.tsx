'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { CldUploadButton, CldImage } from 'next-cloudinary'
import toast from 'react-hot-toast'
import { Trash, Check, Lock } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { canAccess, getPhotoLimit, isPaidPlan } from '@/lib/planFeatures'

export default function EditMemorialPage() {
  const [memorial, setMemorial] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [photos, setPhotos] = useState([])

  const [bio, setBio] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [gender, setGender] = useState('female')

  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bio')

  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const { id: memorialId } = params

  // --- 1. Fetch all data for editing ---
  useEffect(() => {
    if (!memorialId) return;

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
        .eq('user_id', user.id) // IMPORTANT: RLS check
        .single()

      if (memorialError || !memorialData) {
        toast.error('Memorial not found or you are not the owner.')
        router.push('/dashboard')
        return
      }
      setMemorial(memorialData)
      setBio(memorialData.bio || '')
      setVisibility(memorialData.visibility || 'private')
      setGender(memorialData.gender || 'female')

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
    fetchAll()
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
      .update({ bio: bio, visibility: visibility, gender: gender })
      .eq('id', memorialId)

    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Memorial updated!')
    }
  }

  // --- 3. Handle Gallery Photo Upload (Cloudinary) ---
  const handleUploadSuccess = async (result) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check photo limit
    const limit = getPhotoLimit(subscription?.plan);
    if (photos.length >= limit) {
      toast.error(`Free plan is limited to ${limit} photos. Upgrade to add more!`);
      return;
    }

    const { data: newPhoto, error } = await supabase
      .from('gallery_photos')
      .insert({
        memorial_id: memorialId,
        user_id: user.id,
        image_url: result.info.public_id, // Save the Public ID
        caption: 'New photo'
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
    } else {
      setPhotos([...photos, newPhoto])
      toast.success('Photo added to Memory Lane!')
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
    // Note: This does not delete from Cloudinary to keep it simple
  }

  // --- 5. Handle Guestbook Deletion (Moderation) ---
  const handleDeleteLetter = async (letterId) => {
    if (!canAccess(subscription?.plan, 'letters_of_love')) {
      toast.error('Moderating letters requires a paid plan.');
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

              <CldUploadButton
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''}
                onSuccess={handleUploadSuccess}
                className="btn-primary w-full mb-6"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative rounded-memorial overflow-hidden shadow-memorial group">
                    <CldImage width="300" height="300" src={photo.image_url} alt="photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
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

              {letters.length > 0 ? letters.map((letter) => (
                <div key={letter.id} className="flex justify-between items-center bg-memorial-bg dark:bg-memorialDark-bg p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border">
                  <div className="flex-1">
                    <p className="text-memorial-text dark:text-memorialDark-text mb-1">{letter.message}</p>
                    <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">- {letter.author_name}</span>
                  </div>
                  {isPaid && (
                    <button
                      onClick={() => handleDeleteLetter(letter.id)}
                      className="bg-red-600 text-white p-2 rounded-memorial hover:bg-red-700 transition-colors ml-4"
                      title="Delete message"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              )) : (
                <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary text-center py-8">No letters yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
