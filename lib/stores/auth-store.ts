import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase-client'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  initialize: () => Promise<void>
}

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Secure`;
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,
      setSession: (session) => {
        console.log('Auth Store - Setting session:', { session });
        set({ session, user: session?.user ?? null });
      },
      setUser: (user) => {
        console.log('Auth Store - Setting user:', { user });
        set({ user });
      },
      setLoading: (loading) => {
        console.log('Auth Store - Setting loading:', { loading });
        set({ loading });
      },
      initialize: async (): Promise<void> => {
        console.log('Auth Store - Initializing...');
        try {
          // Setup auth state change listener first
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth Store - Auth state changed:', { event, session });
              const currentSession = get().session;
              
              // Only update if there's an actual change to prevent unnecessary re-renders
              if (JSON.stringify(session) !== JSON.stringify(currentSession)) {
                if (session) {
                  set({ session, user: session.user, loading: false });
                } else if (event === 'SIGNED_OUT') {
                  set({ session: null, user: null, loading: false });
                }
              }
            }
          );

          // Then try to recover the session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth Store - Error getting session:', error);
            set({ session: null, user: null, loading: false });
            return;
          }

          if (session) {
            console.log('Auth Store - Found existing session:', session);
            // Force a session refresh to ensure cookies are properly set
            await supabase.auth.refreshSession();
            set({ session, user: session.user, loading: false });
          } else {
            console.log('Auth Store - No session found');
            set({ session: null, user: null, loading: false });
          }

          subscription.unsubscribe();
        } catch (error) {
          console.error('Auth Store - Initialization error:', error);
          set({ session: null, user: null, loading: false });
        }
      },
      signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
          console.log('Auth Store - Signing in...');
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          console.log('Auth Store - Sign in successful');
          
          // Add explicit redirect after successful sign in
          if (typeof window !== 'undefined') {
            window.location.href = '/chat';
          }
          
        } catch (error) {
          console.error('Auth Store - Sign in error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      signUp: async (email: string, password: string) => {
        set({ loading: true });
        try {
          console.log('Auth Store - Signing up...');
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          set({ session: data.session, user: data.user });
          
          // Force a session refresh to ensure cookies are set
          if (data.session) {
            await supabase.auth.refreshSession();
          }
          console.log('Auth Store - Sign up successful');
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        set({ loading: true });
        try {
          console.log('Auth Store - Signing out...');
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ session: null, user: null });
          console.log('Auth Store - Sign out successful');
        } finally {
          set({ loading: false });
        }
      },
      refreshSession: async () => {
        console.log('Auth Store - Refreshing session...');
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (!error && session) {
          set({ session, user: session.user, loading: false });
        } else {
          await get().initialize();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ session: state.session, user: state.user }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth Store - Rehydrated state:', state);
        // Initialize the session after rehydration
        useAuthStore.getState().initialize();
      }
    }
  )
);

