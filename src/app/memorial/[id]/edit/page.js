'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { CldUploadButton, CldImage } from 'next-cloudinary'
import toast from 'react-hot-toast'
import { Trash, Check } from 'lucide-react'
import Link from 'next/link'

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
    return <div className="text-center py-16">Loading Editor...</div>
  }

  const isPaidUser = subscription && subscription.plan !== 'free'

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">Edit: {memorial.name}</h1>
      <Link href={`/memorial/${memorial.id}`} className="text-light-accent dark:text-dark-accent underline mb-8 block">
        View Public Page
      </Link>

      {/* --- Tab Navigation --- */}
      <div className="flex border-b border-light-border dark:border-dark-border mb-8">
        <button onClick={() => setTab('bio')} className={`py-2 px-4 ${tab === 'bio' ? 'border-b-2 border-light-accent dark:border-dark-accent font-semibold' : 'text-light-textSecondary dark:text-dark-textSecondary'}`}>
          Bio & Settings
        </button>
        <button onClick={() => setTab('gallery')} className={`py-2 px-4 ${tab === 'gallery' ? 'border-b-2 border-light-accent dark:border-dark-accent font-semibold' : 'text-light-textSecondary dark:text-dark-textSecondary'}`}>
          Memory Lane
        </button>
        <button onClick={() => setTab('letters')} className={`py-2 px-4 ${tab === 'letters' ? 'border-b-2 border-light-accent dark:border-dark-accent font-semibold' : 'text-light-textSecondary dark:text-dark-textSecondary'}`}>
          Letters of Love
        </button>
      </div>

      {/* --- Tab Content --- */}
      <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">

        {/* === TAB 1: Bio & Settings === */}
        {tab === 'bio' && (
          <form onSubmit={handleUpdateBio} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="bio">
                Biography or Tribute
              </label>
              <textarea
                id="bio"
                rows={10}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="visibility">
                Memorial Visibility
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
              >
                <option value="private">Private (Only you can see)</option>
                <option value="public" disabled={!isPaidUser}>
                  Public (Visible to anyone with the link) {isPaidUser ? ' (Plan Active)' : ' (Paid Plan Required)'}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 rounded-lg bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2 px-4 rounded-lg"
            >
              Save Changes
            </button>
          </form>
        )}

        {/* === TAB 2: Memory Lane === */}
        {tab === 'gallery' && (
          <div>
            <CldUploadButton
              cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={handleUploadSuccess}
              className="w-full bg-light-primaryButton text-light-buttonText dark:bg-dark-primaryButton dark:text-dark-buttonText font-medium py-2 px-4 rounded-lg mb-6"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-lg overflow-hidden shadow-lg">
                  <CldImage width="300" height="300" src={photo.image_url} alt="photo" />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
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
              <div key={letter.id} className="flex justify-between items-center bg-light-background dark:bg-dark-background p-3 rounded-lg">
                <div>
                  <p>{letter.message}</p>
                  <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">- {letter.author_name}</span>
                </div>
                <button
                  onClick={() => handleDeleteLetter(letter.id)}
                  className="bg-red-600 text-white p-2 rounded-lg"
                >
                  <Trash size={16} />
                </button>
              </div>
            )) : <p>No letters yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
