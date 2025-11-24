/**
 * Polaris Coach Web — API proxy for Practice Now
 *
 * Forwards POST requests to the core service at /adaptive/next-item,
 * attaching the authenticated user id and optional API key.
 *
 * Env:
 *   CORE_API_URL   — base URL of polaris-core (default http://localhost:8787)
 *   CORE_API_KEY   — optional shared secret for the core service
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:8787";
const CORE_API_KEY = process.env.CORE_API_KEY || "";

export const runtime = "nodejs"; // ensure Node runtime
export const dynamic = "force-dynamic"; // do not cache

export async function POST(req: NextRequest) {
  try {
    const body = await safeJson(req);

    // Resolve user id from Supabase auth; fall back to header for local tools
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Missing user session" },
        { status: 401 },
      );
    }

    // Forward to core
    const url = new URL("/adaptive/next-item", CORE_API_URL).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(CORE_API_KEY ? { "x-api-key": CORE_API_KEY } : {}),
        "x-user-id": userId,
      },
      body: JSON.stringify({
        count: clampInt(body?.count, 1, 5, 1),
        lru: Array.isArray(body?.lru) ? body.lru.slice(0, 50) : [],
        lastSelectedId: typeof body?.lastSelectedId === "string" ? body.lastSelectedId : undefined,
        filters: normalizeFilters(body?.filters || {}),
      }),
      signal: controller.signal,
      // No Next.js fetch caching for downstream core call
      cache: "no-store",
    });

    clearTimeout(timeout);

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // keep raw text when core returns non JSON
      data = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "core_error", status: res.status, data },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "upstream timeout" : String(err?.message || err);
    return NextResponse.json({ error: "proxy_error", message: msg }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function getUserId(): Promise<string | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const id = data?.user?.id ? String(data.user.id) : null;
    return id;
  } catch {
    return null;
  }
}

async function safeJson(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function clampInt(v: any, min: number, max: number, d: number): number {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return d;
  return Math.max(min, Math.min(max, n));
}

function normalizeFilters(f: any) {
  return {
    coach: arr(f?.coach, 10),
    topic: arr(f?.topic, 10),
    skill: arr(f?.skill, 10),
    format: arr(f?.format, 10),
    difficultyMin: clampInt(f?.difficultyMin, 1, 5, 1),
    difficultyMax: clampInt(f?.difficultyMax, 1, 5, 5),
    language: typeof f?.language === "string" ? f.language : undefined,
  } as const;
}

function arr(v: any, max = 20) {
  return Array.isArray(v) ? v.filter(Boolean).slice(0, max) : undefined;
}
