// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/auth-code-error", url.origin));
  }

  const supabase = getSupabaseServerClient();

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      logger.error("auth_callback_exchange_failed", { message: error.message });
      return NextResponse.redirect(new URL("/auth-code-error", url.origin));
    }
  } catch (err) {
    logger.error("auth_callback_unexpected_error", { error: String(err) });
    return NextResponse.redirect(new URL("/auth-code-error", url.origin));
  }

  // Optional "next" parameter, constrained to same-origin paths.
  let redirectPath = "/dashboard";
  if (nextParam && nextParam.startsWith("/")) {
    redirectPath = nextParam;
  }

  return NextResponse.redirect(new URL(redirectPath, url.origin));
}
