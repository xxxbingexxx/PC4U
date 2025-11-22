
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and Anon Key
const SUPABASE_URL = 'https://jnpgrhzqnmwxgmdwigun.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucGdyaHpxbm13eGdtZHdpZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTkwNDYsImV4cCI6MjA3OTM5NTA0Nn0.U5NUur0CfndQ3HFp99GWWRIfQr1uKLk1cghVc9uTy1o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
