
import { createClient } from '@supabase/supabase-js';

// Access environment variables directly in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL to prevent crash on startup
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE') || !supabaseUrl.startsWith('http');

const urlToUse = isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl;
const keyToUse = isPlaceholder ? 'placeholder' : supabaseAnonKey;

if (isPlaceholder) {
    console.warn('Using Placeholder Supabase Client. Database features will NOT work.');
}

export const supabase = createClient(urlToUse, keyToUse);
