import type { DbRepository } from "./repository";
import { SupabaseRepository } from "./supabase-repo";

// The Supabase backend is opt-in: it requires DB_BACKEND=supabase AND a
// configured service-role client. Tests, `next build`, and any
// deployment without the service key fall back to the in-memory store
// (the bodies in src/lib/db/index.ts). This keeps the default path
// dependency-free and deterministic.
export function isSupabaseBackend(): boolean {
  if (process.env.DB_BACKEND !== "supabase") return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cached: DbRepository | null = null;

export function getRepo(): DbRepository {
  if (!cached) cached = new SupabaseRepository();
  return cached;
}
