// src/app/api/admin/users/[id]/progress/route.ts
import { NextRequest, NextResponse } from "next/server";

import { coreGet, CoreError } from "@/lib/fetch-core";
import { requireAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Admin-only proxy to fetch a user's progress snapshot from Polaris Core.
 * Example core route: GET /v1/admin/users/:id/progress
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin("/login");
  const userId = params.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "missing_user_id", message: "User id is required." },
      { status: 400 },
    );
  }

  const search: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    if (value != null && value !== "") {
      search[key] = value;
    }
  });

  try {
    const data = await coreGet<unknown>(
      `/v1/admin/users/${encodeURIComponent(userId)}/progress`,
      {
        headers: {
          "x-admin-id": admin.id,
        },
        cache: "no-store",
        search,
      },
    );

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    if (err instanceof CoreError) {
      logger.error("admin_user_progress_core_failed", {
        code: err.code,
        status: err.status,
        requestId: err.requestId,
        userId,
      });
      return NextResponse.json(
        {
          ok: false,
          error: err.code || "core_error",
          message: err.message,
          requestId: err.requestId,
        },
        { status: err.status || 502 },
      );
    }

    logger.error("admin_user_progress_unexpected_error", {
      userId,
      error: String(err),
    });
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_error",
        message: "Unable to load user progress.",
      },
      { status: 500 },
    );
  }
}
