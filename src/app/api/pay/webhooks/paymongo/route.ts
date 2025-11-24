// src/app/api/pay/webhooks/paymongo/route.ts
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const CORE_PATH = "/api/pay/webhooks/paymongo";

/**
 * PayMongo webhook entrypoint for the web app.
 * Forwards the raw request (headers + body) to Polaris Core, which:
 * - Verifies signatures
 * - Normalizes events
 * - Updates entitlements and ledger
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const coreUrl = joinCoreUrl(CORE_PATH, url.search);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    logger.error("paymongo_webhook_read_body_failed", { error: String(err) });
    return NextResponse.json(
      { ok: false, error: "invalid_body", message: "Unable to read request body." },
      { status: 400 },
    );
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "host" || k === "content-length") return;
    headers.set(key, value);
  });

  try {
    const coreRes = await fetch(coreUrl, {
      method: "POST",
      headers,
      body: rawBody,
      cache: "no-store",
    });

    const contentType = coreRes.headers.get("content-type") || "application/json";
    const text = await coreRes.text();

    return new NextResponse(text, {
      status: coreRes.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    logger.error("paymongo_webhook_core_unreachable", { error: String(err) });
    return NextResponse.json(
      {
        ok: false,
        error: "core_unreachable",
        message: "Unable to process webhook at this time.",
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
    throw new Error(`Missing environment variable ${name} for PayMongo webhook route`);
  }
  return value;
}
