'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { CldUploadButton, CldImage } from 'next-cloudinary'
import toast from 'react-hot-toast'
import { Trash, Check } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

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
    if (visibility === 'public' && (!subscription || subscription.plan === 'free')) {
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

  const isPaidUser = subscription && subscription.plan !== 'free'

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
                <option value="public" disabled={!isPaidUser}>
                  Public (Visible to anyone with the link) {isPaidUser ? ' (Plan Active)' : ' (Paid Plan Required)'}
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
            <CldUploadButton
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''}
              onSuccess={handleUploadSuccess}
              className="btn-primary w-full mb-6"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-memorial overflow-hidden shadow-memorial">
                  <CldImage width="300" height="300" src={photo.image_url} alt="photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
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
            {letters.length > 0 ? letters.map((letter) => (
              <div key={letter.id} className="flex justify-between items-center bg-memorial-bg dark:bg-memorialDark-bg p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border">
                <div className="flex-1">
                  <p className="text-memorial-text dark:text-memorialDark-text mb-1">{letter.message}</p>
                  <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">- {letter.author_name}</span>
                </div>
                <button
                  onClick={() => handleDeleteLetter(letter.id)}
                  className="bg-red-600 text-white p-2 rounded-memorial hover:bg-red-700 transition-colors ml-4"
                >
                  <Trash size={16} />
                </button>
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
