// src/app/api/pay/portal/route.ts
import { NextRequest, NextResponse } from "next/server";

import { corePost, CoreError, idempotencyKey } from "@/lib/fetch-core";
import { requireUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type PortalResponse = {
  ok: boolean;
  data?: {
    provider: string;
    url: string;
  };
  correlation_id?: string;
};

export async function GET(request: NextRequest) {
  const user = await requireUser("/login");

  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") || undefined;

  const origin = url.origin;
  const base =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.APP_BASE_URL ||
    origin;

  const returnUrl = buildAbsoluteUrl(base, "/account");

  const payload: {
    userId: string;
    provider?: string;
    returnUrl?: string;
  } = {
    userId: user.id,
    returnUrl,
  };
  if (provider) payload.provider = provider;

  try {
    const result = await corePost<PortalResponse>("/v1/payments/portal", payload, {
      headers: { "idempotency-key": idempotencyKey() },
      cache: "no-store",
    });

    const portalUrl = result?.data?.url;
    if (!result?.ok || !portalUrl) {
      logger.error("pay_portal_missing_url", { result });
      return NextResponse.redirect(new URL("/account?billingError=1", base));
    }

    return NextResponse.redirect(portalUrl);
  } catch (err) {
    if (err instanceof CoreError) {
      logger.error("pay_portal_core_error", {
        code: err.code,
        status: err.status,
        requestId: err.requestId,
      });
    } else {
      logger.error("pay_portal_unexpected_error", { error: String(err) });
    }
    return NextResponse.redirect(new URL("/account?billingError=1", base));
  }
}

function buildAbsoluteUrl(base: string, path: string) {
  const normalizedBase = base.startsWith("http") ? base : `https://${base}`;
  const trimmedBase = normalizedBase.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}
