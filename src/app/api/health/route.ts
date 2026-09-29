import { checkDb } from "@/lib/db";
import { withLogging } from "@/lib/log";

// Uptime monitors must always hit a fresh function, never a cached response.
export const dynamic = "force-dynamic";

export const GET = withLogging("/api/health", async (_req, ctx) => {
  const database = await checkDb();
  ctx.fields.db_status = database.status;
  ctx.fields.db_latency_ms = database.latency_ms;
  if (database.error) ctx.fields.error = database.error;

  // A broken database is an outage for the uptime monitor; an unconfigured one is not (local dev).
  const healthy = database.status !== "error";

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      time: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      // Error details go to the log only, never to the public response.
      checks: { database: { status: database.status, latency_ms: database.latency_ms } },
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
});
