// src/lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

type EdgeSupabaseClient = SupabaseClient<unknown>;

/**
 * Build a Supabase client for Edge Middleware or edge route handlers.
 * Uses the anon key and attaches the user's access token (from cookies)
 * as an Authorization header so RLS still applies.
 */
export function getSupabaseForMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<unknown>({ req, res });
  return { supabase, res };
}

/**
 * Helper to protect edge paths in root middleware.ts:
 *
 * import { protectEdgePath } from "@/lib/supabase/middleware";
 * export async function middleware(req: NextRequest) {
 *   return protectEdgePath(req, ["/dashboard", "/chat", "/explore"]);
 * }
 */
function buildLoginRedirect(req: NextRequest, url: URL) {
  const login = new URL("/login", req.url);
  const nextPath = url.pathname + (url.search || "");
  if (nextPath.startsWith("/")) {
    login.searchParams.set("next", nextPath);
  }
  return login;
}

export async function protectEdgePath(
  req: NextRequest,
  prefixes: string[],
) {
  const url = new URL(req.url);
  const needsAuth = prefixes.some((p) => url.pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const { supabase, res } = getSupabaseForMiddleware(req);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(buildLoginRedirect(req, url));
  }

  // User is authenticated; continue with the modified response.
  return res;
}

/**
 * API guard for Route Handlers that want quick JSON errors instead of redirects.
 * Use inside a route handler that runs on edge runtime.
 */
export async function withEdgeAuth(
  req: NextRequest,
  handler: (ctx: {
    supabase: EdgeSupabaseClient;
    userId: string;
  }) => Promise<Response>,
) {
  const { supabase } = getSupabaseForMiddleware(req);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Pass the edge-configured Supabase client and user id to your handler.
  return handler({ supabase, userId: user.id });
}
