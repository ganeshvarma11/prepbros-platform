import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yhnbkwyakgebycfphzrk.supabase.co'
const supabaseKey = 'sb_publishable_9_JHn91N7yUa6IU4ki_Y_w_ENeAXFAE'

export const supabase = createClient(supabaseUrl, supabaseKey)