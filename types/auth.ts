import { Session } from '@supabase/supabase-js'

export interface AuthState {
  session: Session | null;
}

