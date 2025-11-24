// src/lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type EdgeSupabaseClient = SupabaseClient<any>;

/**
 * Build a Supabase client for Edge Middleware or edge route handlers.
 * Uses the anon key and attaches the user's access token (from cookies)
 * as an Authorization header so RLS still applies.
 */
export function getSupabaseForMiddleware(req: NextRequest) {
  const res = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase edge client",
    );
  }

  // Common cookie names used by Supabase auth helpers.
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("supabase-auth-token")?.value ||
    undefined;

  const supabase = createClient<any>(url, anonKey, {
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    },
    auth: {
      persistSession: false,
    },
  });

  return { supabase, res, accessToken };
}

/**
 * Helper to protect edge paths in root middleware.ts:
 *
 * import { protectEdgePath } from "@/lib/supabase/middleware";
 * export async function middleware(req: NextRequest) {
 *   return protectEdgePath(req, ["/dashboard", "/chat", "/explore"]);
 * }
 */
export async function protectEdgePath(
  req: NextRequest,
  prefixes: string[],
) {
  const url = new URL(req.url);
  const needsAuth = prefixes.some((p) => url.pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const { supabase, res, accessToken } = getSupabaseForMiddleware(req);

  // No access token means no authenticated user.
  if (!accessToken) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", url.pathname);
    return NextResponse.redirect(login);
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", url.pathname);
    return NextResponse.redirect(login);
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
  const { supabase, accessToken } = getSupabaseForMiddleware(req);

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Pass the edge-configured Supabase client and user id to your handler.
  return handler({ supabase, userId: data.user.id });
}
