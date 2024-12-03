import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next()
    
    // Create supabase client with both req and res
    const supabase = createMiddlewareClient({ req, res })
    
    console.log('Middleware - Checking session...')
    
    // Refresh the session and get the latest data
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware - Session error:', error)
    }
    
    console.log('Middleware - Current path:', req.nextUrl.pathname)
    console.log('Middleware - Has session:', !!session)
    console.log('Middleware - Cookies:', req.cookies.toString())

    // If no session and trying to access protected route, redirect to login
    if (!session && (
      req.nextUrl.pathname.startsWith('/chat') ||
      req.nextUrl.pathname.startsWith('/documents')
    )) {
      console.log('Middleware - Redirecting to login')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If has session and on login page, redirect to intended destination or chat
    if (session && (
      req.nextUrl.pathname === '/login'
    )) {
      console.log('Middleware - Redirecting to chat')
      const redirectTo = req.nextUrl.searchParams.get('redirect') || '/chat'
      const redirectUrl = new URL(redirectTo, req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Return the response with the session cookie
    return res
  } catch (e) {
    console.error('Middleware - Error:', e)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/login', '/chat/:path*', '/documents/:path*'],
} 