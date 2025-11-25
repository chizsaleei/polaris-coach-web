// src/lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

type ServerSupabaseClient = SupabaseClient<unknown>;

function getAccessTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return (
    cookieStore.get("sb-access-token")?.value ||
    cookieStore.get("supabase-auth-token")?.value ||
    null
  );
}

/**
 * Server side client bound to Next cookies.
 * Works in server components and route handlers.
 *
 * Uses anon key plus the user's access token (from cookies) so that
 * RLS policies still apply on the database.
 */
export function getSupabaseServerClient(): ServerSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase client",
    );
  }

  const accessToken = getAccessTokenFromCookies();

  const client = createClient<unknown>(url, anonKey, {
    global: {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        "x-forwarded-for": headers().get("x-forwarded-for") ?? "",
        "user-agent": headers().get("user-agent") ?? "",
      },
    },
    auth: {
      persistSession: false,
    },
  });

  return client;
}

export type ServerSession = {
  access_token: string;
  user?: User;
  // Extra fields are allowed but not required by callers
  [key: string]: unknown;
};

/**
 * Fetch current session on the server.
 * Returns a minimal session object with access_token and user.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) return null;

  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) return null;

    return {
      access_token: accessToken,
      user: data.user ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch current user on the server.
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Redirect to /login if no user.
 */
export async function requireUser(redirectTo = "/login") {
  const user = await getServerUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Simple admin check using your SQL helper.
 * You have an is_admin SQL helper in policies. This calls it.
 */
export async function requireAdmin(redirectTo = "/") {
  const supabase = getSupabaseServerClient();
  const user = await getServerUser();
  if (!user) redirect("/login");

  // Prefer RPC if you published a SECURITY DEFINER function is_admin()
  const { data, error } = await supabase.rpc("is_admin");
  if (error || !data) redirect(redirectTo);

  return user;
}
