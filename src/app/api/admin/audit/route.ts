// src/app/api/admin/audit/route.ts
import { NextRequest, NextResponse } from "next/server";

import { corePost, CoreError, idempotencyKey } from "@/lib/fetch-core";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Lightweight audit / analytics sink.
 * `lib/analytics.ts` posts events here as a fallback endpoint.
 * This route forwards the event to Polaris Core and returns a simple JSON status.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? idempotencyKey();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_json",
        message: "Request body must be valid JSON.",
        requestId,
      },
      { status: 400 },
    );
  }

  try {
    await corePost("/v1/admin/audit", body, {
      headers: {
        "idempotency-key": requestId,
      },
      cache: "no-store",
    });

    return NextResponse.json(
      {
        ok: true,
        requestId,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof CoreError) {
      logger.error("admin_audit_core_failed", {
        code: err.code,
        status: err.status,
        requestId: err.requestId ?? requestId,
      });
      return NextResponse.json(
        {
          ok: false,
          error: err.code || "core_error",
          message: err.message,
          requestId: err.requestId ?? requestId,
        },
        { status: err.status || 502 },
      );
    }

    logger.error("admin_audit_unexpected_error", { requestId, error: String(err) });
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_error",
        message: "Unable to record audit event.",
        requestId,
      },
      { status: 502 },
    );
  }
}
