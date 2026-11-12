import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xszbrilstoutiyksdasl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jOUIW8UWnTkWbAKbGhLTJA_P6eHnrcH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
