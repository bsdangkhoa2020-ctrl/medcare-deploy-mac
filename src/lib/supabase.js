import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tnehhratorbrxjwzqnds.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LOy3f6W1wHHYsMIlr_zvxQ_gruUztNP';

export const supabase = createClient(supabaseUrl, supabaseKey);
