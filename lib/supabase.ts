import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage instead of localStorage (which doesn't exist in React Native)
    // This keeps the user logged in between app restarts
    storage: AsyncStorage,
    // Automatically refresh the session token before it expires
    autoRefreshToken: true,
    // Persist the session to AsyncStorage so the user stays logged in
    persistSession: true,
    // Disable the browser-based OAuth flow detection (not relevant in native apps)
    detectSessionInUrl: false,
  },
});
