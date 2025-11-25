// src/app/api/realtime/token/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const CORE_PATH = "/api/realtime/token";

export async function GET(request: NextRequest) {
  const user = await requireUser("/login");

  const url = new URL(request.url);
  const coreUrl = joinCoreUrl(CORE_PATH, url.search);

  const headers = new Headers();
  // Forward auth context for core auth middleware
  headers.set("x-user-id", user.id);
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "host" || k === "content-length") return;
    headers.set(key, value);
  });

  try {
    const coreRes = await fetch(coreUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const text = await coreRes.text();
    if (!coreRes.ok) {
      logger.error("realtime_token_core_error", {
        status: coreRes.status,
        body: text,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "realtime_token_failed",
          message: "Unable to mint realtime token.",
        },
        { status: coreRes.status || 502 },
      );
    }

    type RealtimeTokenResponse = {
      ok?: boolean
      data?: {
        client_secret?: unknown
        model?: string | null
        [key: string]: unknown
      }
      [key: string]: unknown
    }

    let json: RealtimeTokenResponse
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_core_response",
          message: "Realtime token endpoint returned invalid JSON.",
        },
        { status: 502 },
      );
    }

    const clientSecret = json?.data?.client_secret;
    const model = json?.data?.model;

    if (!isClientSecretPayload(clientSecret)) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing_client_secret",
          message: "Realtime token missing client_secret.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      client_secret: clientSecret,
      model: model || process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview",
    });
  } catch (err) {
    logger.error("realtime_token_core_unreachable", { error: String(err) });
    return NextResponse.json(
      {
        ok: false,
        error: "core_unreachable",
        message: "Unable to mint realtime token.",
      },
      { status: 503 },
    );
  }
}

function joinCoreUrl(path: string, search: string) {
  const base = requireEnv("POLARIS_CORE_BASE_URL");
  const separator = base.endsWith("/") ? "" : "/";
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${separator}${normalizedPath}${search ?? ""}`;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name} for realtime token route`);
  }
  return value;
}

function isClientSecretPayload(value: unknown): value is { value: string } {
  if (!value || typeof value !== "object") return false;
  return typeof (value as { value?: unknown }).value === "string";
}
