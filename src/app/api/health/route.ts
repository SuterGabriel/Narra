import { withLogging } from "@/lib/log";

// Uptime monitors must always hit a fresh function, never a cached response.
export const dynamic = "force-dynamic";

export const GET = withLogging("/api/health", async () => {
  return Response.json(
    {
      status: "ok",
      time: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
