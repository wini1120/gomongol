import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pqhwfsfpyfcvijnusaht.supabase.co' // 본인의 URL로 교체
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaHdmc2ZweWZjdmlqbnVzYWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzQ1NjcsImV4cCI6MjA4NjAxMDU2N30.On9-7YehhGELjeoK2PgD1anDPoo__lb9bFsJowGCyKQ' // 본인의 Anon Key로 교체

export const supabase = createClient(supabaseUrl, supabaseAnonKey)