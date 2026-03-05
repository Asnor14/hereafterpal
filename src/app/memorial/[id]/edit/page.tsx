'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CldImage } from 'next-cloudinary'
import toast from 'react-hot-toast'
import { Trash, Lock, Upload, Image as ImageIcon, X, Plus, Eye, Mic, Play, Pause, Loader2, Check } from 'lucide-react'
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

const MOOD_OPTIONS = [
  { value: 'longing', label: 'Longing' },
  { value: 'excited', label: 'Energetic' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'frustrated', label: 'Frustrated' },
]

const DEFAULT_MOODS = {
  longing: null,
  excited: null,
  stressed: null,
  frustrated: null,
}

const VOICE_PROFILE_OPTIONS = [
  {
    key: 'voice1',
    label: 'Voice 1',
    femaleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE1_FEMALE || 'EXAVITQu4vr4xnSDxMaL',
    maleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE1_MALE || 'pNInz6obpgDQGcFmaJgB',
  },
  {
    key: 'voice2',
    label: 'Voice 2',
    femaleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE2_FEMALE || 'XrExE9yKIg1WjnnlVkGX',
    maleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE2_MALE || 'TxGEqnHWrfWFTfGW9XjX',
  },
  {
    key: 'voice3',
    label: 'Voice 3',
    femaleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE3_FEMALE || 'pFZP5JQG7iQjIQuC4Bku',
    maleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE3_MALE || 'VR6AewLTigWG4xSOukaG',
  },
  {
    key: 'voice4',
    label: 'Voice 4',
    femaleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE4_FEMALE || 'ThT5KcBeYPX3keUQqHPh',
    maleVoiceId: process.env.NEXT_PUBLIC_VOICE_PROFILE4_MALE || 'onwK4e9ZLuTAKqWW03F9',
  },
]

const cloneMoodTemplate = () => ({ ...DEFAULT_MOODS })

const VOICE_LABEL_BY_KEY: Record<string, string> = {
  voice1: 'Voice 1',
  voice2: 'Voice 2',
  voice3: 'Voice 3',
  voice4: 'Voice 4',
}

function normalizeVoiceLabel(key: string, label?: string | null) {
  const preset = VOICE_LABEL_BY_KEY[key]
  if (preset) return preset
  if (typeof label === 'string' && label.includes(' - ')) {
    return label.split(' - ')[0].trim()
  }
  return label || key
}

function normalizeVoicePayload(raw: any) {
  // New shape: { version: 2, selectedProfileKey, profiles: { voice1: { label, moods } } }
  if (raw?.profiles && typeof raw.profiles === 'object') {
    const profiles: Record<string, any> = {}
    for (const [key, value] of Object.entries(raw.profiles)) {
      const source = (value as any)?.moods && typeof (value as any).moods === 'object'
        ? (value as any).moods
        : value
      profiles[key] = {
        label: normalizeVoiceLabel(String(key), (value as any)?.label),
        voiceIdByGender: (value as any)?.voiceIdByGender || null,
        moods: {
          ...cloneMoodTemplate(),
          longing: typeof (source as any).longing === 'string' ? (source as any).longing : null,
          excited: typeof (source as any).excited === 'string' ? (source as any).excited : null,
          stressed: typeof (source as any).stressed === 'string' ? (source as any).stressed : null,
          frustrated: typeof (source as any).frustrated === 'string' ? (source as any).frustrated : null,
        },
      }
    }

    return {
      version: 2,
      selectedProfileKey: raw.selectedProfileKey || Object.keys(profiles)[0] || 'voice1',
      profiles,
    }
  }

  // Legacy shape: flat moods object
  const hasLegacyMood = ['longing', 'excited', 'stressed', 'frustrated'].some(
    mood => typeof raw?.[mood] === 'string' && raw?.[mood]
  )

  if (hasLegacyMood) {
    return {
      version: 2,
      selectedProfileKey: 'voice1',
      profiles: {
        voice1: {
          label: 'Voice 1',
          voiceIdByGender: null,
          moods: {
            ...cloneMoodTemplate(),
            longing: typeof raw.longing === 'string' ? raw.longing : null,
            excited: typeof raw.excited === 'string' ? raw.excited : null,
            stressed: typeof raw.stressed === 'string' ? raw.stressed : null,
            frustrated: typeof raw.frustrated === 'string' ? raw.frustrated : null,
          },
        },
      },
    }
  }

  return {
    version: 2,
    selectedProfileKey: 'voice1',
    profiles: {},
  }
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
  const [senderFolders, setSenderFolders] = useState<any[]>([])
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderPassword, setNewFolderPassword] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [isUploadingBulk, setIsUploadingBulk] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Voice editing state
  const [voiceType, setVoiceType] = useState('ai-voice')
  const [voiceMessage, setVoiceMessage] = useState('')
  const [voiceMood, setVoiceMood] = useState('longing')
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [cloneVoiceAudio, setCloneVoiceAudio] = useState<File | null>(null)
  const [cloneVoiceName, setCloneVoiceName] = useState('')
  const [cloneVoiceText, setCloneVoiceText] = useState('')
  const [cloneVoiceLanguage, setCloneVoiceLanguage] = useState('English')
  const [cloneVoiceGender, setCloneVoiceGender] = useState('female')
  const [selectedVoiceProfileKey, setSelectedVoiceProfileKey] = useState('voice1')
  const [voiceProfilesPayload, setVoiceProfilesPayload] = useState<any>({
    version: 2,
    selectedProfileKey: 'voice1',
    profiles: {},
  })

  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const { id: memorialId } = params

  const getProfileVoiceId = (profileKey: string, targetGender: string) => {
    const option = VOICE_PROFILE_OPTIONS.find(p => p.key === profileKey)
    if (!option) return null
    return targetGender === 'male' ? option.maleVoiceId : option.femaleVoiceId
  }

  const calculateAge = (dob: string | null, dop: string | null) => {
    if (!dob || !dop) return 50
    const birth = new Date(dob)
    const passing = new Date(dop)
    if (Number.isNaN(birth.getTime()) || Number.isNaN(passing.getTime())) return 50

    let age = passing.getFullYear() - birth.getFullYear()
    const m = passing.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && passing.getDate() < birth.getDate())) age--
    return age > 0 ? age : 50
  }

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
    setCloneVoiceGender(memorialData.gender || 'female')
    setVoiceMessage(memorialData.voice_message || '')

    const normalizedVoice = normalizeVoicePayload(memorialData.ai_voice_moods)
    setVoiceProfilesPayload(normalizedVoice)
    setSelectedVoiceProfileKey(normalizedVoice.selectedProfileKey || 'voice1')

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

    // Fetch sender folders
    const { data: foldersData } = await supabase
      .from('letter_sender_folders')
      .select('*')
      .eq('memorial_id', memorialId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setSenderFolders(foldersData || [])

    setLoading(false)
  }

  useEffect(() => {
    if (memorialId) fetchAll()
  }, [memorialId, supabase, router])

  const selectedVoiceProfile = voiceProfilesPayload?.profiles?.[selectedVoiceProfileKey]

  useEffect(() => {
    const profileKeys = Object.keys(voiceProfilesPayload?.profiles || {})
    if (!selectedVoiceProfileKey || !voiceProfilesPayload?.profiles?.[selectedVoiceProfileKey]) {
      if (profileKeys.length > 0) {
        setSelectedVoiceProfileKey(profileKeys[0])
      }
    }
  }, [selectedVoiceProfileKey, voiceProfilesPayload])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => setIsPlayingAudio(false)
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [generatedAudioUrl])

  useEffect(() => {
    const currentMoodUrl = selectedVoiceProfile?.moods?.[voiceMood] || null
    setGeneratedAudioUrl(currentMoodUrl)
    setIsPlayingAudio(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [selectedVoiceProfile, voiceMood, selectedVoiceProfileKey])

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlayingAudio(!isPlayingAudio)
  }

  const ensureVoiceProfile = (profileKey: string) => {
    const existing = voiceProfilesPayload?.profiles?.[profileKey]
    if (existing) return existing
    const option = VOICE_PROFILE_OPTIONS.find(p => p.key === profileKey)
    return {
      label: option?.label || profileKey,
      voiceIdByGender: {
        female: option?.femaleVoiceId || null,
        male: option?.maleVoiceId || null,
      },
      moods: cloneMoodTemplate(),
    }
  }

  const upsertCurrentGeneratedAudio = (audioUrl: string) => {
    setVoiceProfilesPayload((prev: any) => {
      const current = prev || { version: 2, selectedProfileKey: selectedVoiceProfileKey, profiles: {} }
      const option = VOICE_PROFILE_OPTIONS.find(p => p.key === selectedVoiceProfileKey)
      const profile = current?.profiles?.[selectedVoiceProfileKey] || {
        label: option?.label || selectedVoiceProfileKey,
        voiceIdByGender: {
          female: option?.femaleVoiceId || null,
          male: option?.maleVoiceId || null,
        },
        moods: cloneMoodTemplate(),
      }
      return {
        ...current,
        version: 2,
        selectedProfileKey: selectedVoiceProfileKey,
        profiles: {
          ...(current.profiles || {}),
          [selectedVoiceProfileKey]: {
            ...profile,
            moods: {
              ...cloneMoodTemplate(),
              ...(profile.moods || {}),
              [voiceMood]: audioUrl,
            },
          },
        },
      }
    })
  }

  const handleGenerateVoice = async () => {
    if (!voiceMessage.trim()) {
      toast.error('Please enter a message for the AI voice.')
      return
    }
    if (!isPaidPlan(subscription?.plan)) {
      toast.error('AI voice is a paid feature.')
      return
    }

    setIsGeneratingVoice(true)
    setVoiceProgress(0)
    const progressInterval = setInterval(() => {
      setVoiceProgress(prev => (prev >= 90 ? 90 : prev + 5))
    }, 500)

    try {
      const age = calculateAge(memorial?.date_of_birth || null, memorial?.date_of_passing || null)
      const fixedVoiceId = getProfileVoiceId(selectedVoiceProfileKey, gender || memorial?.gender || 'female')
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceMessage.trim(),
          mood: voiceMood,
          gender: gender || memorial?.gender || 'female',
          age,
          voiceId: fixedVoiceId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate voice')

      setGeneratedAudioUrl(data.audioUrl)
      upsertCurrentGeneratedAudio(data.audioUrl)
      setVoiceProgress(100)
      toast.success('AI voice generated.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate voice.')
      setVoiceProgress(0)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsGeneratingVoice(false)
        setVoiceProgress(0)
      }, 800)
    }
  }

  const handleGenerateCloneVoice = async () => {
    if (!cloneVoiceAudio) {
      toast.error('Please upload a voice sample.')
      return
    }
    if (!cloneVoiceText.trim()) {
      toast.error('Please enter a message for cloned voice.')
      return
    }
    if (!cloneVoiceGender) {
      toast.error('Please select a gender for cloning.')
      return
    }
    if (!isPaidPlan(subscription?.plan)) {
      toast.error('Cloned voice is a paid feature.')
      return
    }

    setIsGeneratingVoice(true)
    setVoiceProgress(0)
    const progressInterval = setInterval(() => {
      setVoiceProgress(prev => (prev >= 90 ? 90 : prev + 5))
    }, 500)

    try {
      const formData = new FormData()
      formData.append('file', cloneVoiceAudio)
      formData.append('text', cloneVoiceText.trim())
      formData.append('voiceName', cloneVoiceName.trim() || `${memorial?.name || 'Memorial'} Voice`)
      formData.append('gender', cloneVoiceGender)
      formData.append('targetLang', cloneVoiceLanguage)

      const response = await fetch('/api/clone-voice', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to clone voice')

      setGeneratedAudioUrl(data.audioUrl)
      upsertCurrentGeneratedAudio(data.audioUrl)
      setVoiceProgress(100)
      setVoiceMessage(cloneVoiceText.trim())
      toast.success('Cloned voice generated.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone voice.')
      setVoiceProgress(0)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsGeneratingVoice(false)
        setVoiceProgress(0)
      }, 800)
    }
  }

  // --- 2. Handle Bio/Visibility Update ---
  const handleUpdateBio = async (e) => {
    e.preventDefault()

    if (isGeneratingVoice) {
      toast.error('Please wait for voice generation to finish.')
      return
    }

    // Check for publishing
    if (visibility === 'public' && !isPaidPlan(subscription?.plan)) {
      toast.error('You must have a paid plan to make a memorial public.')
      setVisibility('private')
      return
    }

    const normalized = {
      ...(voiceProfilesPayload || {}),
      version: 2,
      selectedProfileKey: selectedVoiceProfileKey,
      profiles: voiceProfilesPayload?.profiles || {},
    }
    const hasAnyVoiceAudio = Object.values(normalized.profiles || {}).some((profile: any) =>
      Object.values(profile?.moods || {}).some((url: any) => typeof url === 'string' && !!url)
    )

    const toastId = toast.loading('Saving changes...')
    const { error } = await supabase
      .from('memorials')
      .update({
        bio: bio,
        visibility: visibility,
        gender: gender,
        family_password: familyPassword.toUpperCase(),
        voice_message: voiceType === 'clone-voice' ? cloneVoiceText.trim() || voiceMessage || null : voiceMessage || null,
        voice_generation_status: hasAnyVoiceAudio ? 'generated' : 'pending',
        ai_voice_moods: normalized,
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
  const handleDeleteLetter = async (letterId: string) => {
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

  const handleCreateSenderFolder = async () => {
    const name = newFolderName.trim()
    if (!name) {
      toast.error('Folder name is required.')
      return
    }

    if (senderFolders.some(f => (f.name || '').toLowerCase() === name.toLowerCase())) {
      toast.error('Folder name already exists.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in.')
      return
    }

    setIsCreatingFolder(true)
    const { data, error } = await supabase
      .from('letter_sender_folders')
      .insert({
        memorial_id: memorialId,
        name,
        password_hash: newFolderPassword.trim() || null,
        created_by: user.id,
        sort_order: senderFolders.length,
      })
      .select()
      .single()

    setIsCreatingFolder(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSenderFolders(prev => [...prev, data])
    setNewFolderName('')
    setNewFolderPassword('')
    toast.success('Sender folder added.')
  }

  const handleDeleteSenderFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}"?`)) return

    const { error } = await supabase
      .from('letter_sender_folders')
      .delete()
      .eq('id', folderId)

    if (error) {
      toast.error(error.message)
      return
    }

    setSenderFolders(prev => prev.filter(folder => folder.id !== folderId))
    if (activeFolderFilter === folderId) {
      setActiveFolderFilter(null)
    }
    toast.success('Folder deleted.')
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
  const existingProfileKeys = Object.keys(voiceProfilesPayload?.profiles || {})
  const displayedLetters = activeFolderFilter
    ? letters.filter(letter => letter.sender_folder_id === activeFolderFilter)
    : letters

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
          <button onClick={() => setTab('voices')} className={`py-2 px-4 ${tab === 'voices' ? 'border-b-2 border-memorial-accent dark:border-memorialDark-accent font-semibold text-memorial-text dark:text-memorialDark-text' : 'text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:text-memorial-text dark:hover:text-memorialDark-text transition-colors'}`}>
            AI Voices
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
                  Access Key (optional)
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
                    Optional legacy key for access sharing.
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

          {/* === TAB 2: AI Voices === */}
          {tab === 'voices' && (
            <form onSubmit={handleUpdateBio} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="text-memorial-accent dark:text-memorialDark-accent" />
                  <h4 className="text-base font-semibold text-memorial-text dark:text-memorialDark-text">Voice Tribute</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-memorial-accent/10 text-memorial-accent">Optional</span>
                  {!isPaid && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Paid Feature</span>}
                </div>

                {!isPaid && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-memorial text-sm text-yellow-700 dark:text-yellow-500">
                    Upgrade plan to generate AI or cloned voice tributes in edit mode.
                  </div>
                )}

                <div className={`space-y-4 ${!isPaid ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">
                        Voice Profile
                      </label>
                      <select
                        value={selectedVoiceProfileKey}
                        onChange={(e) => {
                          const nextKey = e.target.value
                          setSelectedVoiceProfileKey(nextKey)
                          setVoiceProfilesPayload((prev: any) => {
                            const next = prev || { version: 2, selectedProfileKey: nextKey, profiles: {} }
                            return {
                              ...next,
                              selectedProfileKey: nextKey,
                              profiles: {
                                ...(next.profiles || {}),
                                [nextKey]: ensureVoiceProfile(nextKey),
                              },
                            }
                          })
                        }}
                        className="select-memorial w-full"
                      >
                        {VOICE_PROFILE_OPTIONS.map((profile) => (
                          <option key={profile.key} value={profile.key}>{profile.label}</option>
                        ))}
                        {existingProfileKeys
                          .filter((key) => !VOICE_PROFILE_OPTIONS.some((option) => option.key === key))
                          .map((key) => (
                            <option key={key} value={key}>{voiceProfilesPayload?.profiles?.[key]?.label || key}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">
                        Mood
                      </label>
                      <select
                        value={voiceMood}
                        onChange={(e) => setVoiceMood(e.target.value)}
                        className="select-memorial w-full"
                      >
                        {MOOD_OPTIONS.map((mood) => (
                          <option key={mood.value} value={mood.value}>{mood.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">
                      Voice Type
                    </label>
                    <select
                      value={voiceType}
                      onChange={(e) => {
                        setVoiceType(e.target.value)
                        setGeneratedAudioUrl(null)
                        setCloneVoiceAudio(null)
                        setIsPlayingAudio(false)
                      }}
                      className="select-memorial w-full"
                    >
                      <option value="ai-voice">AI Voice</option>
                      <option value="clone-voice">Cloned Voice</option>
                    </select>
                  </div>

                  {voiceType === 'ai-voice' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">
                          Script
                        </label>
                        <textarea
                          value={voiceMessage}
                          onChange={(e) => {
                            if (e.target.value.length <= 5000) setVoiceMessage(e.target.value)
                          }}
                          rows={4}
                          className="input-memorial w-full"
                          placeholder="Write the script for this voice..."
                        />
                        <p className="text-xs text-memorial-textSecondary mt-1">{voiceMessage.length} / 5000</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateVoice}
                        disabled={isGeneratingVoice || !voiceMessage.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isGeneratingVoice ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                        {isGeneratingVoice ? 'Generating...' : 'Generate AI Voice for Selected Mood'}
                      </button>
                    </div>
                  )}

                  {voiceType === 'clone-voice' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">Voice Sample</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setCloneVoiceAudio(e.target.files?.[0] || null)}
                          className="input-memorial w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">Voice Name (Optional)</label>
                        <input
                          type="text"
                          value={cloneVoiceName}
                          onChange={(e) => setCloneVoiceName(e.target.value)}
                          className="input-memorial w-full"
                          maxLength={60}
                          placeholder="e.g. Mom Memorial Voice"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">Language</label>
                        <select
                          value={cloneVoiceLanguage}
                          onChange={(e) => setCloneVoiceLanguage(e.target.value)}
                          className="select-memorial w-full"
                        >
                          <option value="English">English</option>
                          <option value="Filipino">Filipino</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">Gender</label>
                        <select
                          value={cloneVoiceGender}
                          onChange={(e) => setCloneVoiceGender(e.target.value)}
                          className="select-memorial w-full"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-memorial-text dark:text-memorialDark-text">Message to Speak</label>
                        <textarea
                          value={cloneVoiceText}
                          onChange={(e) => {
                            if (e.target.value.length <= 5000) setCloneVoiceText(e.target.value)
                          }}
                          rows={4}
                          className="input-memorial w-full"
                          placeholder="Write what the cloned voice should speak..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateCloneVoice}
                        disabled={isGeneratingVoice || !cloneVoiceAudio || !cloneVoiceText.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isGeneratingVoice ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                        {isGeneratingVoice ? 'Generating...' : 'Generate Cloned Voice for Selected Mood'}
                      </button>
                    </div>
                  )}

                  {isGeneratingVoice && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-memorial-textSecondary">
                        <span>Generating voice...</span>
                        <span>{voiceProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt rounded-full overflow-hidden">
                        <div className="h-full bg-memorial-accent transition-all duration-300" style={{ width: `${voiceProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {generatedAudioUrl && (
                    <div className="p-3 rounded-memorial border border-memorial-border dark:border-memorialDark-border bg-memorial-bg dark:bg-memorialDark-bg">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleAudioPlayback}
                          className="w-10 h-10 rounded-full bg-memorial-accent text-white flex items-center justify-center"
                        >
                          {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">Voice Preview</p>
                          <p className="text-xs text-memorial-textSecondary">
                            {VOICE_PROFILE_OPTIONS.find(p => p.key === selectedVoiceProfileKey)?.label || selectedVoiceProfileKey} - {MOOD_OPTIONS.find(m => m.value === voiceMood)?.label || voiceMood}
                          </p>
                        </div>
                        <Check size={18} className="text-green-500" />
                      </div>
                      <audio ref={audioRef} src={generatedAudioUrl} className="hidden" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Save Voice Settings
              </button>
            </form>
          )}

          {/* === TAB 3: Memory Lane === */}
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

          {/* === TAB 4: Letters of Love === */}
          {tab === 'letters' && (
            <div className="space-y-6">
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

              <div className="p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border bg-memorial-bg dark:bg-memorialDark-bg">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-memorial-textSecondary mb-3">
                  Sender Folders
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name (e.g. Person 1)"
                    className="input-memorial w-full"
                  />
                  <input
                    type="text"
                    value={newFolderPassword}
                    onChange={(e) => setNewFolderPassword(e.target.value)}
                    placeholder="Password (optional)"
                    className="input-memorial w-full"
                  />
                  <button
                    type="button"
                    onClick={handleCreateSenderFolder}
                    disabled={isCreatingFolder}
                    className="btn-primary w-full"
                  >
                    {isCreatingFolder ? 'Adding...' : 'Add Folder'}
                  </button>
                </div>

                <div className="space-y-2">
                  {senderFolders.length === 0 && (
                    <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                      No folders yet.
                    </span>
                  )}
                  {senderFolders.map(folder => (
                    <div
                      key={folder.id}
                      className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center px-3 py-2 rounded-memorial border border-memorial-border dark:border-memorialDark-border text-sm text-memorial-text dark:text-memorialDark-text bg-memorial-surface dark:bg-memorialDark-surface"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{folder.name}</span>
                        {folder.password_hash && <Lock size={12} className="opacity-70" />}
                        <span className="text-xs opacity-70">
                          {(letters || []).filter(letter => letter.sender_folder_id === folder.id).length} letter(s)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveFolderFilter(prev => prev === folder.id ? null : folder.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-memorial border border-memorial-border dark:border-memorialDark-border hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors text-xs"
                          title="View folder letters"
                        >
                          <Eye size={13} />
                          {activeFolderFilter === folder.id ? 'Viewing' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSenderFolder(folder.id, folder.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-memorial border border-red-500/40 text-red-400 hover:bg-red-600/10 transition-colors text-xs"
                          title="Delete folder"
                        >
                          <Trash size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-memorial-textSecondary">
                  Letters {activeFolderFilter ? '(Filtered)' : '(All)'}
                </h4>
                {activeFolderFilter && (
                  <button
                    type="button"
                    onClick={() => setActiveFolderFilter(null)}
                    className="text-xs px-3 py-1 rounded-memorial border border-memorial-border dark:border-memorialDark-border hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {displayedLetters.length > 0 ? displayedLetters.map((letter) => {
                return (
                  <div key={letter.id} className="flex justify-between items-center bg-memorial-bg dark:bg-memorialDark-bg p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border">
                    <div className="flex-1">
                      <p className="text-memorial-text dark:text-memorialDark-text mb-1">{letter.message}</p>
                      <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                        - {letter.author_name || 'Anonymous'} {letter.sender_name && <span className="text-xs opacity-60 ml-1">({letter.sender_name})</span>}
                      </span>
                    </div>
                    {isPaid && (
                      <button
                        onClick={() => handleDeleteLetter(letter.id)}
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
    </DashboardLayout>
  )
}
