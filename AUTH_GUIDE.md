# Authentication Guide for Frontend Implementation

## Overview

The API uses JWT-based authentication via Supabase. All protected endpoints require a valid JWT token in the Authorization header.

## Authentication Flow

1. **Initialize Supabase Client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

2. **Handle User Sign In**
```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  // Store the session
  return data.session
}
```

3. **Store Authentication State**
```typescript
// auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  session: Session | null
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

## Making Authenticated Requests

### Example: Fetching Chat Sessions

1. **Using fetch**
```typescript
async function getChatSessions() {
  const session = useAuthStore.getState().session
  
  if (!session?.access_token) {
    throw new Error('No active session')
  }

  const response = await fetch('/api/chat/sessions', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch sessions')
  }

  return response.json()
}
```

2. **Using Axios with Interceptor**
```typescript
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api'
})

// Add auth interceptor
api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

// Use in components
async function getChatSessions() {
  const { data } = await api.get('/chat/sessions')
  return data
}
```

3. **Using React Query**
```typescript
import { useQuery } from '@tanstack/react-query'

function useChatSessions() {
  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const session = useAuthStore.getState().session
      if (!session?.access_token) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      return response.json()
    },
    // Only fetch if we have a session
    enabled: !!useAuthStore.getState().session
  })
}
```

## Session Management

1. **Handle Session Changes**
```typescript
// _app.tsx or layout.tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      useAuthStore.getState().setSession(session)
      
      if (event === 'SIGNED_OUT') {
        // Clear any cached data
        queryClient.clear()
      }
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

2. **Auto-refresh Session**
```typescript
// utils/supabase.ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().setSession(session)
  }
})
```

## Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and on protected route, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/chat/:path*']
}
```

## Error Handling

```typescript
// types/api.ts
interface ApiError {
  detail: string
}

// utils/api.ts
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    typeof (error as ApiError).detail === 'string'
  )
}

// Example usage
try {
  await getChatSessions()
} catch (error) {
  if (isApiError(error)) {
    // Handle API error
    toast.error(error.detail)
  } else if (error instanceof Error) {
    // Handle other errors
    toast.error(error.message)
  }
}
```

## Response Types

```typescript
// types/api.ts
interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  system_prompt: string | null
  memory_key: string | null
  last_context: Record<string, any> | null
  metadata: Record<string, any>
  relevant_documents: Array<{
    document_id: string
    chunk_index: number
    document_name: string
    page_number: number | null
  }>
  messages: Array<{
    id: string
    session_id: string
    user_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
    cited_documents: Array<{
      document_id: string
      chunk_index: number
      document_name: string
      page_number: number | null
    }>
    metadata: Record<string, any>
  }>
}

interface ChatSessionListResponse {
  sessions: ChatSession[]
  total_count: number
}
```

## Common Issues

1. **Token Not Found**
   - Check if user is signed in
   - Verify session is properly stored
   - Ensure token is included in request headers

2. **Token Expired**
   - Supabase handles token refresh automatically
   - Check if refresh token is still valid
   - Redirect to login if refresh fails

3. **CORS Issues**
   - Ensure API URL is properly configured
   - Check CORS settings on backend
   - Verify request headers

4. **Network Errors**
   - Implement retry logic for failed requests
   - Add proper error handling
   - Show user-friendly error messages 