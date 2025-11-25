// src/routes/affiliates.ts
//
// Polaris Core - Affiliate routes
//
// Mounted typically as: app.use("/v1/affiliates", affiliatesRouter)

import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { logger } from "../lib/logger";

const log = logger.child("affiliates");
const router = Router();

// -----------------------------------------------------------------------------
// Shared helpers and types
// -----------------------------------------------------------------------------

type JsonRecord = Record<string, unknown>;

type AffiliateEventName =
  | "affiliate_click"
  | "affiliate_qualify"
  | "affiliate_signup_attach"
  | "affiliate_payout_report";

type AffiliateBasePayload = {
  event: AffiliateEventName;
  affiliateCode?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: JsonRecord;
};

async function recordAffiliateEvent(payload: AffiliateBasePayload): Promise<void> {
  log.info("affiliate_event", payload);
}

interface AuthedUser {
  id?: string;
}

// Express Request with optional `user` and typed `body`
type AuthedRequest<B = unknown> = Request & {
  body: B;
  user?: AuthedUser;
};

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

const clickSchema = z.object({
  affiliateCode: z.string().min(1, "affiliateCode is required"),
  sessionId: z.string().min(1).optional(),
  page: z.string().min(1).optional(),
  campaign: z.string().min(1).optional(),
  channel: z.string().min(1).optional(),
  utmSource: z.string().min(1).optional(),
  utmMedium: z.string().min(1).optional(),
  utmCampaign: z.string().min(1).optional(),
  meta: z.record(z.unknown()).optional(),
});

const qualifySchema = z.object({
  affiliateCode: z.string().min(1, "affiliateCode is required"),
  userId: z.string().min(1).optional(),
  externalCustomerId: z.string().min(1).optional(),
  plan: z.string().min(1, "plan is required"),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  source: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  meta: z.record(z.unknown()).optional(),
});

const signupAttachSchema = z.object({
  affiliateCode: z.string().min(1, "affiliateCode is required"),
  userId: z.string().min(1, "userId is required"),
  sessionId: z.string().min(1).optional(),
  meta: z.record(z.unknown()).optional(),
});

const payoutReportSchema = z.object({
  batchId: z.string().min(1, "batchId is required"),
  provider: z.string().min(1, "provider is required"),
  currency: z.string().length(3),
  paidAt: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        affiliateCode: z.string().min(1),
        amount: z.number().nonnegative(),
        externalPayoutId: z.string().min(1).optional(),
        meta: z.record(z.unknown()).optional(),
      }),
    )
    .min(1, "At least one payout item is required"),
  meta: z.record(z.unknown()).optional(),
});

// Inferred body types
type ClickBody = z.infer<typeof clickSchema>;
type QualifyBody = z.infer<typeof qualifySchema>;
type SignupAttachBody = z.infer<typeof signupAttachSchema>;
type PayoutReportBody = z.infer<typeof payoutReportSchema>;

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

interface RequestContext {
  userId: string | null;
  ip: string | null;
  userAgent: string | null;
}

function getUserIdFromRequest(req: AuthedRequest): string | null {
  const headerUser = req.header("x-user-id");
  if (headerUser) return headerUser;

  if (req.user?.id && typeof req.user.id === "string") {
    return req.user.id;
  }

  return null;
}

function buildCommonContext(req: AuthedRequest<unknown>): RequestContext {
  return {
    userId: getUserIdFromRequest(req),
    ip: req.ip || null,
    userAgent: req.get("user-agent") || null,
  };
}

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    ok: false,
    error: "invalid_request",
    details: error.flatten(),
  });
}

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

router.post(
  "/click",
  async (req: AuthedRequest<ClickBody>, res: Response): Promise<Response> => {
    const parseResult = clickSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error);
    }

    const data = parseResult.data;
    const context = buildCommonContext(req);

    try {
      await recordAffiliateEvent({
        event: "affiliate_click",
        affiliateCode: data.affiliateCode,
        userId: context.userId,
        sessionId: data.sessionId ?? null,
        ip: context.ip,
        userAgent: context.userAgent,
        meta: {
          page: data.page,
          campaign: data.campaign,
          channel: data.channel,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          ...data.meta,
        },
      });

      return res.json({ ok: true });
    } catch (error) {
      log.error("affiliate_click_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  },
);

router.post(
  "/qualify",
  async (req: AuthedRequest<QualifyBody>, res: Response): Promise<Response> => {
    const parseResult = qualifySchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error);
    }

    const data = parseResult.data;
    const context = buildCommonContext(req);

    try {
      await recordAffiliateEvent({
        event: "affiliate_qualify",
        affiliateCode: data.affiliateCode,
        userId: data.userId ?? context.userId,
        sessionId: data.sessionId ?? null,
        ip: context.ip,
        userAgent: context.userAgent,
        meta: {
          plan: data.plan,
          amount: data.amount,
          currency: data.currency,
          source: data.source,
          externalCustomerId: data.externalCustomerId,
          ...data.meta,
        },
      });

      return res.json({ ok: true });
    } catch (error) {
      log.error("affiliate_qualify_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  },
);

router.post(
  "/signup-attach",
  async (req: AuthedRequest<SignupAttachBody>, res: Response): Promise<Response> => {
    const parseResult = signupAttachSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error);
    }

    const data = parseResult.data;
    const context = buildCommonContext(req);

    try {
      await recordAffiliateEvent({
        event: "affiliate_signup_attach",
        affiliateCode: data.affiliateCode,
        userId: data.userId ?? context.userId,
        sessionId: data.sessionId ?? null,
        ip: context.ip,
        userAgent: context.userAgent,
        meta: {
          ...data.meta,
        },
      });

      return res.json({ ok: true });
    } catch (error) {
      log.error("affiliate_signup_attach_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  },
);

router.post(
  "/payouts/report",
  async (req: AuthedRequest<PayoutReportBody>, res: Response): Promise<Response> => {
    const parseResult = payoutReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error);
    }

    const data = parseResult.data;
    const context = buildCommonContext(req);

    try {
      await recordAffiliateEvent({
        event: "affiliate_payout_report",
        userId: context.userId,
        ip: context.ip,
        userAgent: context.userAgent,
        meta: {
          batchId: data.batchId,
          provider: data.provider,
          currency: data.currency,
          paidAt: data.paidAt,
          items: data.items,
          ...data.meta,
        },
      });

      return res.json({ ok: true });
    } catch (error) {
      log.error("affiliate_payout_report_failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  },
);

export default router;
