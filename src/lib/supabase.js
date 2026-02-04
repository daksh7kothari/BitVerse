import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://romuvpbdyiklfhdzmxez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbXV2cGJkeWlrbGZoZHpteGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODU2MjYsImV4cCI6MjA4NTc2MTYyNn0.uOXfnxVzXFpk2dAQ5pD4Q2hfxdy4fv6Tg7RQh74KacU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
