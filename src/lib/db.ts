import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 * Never import this from a client component: the key bypasses row level security.
 */

let client: SupabaseClient | null = null;

export function isDbConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function db(): SupabaseClient {
  if (!isDbConfigured()) throw new Error("Supabase is not configured");
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export type DbHealth = { status: "ok" | "error" | "not_configured"; latency_ms?: number; error?: string };

/** Cheapest possible round trip. Also keeps a free-tier project from pausing when pinged by the uptime monitor. */
export async function checkDb(): Promise<DbHealth> {
  if (!isDbConfigured()) return { status: "not_configured" };
  const start = performance.now();
  const { error } = await db().from("ai_requests").select("id", { head: true }).limit(1);
  const latency_ms = Math.round(performance.now() - start);
  return error ? { status: "error", latency_ms, error: error.message } : { status: "ok", latency_ms };
}
