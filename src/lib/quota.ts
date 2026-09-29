import "server-only";
import { createHash } from "node:crypto";
import { db, isDbConfigured } from "@/lib/db";

/**
 * Daily limits for paid AI calls, enforced atomically in Postgres (public.consume_quota):
 * a per-client counter and a global daily budget in USD. Clients are identified by a salted
 * hash of their IP, so no IP address is ever stored.
 */

const PER_CLIENT = Number(process.env.ASK_PER_CLIENT_DAILY ?? 30);
const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD ?? 5);

export type QuotaResult =
  | { allowed: true; used?: number; spentUsd?: number }
  | { allowed: false; reason: "client_limit" | "daily_budget" | "not_configured" | "error" };

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "narra-dev";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function consumeQuota(req: Request): Promise<QuotaResult> {
  if (!isDbConfigured()) {
    // Without a database there is no limit. That is fine locally, never in production.
    return process.env.VERCEL_ENV === "production" ? { allowed: false, reason: "not_configured" } : { allowed: true };
  }
  const { data, error } = await db().rpc("consume_quota", {
    p_ip_hash: hashIp(clientIp(req)),
    p_per_client_limit: PER_CLIENT,
    p_daily_budget_usd: DAILY_BUDGET_USD,
  });
  if (error) return { allowed: false, reason: "error" };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.allowed) return { allowed: false, reason: row?.reason === "daily_budget" ? "daily_budget" : "client_limit" };
  return { allowed: true, used: row.used, spentUsd: Number(row.spent_usd) };
}

export type RequestRecord = {
  request_id: string;
  route: string;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  characters?: number;
  cost_usd?: number;
  duration_ms: number;
  status: number;
  error?: string;
};

/** One row per paid request: the source for the daily budget and the cost dashboard. */
export async function recordRequest(r: RequestRecord) {
  if (!isDbConfigured()) return;
  const { error } = await db().from("ai_requests").insert(r);
  if (error) console.error("[quota] failed to record request", error.message);
}

export const quotaMessages: Record<Exclude<QuotaResult, { allowed: true }>["reason"], string> = {
  client_limit: `Du hast heute schon ${PER_CLIENT} Fragen gestellt. Morgen geht es weiter. Bis dahin helfen Überblick, Quiz und Karteikarten.`,
  daily_budget: "Das Tagesbudget für Fragen ist aufgebraucht. Morgen geht es weiter. Überblick, Quiz und Karteikarten funktionieren weiterhin.",
  not_configured: "Die Frage-Funktion ist noch nicht vollständig eingerichtet.",
  error: "Das Limit konnte gerade nicht geprüft werden. Bitte versuch es gleich nochmal.",
};
