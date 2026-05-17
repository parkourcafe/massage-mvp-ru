import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Returns a Supabase client when configured, otherwise null. The app
// falls back to the in-memory demo repository so the build, tests and
// local exploration work without external services.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && (anon || service));

export function getServiceClient(): SupabaseClient | null {
  if (!url || !service) return null;
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getAnonClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
