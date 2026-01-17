'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Upload, X, AlertCircle, Check, ImagePlus, Mic, Play, Pause, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { CldUploadButton, CldImage } from 'next-cloudinary'

// Mood options for AI Voice
const MOOD_OPTIONS = [
  { value: 'longing', label: 'Longing - Celestine' },
  { value: 'excited', label: 'Excited - Celestine' },
  { value: 'stressed', label: 'Stressed - Celestine' },
  { value: 'frustrated', label: 'Frustrated - Celestine' },
]

export default function CreateMemorialPage() {
  const supabase = createClient()
  const router = useRouter()
  const audioRef = useRef(null)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [serviceType, setServiceType] = useState('ETERNAL ECHO')
  const [visibility, setVisibility] = useState('private')
  const [gender, setGender] = useState('female')
  const [loading, setLoading] = useState(false)

  // Cloudinary image state
  const [imagePublicId, setImagePublicId] = useState(null)

  // Date state
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [deathMonth, setDeathMonth] = useState('')
  const [deathDay, setDeathDay] = useState('')
  const [deathYear, setDeathYear] = useState('')

  // AI Voice Tribute state
  const [voiceMessage, setVoiceMessage] = useState('')
  const [voiceMood, setVoiceMood] = useState('longing')
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null)
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState({})

  // Character count for bio
  const maxBioLength = 5000
  const minBioLength = 50
  const bioLength = bio.length

  // Months for dropdown
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  // Days for dropdown
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1),
  }))

  const currentYear = new Date().getFullYear()

  // Calculate age
  const calculateAge = () => {
    if (birthYear && deathYear && birthMonth && deathMonth) {
      let age = parseInt(deathYear) - parseInt(birthYear)
      if (parseInt(deathMonth) < parseInt(birthMonth)) {
        age--
      } else if (parseInt(deathMonth) === parseInt(birthMonth) && parseInt(deathDay) < parseInt(birthDay)) {
        age--
      }
      return age >= 0 ? age : null
    }
    return null
  }

  const age = calculateAge()

  // Handle image upload
  const handleUploadSuccess = (result) => {
    if (result?.info?.public_id) {
      setImagePublicId(result.info.public_id)
      setErrors(prev => ({ ...prev, image: null }))
      toast.success('Photo uploaded successfully!')
    }
  }

  const removeImage = () => {
    setImagePublicId(null)
  }

  // Generate AI Voice
  const handleGenerateVoice = async () => {
    if (!voiceMessage.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Message Required',
        text: 'Please enter a message for the voice tribute',
        confirmButtonColor: '#9b8b6f',
      })
      return
    }

    if (voiceMessage.length > 5000) {
      Swal.fire({
        icon: 'error',
        title: 'Message Too Long',
        text: 'Voice message must be 5000 characters or less',
        confirmButtonColor: '#9b8b6f',
      })
      return
    }

    // Validate dates are filled (needed for age calculation)
    if (!birthYear || !birthMonth || !birthDay || !deathYear || !deathMonth || !deathDay) {
      Swal.fire({
        icon: 'error',
        title: 'Dates Required',
        text: 'Please fill in the birth and death dates first to generate an age-appropriate voice',
        confirmButtonColor: '#9b8b6f',
      })
      return
    }

    // Validate gender is selected
    if (!gender) {
      Swal.fire({
        icon: 'error',
        title: 'Gender Required',
        text: 'Please select a gender first',
        confirmButtonColor: '#9b8b6f',
      })
      return
    }

    setIsGeneratingVoice(true)
    setVoiceProgress(0)

    // Simulate progress (0-90% during generation, 100% when done)
    const progressInterval = setInterval(() => {
      setVoiceProgress(prev => {
        if (prev >= 90) return 90
        return prev + 5
      })
    }, 500)

    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceMessage,
          mood: voiceMood,
          gender: gender,
          age: age || 50, // Use calculated age or default to 50
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate voice')
      }

      setGeneratedAudioUrl(data.audioUrl)
      setVoiceProgress(100)
      Swal.fire({
        icon: 'success',
        title: 'Voice Generated!',
        text: 'Voice tribute generated successfully',
        confirmButtonColor: '#9b8b6f',
        timer: 2000,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: error.message,
        confirmButtonColor: '#9b8b6f',
      })
      setVoiceProgress(0)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsGeneratingVoice(false)
        setVoiceProgress(0)
      }, 1000)
    }
  }

  // Audio playback controls
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return

    if (isPlayingAudio) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlayingAudio(!isPlayingAudio)
  }

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleEnded = () => setIsPlayingAudio(false)
      audio.addEventListener('ended', handleEnded)
      return () => audio.removeEventListener('ended', handleEnded)
    }
  }, [generatedAudioUrl])

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter a name (required)'
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (!birthMonth || !birthDay || !birthYear) {
      newErrors.birthDate = 'Please enter a complete birth date'
    } else {
      const birthYearNum = parseInt(birthYear)
      if (birthYearNum < 1800 || birthYearNum > currentYear) {
        newErrors.birthDate = `Birth year must be between 1800 and ${currentYear}`
      }
    }

    if (!deathMonth || !deathDay || !deathYear) {
      newErrors.deathDate = 'Please enter a complete date of passing'
    } else {
      const deathYearNum = parseInt(deathYear)
      const birthYearNum = parseInt(birthYear)

      if (deathYearNum < 1800 || deathYearNum > currentYear) {
        newErrors.deathDate = `Year must be between 1800 and ${currentYear}`
      }

      if (birthYear && deathYearNum < birthYearNum) {
        newErrors.deathDate = 'Date of passing must be after birth date'
      }
    }

    if (!bio.trim()) {
      newErrors.bio = 'Please write a life story (required)'
    } else if (bio.length < minBioLength) {
      newErrors.bio = `Please write at least ${minBioLength} characters`
    } else if (bio.length > maxBioLength) {
      newErrors.bio = `Life story must be ${maxBioLength} characters or less`
    }

    if (!imagePublicId) {
      newErrors.image = 'Please upload a photo'
    }

    // Voice validation - if generating, block submit
    if (isGeneratingVoice) {
      newErrors.voice = 'Please wait for voice generation to complete'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors before submitting',
        confirmButtonColor: '#9b8b6f',
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        Swal.fire({
          icon: 'error',
          title: 'Not Logged In',
          text: 'You must be logged in to create a memorial',
          confirmButtonColor: '#9b8b6f',
        })
        router.push('/login')
        return
      }

      const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`
      const dateOfPassing = `${deathYear}-${deathMonth}-${deathDay}`

      // Build ai_voice_moods JSON
      const aiVoiceMoods = {
        longing: null,
        excited: null,
        stressed: null,
        frustrated: null,
      }

      if (generatedAudioUrl) {
        aiVoiceMoods[voiceMood] = generatedAudioUrl
      }

      const { data, error } = await supabase
        .from('memorials')
        .insert({
          name: name.trim(),
          bio: bio.trim(),
          service_type: serviceType,
          visibility: visibility,
          gender: gender,
          image_url: imagePublicId,
          user_id: user.id,
          date_of_birth: dateOfBirth,
          date_of_passing: dateOfPassing,
          // AI Voice fields
          voice_message: voiceMessage.trim() || null,
          voice_generation_status: generatedAudioUrl ? 'generated' : 'pending',
          ai_voice_moods: aiVoiceMoods,
        })
        .select()
        .single()

      if (error) throw error

      Swal.fire({
        icon: 'success',
        title: 'Memorial Created!',
        text: 'Your memorial has been created successfully',
        confirmButtonColor: '#9b8b6f',
        timer: 2000,
      })
      router.push('/dashboard')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.message,
        confirmButtonColor: '#9b8b6f',
      })
    } finally {
      setLoading(false)
    }
  }

  // Year input handler
  const handleYearInput = (value, setter, fieldName) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 4) {
      setter(numericValue)
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: null }))
      }
    }
  }

  const inputClasses = (hasError) => `
    w-full px-4 py-3 rounded-memorial 
    bg-memorial-bg dark:bg-memorialDark-bg 
    border ${hasError ? 'border-red-500' : 'border-memorial-border dark:border-memorialDark-border'}
    text-memorial-text dark:text-memorialDark-text
    focus:border-memorial-gold dark:focus:border-memorialDark-gold 
    focus:ring-2 focus:ring-memorial-gold/20
    transition-colors duration-200
    min-h-touch text-base
  `

  const selectClasses = (hasError) => `
    px-3 py-3 rounded-memorial 
    bg-memorial-bg dark:bg-memorialDark-bg 
    border ${hasError ? 'border-red-500' : 'border-memorial-border dark:border-memorialDark-border'}
    text-memorial-text dark:text-memorialDark-text
    focus:border-memorial-gold dark:focus:border-memorialDark-gold 
    transition-colors duration-200
    min-h-touch text-base appearance-none
  `

  return (
    <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-3">
            Create a Memorial
          </h1>
          <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
            Honor your loved one with a beautiful, lasting tribute
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="memorial-card p-6 md:p-8 space-y-8"
        >
          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Profile Photo <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 ${errors.image ? 'border-red-500' : 'border-memorial-gold/30 dark:border-memorialDark-gold/30'
                  } bg-memorial-bg dark:bg-memorialDark-bg flex items-center justify-center`}
              >
                {imagePublicId ? (
                  <>
                    <CldImage
                      src={imagePublicId}
                      width={160}
                      height={160}
                      alt="Memorial photo"
                      crop="fill"
                      gravity="face"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImagePlus size={32} className="mx-auto text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-2" />
                    <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">No photo</span>
                  </div>
                )}
              </div>

              <CldUploadButton
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={handleUploadSuccess}
                className="px-6 py-3 rounded-memorial bg-memorial-gold dark:bg-memorialDark-gold text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 min-h-touch"
              >
                <Upload size={18} />
                {imagePublicId ? 'Change Photo' : 'Upload Photo'}
              </CldUploadButton>
            </div>

            {errors.image && (
              <p className="text-sm text-red-500 flex items-center justify-center gap-1">
                <AlertCircle size={14} />
                {errors.image}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors(prev => ({ ...prev, name: null }))
              }}
              className={inputClasses(errors.name)}
              placeholder="Enter full name"
              maxLength={100}
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full ${selectClasses(false)}`}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={birthMonth}
                onChange={(e) => {
                  setBirthMonth(e.target.value)
                  if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: null }))
                }}
                className={selectClasses(errors.birthDate)}
              >
                <option value="">Month</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => {
                  setBirthDay(e.target.value)
                  if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: null }))
                }}
                className={selectClasses(errors.birthDate)}
              >
                <option value="">Day</option>
                {days.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                value={birthYear}
                onChange={(e) => handleYearInput(e.target.value, setBirthYear, 'birthDate')}
                placeholder="Year"
                className={selectClasses(errors.birthDate)}
                maxLength={4}
              />
            </div>
            {errors.birthDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* Date of Passing */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Date of Passing <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={deathMonth}
                onChange={(e) => {
                  setDeathMonth(e.target.value)
                  if (errors.deathDate) setErrors(prev => ({ ...prev, deathDate: null }))
                }}
                className={selectClasses(errors.deathDate)}
              >
                <option value="">Month</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={deathDay}
                onChange={(e) => {
                  setDeathDay(e.target.value)
                  if (errors.deathDate) setErrors(prev => ({ ...prev, deathDate: null }))
                }}
                className={selectClasses(errors.deathDate)}
              >
                <option value="">Day</option>
                {days.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                value={deathYear}
                onChange={(e) => handleYearInput(e.target.value, setDeathYear, 'deathDate')}
                placeholder="Year"
                className={selectClasses(errors.deathDate)}
                maxLength={4}
              />
            </div>
            {errors.deathDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.deathDate}
              </p>
            )}
            {age !== null && age >= 0 && (
              <p className="text-sm text-memorial-gold dark:text-memorialDark-gold flex items-center gap-1">
                <Check size={14} />
                Lived {age} year{age !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Life Story */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Life Story / Biography <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= maxBioLength) {
                  setBio(e.target.value)
                  if (errors.bio) setErrors(prev => ({ ...prev, bio: null }))
                }
              }}
              rows={8}
              className={`${inputClasses(errors.bio)} resize-y min-h-[150px] max-h-[500px]`}
              placeholder="Share the story of their life..."
            />
            <div className="flex justify-between items-start">
              {errors.bio ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.bio}
                </p>
              ) : (
                <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                  Share stories and special moments that made them unique.
                </p>
              )}
              <span className={`text-sm ${bioLength < minBioLength ? 'text-memorial-textSecondary' : 'text-memorial-gold'}`}>
                {bioLength} / {maxBioLength}
              </span>
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label htmlFor="serviceType" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Service Type
            </label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className={`w-full ${selectClasses(false)}`}
            >
              <option value="ETERNAL ECHO">Eternal Echo (Human)</option>
              <option value="PAWS">Paws But Not Forgotten (Pet)</option>
            </select>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
              Visibility <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border cursor-pointer hover:border-memorial-gold dark:hover:border-memorialDark-gold transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-0.5 w-4 h-4 text-memorial-gold focus:ring-memorial-gold"
                />
                <div>
                  <span className="block font-medium text-memorial-text dark:text-memorialDark-text">Public</span>
                  <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    Anyone can view this memorial
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 rounded-memorial border border-memorial-border dark:border-memorialDark-border cursor-pointer hover:border-memorial-gold dark:hover:border-memorialDark-gold transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-0.5 w-4 h-4 text-memorial-gold focus:ring-memorial-gold"
                />
                <div>
                  <span className="block font-medium text-memorial-text dark:text-memorialDark-text">Private</span>
                  <span className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    Only you can view this memorial
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* AI Voice Tribute Section */}
          <div className="space-y-4 pt-6 border-t border-memorial-divider dark:border-memorialDark-divider">
            <div className="flex items-center gap-2">
              <Mic size={20} className="text-memorial-gold dark:text-memorialDark-gold" />
              <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text">
                AI Voice Tribute
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-memorial-gold/10 text-memorial-gold dark:bg-memorialDark-gold/10 dark:text-memorialDark-gold">
                Optional
              </span>
            </div>
            <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
              Create a personalized voice message that will play on the memorial page.
            </p>

            {/* Voice Message Textarea */}
            <div className="space-y-2">
              <label htmlFor="voiceMessage" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                Voice Message Script
              </label>
              <textarea
                id="voiceMessage"
                value={voiceMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 5000) {
                    setVoiceMessage(e.target.value)
                  }
                }}
                rows={4}
                className={`${inputClasses(false)} resize-y min-h-[100px]`}
                placeholder="Write the message you want the AI voice to read... (e.g., 'We remember you for your kindness, your laugh, and the love you shared with everyone around you.')"
              />
              <div className="flex justify-between">
                <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                  This will be converted to an AI-generated voice.
                </p>
                <span className="text-xs text-memorial-textSecondary">{voiceMessage.length} / 5000</span>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <label htmlFor="voiceMood" className="block text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                Voice Mood
              </label>
              <select
                id="voiceMood"
                value={voiceMood}
                onChange={(e) => setVoiceMood(e.target.value)}
                className={`w-full ${selectClasses(false)}`}
              >
                {MOOD_OPTIONS.map(mood => (
                  <option key={mood.value} value={mood.value}>{mood.label}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateVoice}
              disabled={isGeneratingVoice || !voiceMessage.trim()}
              className="w-full px-6 py-3 rounded-memorial bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt border border-memorial-gold dark:border-memorialDark-gold text-memorial-gold dark:text-memorialDark-gold font-medium hover:bg-memorial-gold/10 dark:hover:bg-memorialDark-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-touch"
            >
              {isGeneratingVoice ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Voice...
                </>
              ) : (
                <>
                  <Mic size={18} />
                  Generate AI Voice
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isGeneratingVoice && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                  <span>Generating voice...</span>
                  <span>{voiceProgress}%</span>
                </div>
                <div className="w-full h-2 bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-memorial-gold to-memorial-gold/70 dark:from-memorialDark-gold dark:to-memorialDark-gold/70 transition-all duration-300 ease-out"
                    style={{ width: `${voiceProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Audio Preview */}
            {generatedAudioUrl && (
              <div className="p-4 rounded-memorial bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt border border-memorial-gold/30 dark:border-memorialDark-gold/30">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="w-12 h-12 rounded-full bg-memorial-gold dark:bg-memorialDark-gold text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-memorial-text dark:text-memorialDark-text">
                      Voice Preview
                    </p>
                    <p className="text-xs text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                      {MOOD_OPTIONS.find(m => m.value === voiceMood)?.label || 'Sentimental'}
                    </p>
                  </div>
                  <Check size={20} className="text-green-500" />
                </div>
                <audio ref={audioRef} src={generatedAudioUrl} className="hidden" />
              </div>
            )}

            {errors.voice && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.voice}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-memorial-divider dark:border-memorialDark-divider">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 rounded-memorial border border-memorial-border dark:border-memorialDark-border text-memorial-text dark:text-memorialDark-text hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors duration-200 font-medium min-h-touch"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isGeneratingVoice}
              className="w-full sm:flex-1 px-6 py-3 rounded-memorial bg-memorial-gold dark:bg-memorialDark-gold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium min-h-touch flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Memorial'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
