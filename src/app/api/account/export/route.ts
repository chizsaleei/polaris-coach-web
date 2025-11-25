// src/app/api/account/export/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CORE_PATH = "/v1/account/export";

const PASS_THROUGH_HEADERS = [
  "content-type",
  "content-length",
  "content-disposition",
  "content-encoding",
  "cache-control",
] as const;

export async function GET(request: NextRequest) {
  const user = await requireUser("/login");

  // Build core URL and strip any userId query param (we trust auth, not query).
  const url = new URL(request.url);
  url.searchParams.delete("userId");
  const coreUrl = joinCoreUrl(CORE_PATH, url.search);

  const requestId = crypto.randomUUID();
  const headers = new Headers({
    "x-user-id": user.id,
    "x-request-id": requestId,
    // Force identity encoding so we can stream the raw body without re‑compression.
    "accept-encoding": "identity",
  });

  // Forward locale for logging/formatting only.
  const locale = request.headers.get("accept-language");
  if (locale) headers.set("accept-language", locale);

  let coreResponse: Response;
  try {
    coreResponse = await fetch(coreUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[account/export] core fetch failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "export_unreachable",
        message: "We could not reach the export service. Try again shortly.",
        requestId,
      },
      { status: 503 },
    );
  }

  if (!coreResponse.ok || !coreResponse.body) {
    const payload = await readCoreError(coreResponse);
    return NextResponse.json(
      {
        ok: false,
        error: payload?.error?.code || "export_failed",
        message: payload?.error?.message || "Could not generate export.",
        requestId: payload?.requestId || requestId,
      },
      { status: coreResponse.status || 500 },
    );
  }

  const outgoingHeaders = new Headers();
  for (const header of PASS_THROUGH_HEADERS) {
    const value = coreResponse.headers.get(header);
    if (value) outgoingHeaders.set(header, value);
  }
  outgoingHeaders.set(
    "x-request-id",
    coreResponse.headers.get("x-request-id") ?? requestId,
  );
  // Ensure exports are never cached by intermediaries.
  outgoingHeaders.set("cache-control", "no-store");

  return new NextResponse(coreResponse.body, {
    status: coreResponse.status,
    headers: outgoingHeaders,
  });
}

async function readCoreError(response: Response) {
  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      return data as {
        error?: { code?: string; message?: string };
        requestId?: string;
      };
    }
  } catch {
    // Non‑JSON error; ignore and fall back to generic copy.
  }
  return null;
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
    throw new Error(`Missing environment variable ${name} for account export route`);
  }
  return value;
}
