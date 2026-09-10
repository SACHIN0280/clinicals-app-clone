import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.CONFIG_SUPABASE_URL || 'https://eknkbtetsxvqclxezzou.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.CONFIG_SUPABASE_ANON_KEY || 'sb_publishable_m-eRRoQQBisvpJ1sLlC2aQ_rv7cZn2u'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

