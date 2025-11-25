// src/app/api/account/delete/route.ts
import { NextRequest, NextResponse } from "next/server";

import { corePost, CoreError, idempotencyKey } from "@/lib/fetch-core";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type KnownDeleteJobStatus = "queued" | "running" | "finished" | "failed" | "canceled";
type DeleteJobStatus = KnownDeleteJobStatus | (string & {});

type DeleteJob = {
  id: string;
  status: DeleteJobStatus;
  scheduled_at?: string | null;
  created_at?: string | null;
  finished_at?: string | null;
  error?: string | null;
};

type DeleteStatusResponse = {
  ok: boolean;
  job: DeleteJob | null;
};

export async function POST(req: NextRequest) {
  const user = await requireUser("/login");

  let body: { confirm?: string; reason?: string; scheduleAt?: string | null } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_json",
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const confirm = (body.confirm || "").trim();
  if (confirm !== "DELETE") {
    return NextResponse.json(
      {
        ok: false,
        error: "confirmation_required",
        message: 'You must send confirm="DELETE" to queue account deletion.',
      },
      { status: 400 },
    );
  }

  const payload = {
    confirm: "DELETE",
    reason: body.reason?.trim() || undefined,
    scheduleAt: body.scheduleAt || undefined,
  };

  try {
    const res = await corePost<DeleteStatusResponse | { ok?: boolean; job?: unknown }>(
      "/v1/account/delete",
      payload,
      {
        headers: {
          "x-user-id": user.id,
          "idempotency-key": idempotencyKey(),
        },
        cache: "no-store",
      },
    );

    const ok = typeof res.ok === "boolean" ? res.ok : true;
    const jobData = "job" in res ? res.job : null;
    const job =
      jobData && typeof jobData === "object" ? (jobData as DeleteJob) : null;

    return NextResponse.json(
      {
        ok,
        job,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json(
        {
          ok: false,
          error: err.code || "core_error",
          message: err.message,
          requestId: err.requestId,
        },
        { status: err.status || 500 },
      );
    }

    console.error("[api/account/delete] unexpected error", err);
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_error",
        message: "Unable to queue account deletion.",
      },
      { status: 500 },
    );
  }
}
