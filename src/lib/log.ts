import { after } from "next/server";

/**
 * Structured logging to Better Stack.
 *
 * Every entry is also written to stdout as one JSON line, so logs stay readable
 * locally and in Vercel's own log view when Better Stack is not configured.
 * Shipping happens inside `after()`, so it never adds latency to a response.
 */

export type LogLevel = "info" | "warn" | "error";
export type LogFields = Record<string, unknown>;

const INGEST_URL = process.env.BETTERSTACK_INGEST_URL;
const SOURCE_TOKEN = process.env.BETTERSTACK_SOURCE_TOKEN;

function buildEntry(level: LogLevel, message: string, fields: LogFields) {
  return {
    dt: new Date().toISOString(),
    level,
    message,
    service: "narra",
    env: process.env.VERCEL_ENV ?? "development",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    ...fields,
  };
}

async function ship(entry: ReturnType<typeof buildEntry>) {
  if (!INGEST_URL || !SOURCE_TOKEN) return;
  try {
    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SOURCE_TOKEN}` },
      body: JSON.stringify(entry),
    });
    if (!res.ok) console.error(`[log] Better Stack ingest failed: ${res.status}`);
  } catch (err) {
    console.error("[log] Better Stack ingest error", err);
  }
}

export function log(level: LogLevel, message: string, fields: LogFields = {}) {
  const entry = buildEntry(level, message, fields);
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
  after(() => ship(entry));
}

type RouteContext = {
  requestId: string;
  /** Add fields here (tokens, cost, cache hit) and they land in the request's log entry. */
  fields: LogFields;
};

/**
 * Wraps a route handler with timing, a request id and one structured log entry per request.
 */
export function withLogging(route: string, handler: (req: Request, ctx: RouteContext) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const start = performance.now();
    const ctx: RouteContext = { requestId, fields: {} };
    const base = { request_id: requestId, route, method: req.method };

    try {
      const res = await handler(req, ctx);
      const status = res.status;
      log(status >= 500 ? "error" : status >= 400 ? "warn" : "info", `${req.method} ${route} ${status}`, {
        ...base,
        status,
        duration_ms: Math.round(performance.now() - start),
        ...ctx.fields,
      });
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (err) {
      log("error", `${req.method} ${route} 500`, {
        ...base,
        status: 500,
        duration_ms: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : String(err),
        ...ctx.fields,
      });
      return Response.json(
        { error: "Etwas ist schiefgelaufen. Bitte versuch es gleich nochmal." },
        { status: 500, headers: { "x-request-id": requestId } },
      );
    }
  };
}
