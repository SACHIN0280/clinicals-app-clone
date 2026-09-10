import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.CONFIG_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.CONFIG_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('[Clinicals] Supabase env vars not set. Please set them.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

