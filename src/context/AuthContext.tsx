'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    requireAuth: (redirectTo?: string) => boolean
    navigateToCreateMemorial: () => boolean
    mounted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Handle client-side mount to prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [mounted, supabase.auth])

    // Function to check if user is authenticated and redirect if not
    const requireAuth = (redirectTo = '/login'): boolean => {
        if (!loading && !user) {
            router.push(redirectTo)
            return false
        }
        return true
    }

    // Navigate to create memorial with auth check
    const navigateToCreateMemorial = (): boolean => {
        if (!mounted) return false

        if (!user) {
            router.push('/login?redirect=/create-memorial')
            return false
        }
        router.push('/create-memorial')
        return true
    }

    const value: AuthContextType = {
        user,
        loading: loading || !mounted,
        isAuthenticated: !!user,
        requireAuth,
        navigateToCreateMemorial,
        mounted,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
