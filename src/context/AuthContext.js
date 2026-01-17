'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Handle client-side mount to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [mounted, supabase.auth]);

    // Function to check if user is authenticated and redirect if not
    const requireAuth = (redirectTo = '/login') => {
        if (!loading && !user) {
            router.push(redirectTo);
            return false;
        }
        return true;
    };

    // Navigate to create memorial with auth check
    const navigateToCreateMemorial = () => {
        if (!mounted) return false;

        if (!user) {
            router.push('/login?redirect=/create-memorial');
            return false;
        }
        router.push('/create-memorial');
        return true;
    };

    const value = {
        user,
        loading: loading || !mounted,
        isAuthenticated: !!user,
        requireAuth,
        navigateToCreateMemorial,
        mounted,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
