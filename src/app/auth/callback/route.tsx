import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSetFromSupabase) {
                        cookiesToSetFromSupabase.forEach((c) =>
                            cookiesToSet.push({
                                name: c.name,
                                value: c.value,
                                options: c.options as Record<string, unknown>,
                            })
                        )
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback error:', error.message)
            const loginUrl = new URL('/login', requestUrl.origin)
            loginUrl.searchParams.set('error', error.message)
            return NextResponse.redirect(loginUrl)
        }

        // Build redirect URL (allow only relative paths for safety)
        let redirectTo = next.startsWith('/') ? next : '/dashboard'

        // Redirect admin to admin dashboard
        if (data?.session?.user?.email === 'asnor023@gmail.com') {
            redirectTo = '/admin'
        }

        const redirectUrl = new URL(redirectTo, requestUrl.origin)

        const response = NextResponse.redirect(redirectUrl)

        // Apply session cookies to the redirect response so the browser receives them
        for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, {
                path: (options.path as string) ?? '/',
                maxAge: options.maxAge as number | undefined,
                expires: options.expires as Date | undefined,
                httpOnly: (options.httpOnly as boolean) ?? true,
                secure: (options.secure as boolean) ?? process.env.NODE_ENV === 'production',
                sameSite: (options.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
            })
        }

        return response
    }

    // No code: redirect to login (e.g. user landed on callback by mistake)
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
