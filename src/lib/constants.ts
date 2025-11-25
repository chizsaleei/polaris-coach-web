/**
 * Polaris Web - constants for UI
 * Mirrors core constants with a safe client-side subset.
 */

import {
  Tier,
  CoachKey,
  PlanId,
  BrandTokens,
  DEFAULT_BRAND_TOKENS,
} from '../types'

// ----- App and brand

export const APP_NAME = 'Polaris Coach'

export const BRAND: BrandTokens = DEFAULT_BRAND_TOKENS

// ----- Plans and pricing (display only)

export const PLAN_CURRENCY = 'USD' as const

export const PLAN_LABEL: Record<Exclude<PlanId, 'free'>, string> = {
  pro_monthly: 'Pro Monthly',
  pro_yearly: 'Pro Yearly',
  vip_monthly: 'VIP Monthly',
  vip_yearly: 'VIP Yearly',
} as const

export const PLAN_DISPLAY_PRICE: Record<Exclude<PlanId, 'free'>, string> = {
  pro_monthly: '$12.99',
  pro_yearly: '$99',
  vip_monthly: '$29',
  vip_yearly: '$199',
} as const

export const PLAN_TO_TIER: Record<PlanId, Tier> = {
  free: Tier.FREE,
  pro_monthly: Tier.PRO,
  pro_yearly: Tier.PRO,
  vip_monthly: Tier.VIP,
  vip_yearly: Tier.VIP,
} as const

// ----- Tier limits and cooldowns (used by UI gating and hints)

export interface TierLimits {
  activeCoachCount: number
  sessionMinutes: number
  dailyRealtimeMinutes: number | null
  toolsMax: number | null
  vocabFull: boolean
}

/** Coach switch cooldown in days per tier. */
export const COACH_COOLDOWN_DAYS: Record<Tier, number> = {
  [Tier.FREE]: 7,
  [Tier.PRO]: 7,
  [Tier.VIP]: 0,
} as const

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  [Tier.FREE]: {
    activeCoachCount: 1,
    sessionMinutes: 10,
    dailyRealtimeMinutes: 10,
    toolsMax: 1,
    vocabFull: false,
  },
  [Tier.PRO]: {
    activeCoachCount: 1,
    sessionMinutes: 30,
    dailyRealtimeMinutes: null,
    toolsMax: 3,
    vocabFull: true,
  },
  [Tier.VIP]: {
    activeCoachCount: 99,
    sessionMinutes: 30,
    dailyRealtimeMinutes: null,
    toolsMax: null,
    vocabFull: true,
  },
} as const

// ----- Practice engine defaults

export const PRACTICE_NOW_PAGE_SIZE = 20
export const TARGET_SESSION_MINUTES = 10

export const RECAP_THRESHOLDS = {
  scoreLow: 60,
  expressionsMin: 3,
  shortTimeFraction: 0.4,
} as const

/** Deterministic salt for the daily Practice Now selection. */
export const DAILY_RANDOM_SEED = 'practice-now-v1'

// ----- Coach registry helpers

export const COACH_ORDER: CoachKey[] = [
  'chase_krashen',
  'dr_claire_swales',
  'carter_goleman',
  'chelsea_lightbown',
  'dr_clark_atul',
  'dr_crystal_benner',
  'christopher_buffett',
  'colton_covey',
  'cody_turing',
  'chloe_sinek',
] as const

/** Default drill titles per coach used in emails and summaries. */
export const DEFAULT_DRILL_TITLES: Record<CoachKey, string> = {
  carter_goleman: 'Two minute STAR sprint',
  chase_krashen: '60 second mini lecture',
  chelsea_lightbown: 'IELTS Part 2 long turn',
  dr_clark_atul: 'ICU case presentation',
  dr_crystal_benner: 'ISBAR shift handoff',
  christopher_buffett: 'Two minute market wrap',
  colton_covey: 'Five slide strategy pitch',
  cody_turing: 'Architecture walkthrough',
  dr_claire_swales: 'Three minute research pitch',
  chloe_sinek: 'Life vision speech',
} as const

/** Short coaching tips reused by recap builders. */
export const COACH_TIPS: Record<CoachKey, string> = {
  chelsea_lightbown: 'Use linking words and aim for steady pacing. Record and re listen once.',
  carter_goleman: 'Use STAR and add one number in the Result line.',
  dr_clark_atul: 'Lead with SBAR. Name one red flag early.',
  dr_crystal_benner: 'Use ISBAR and a teach back question for patient talks.',
  christopher_buffett: 'Plain English. Position, Evidence, Risk, Recommendation.',
  colton_covey: 'Intent, Context, Proposal, Ask. Keep it under two minutes.',
  cody_turing: 'Expand acronyms once. State one tradeoff.',
  dr_claire_swales: 'Motivation, Question, Method, Impact, Fit. One citation helps.',
  chase_krashen: 'PEEL: Point, Evidence, Explain, Link. One example.',
  chloe_sinek: 'Purpose, Values, Next action, Safeguard. Calm and clear.',
} as const

// ----- Feature flags (client-side defaults; core is source of truth)

export const DEFAULT_FEATURE_FLAGS = {
  tool_expressions_pack: true,
  tool_pronunciation_mirror: true,
  tool_live_chat: false,
  payments: true,
  practice_engine_v2: true,
  tts_provider_alt: false,
  stt_provider_alt: false,
} as const

// ----- Expression states (UI only, mirrors core)

export const EXPRESSION_STATES = {
  PRIVATE_USER: 'private_user',
  CANDIDATE_EXEMPLAR: 'candidate_exemplar',
  PUBLISHED_EXEMPLAR: 'published_exemplar',
  DEPRECATED: 'deprecated',
} as const
export type ExpressionState = typeof EXPRESSION_STATES[keyof typeof EXPRESSION_STATES]

// ----- Analytics event names used on the client

export const ANALYTICS_EVENTS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  COACH_SELECTED: 'coach_selected',
  PRACTICE_STARTED: 'practice_started',
  PRACTICE_SUBMITTED: 'practice_submitted',
  FEEDBACK_VIEWED: 'feedback_viewed',
  VOCAB_SAVED: 'vocab_saved',
  DAY_COMPLETED: 'day_completed',
  PLAN_UPGRADED: 'plan_upgraded',
  PAYMENT_STATUS: 'payment_status',
  COACH_SWITCHED: 'coach_switched',
  DRILL_OPENED: 'drill_opened',
} as const

// ----- API routes that the web app calls
// If your Next.js project proxies to the core server, keep these relative.
export const API_ROUTES = {
  PAY_CHECKOUT: '/api/pay/checkout',
  PAY_PORTAL: '/api/pay/portal',
  PAY_WEBHOOK_ADYEN: '/api/pay/webhooks/adyen',
} as const

// ----- Adyen public helpers

export const ADYEN = {
  supportedWallets: [
    'wechatpay',
    'jcb',
    'kakaopay',
    'zalopay',
    'alipay',
    'applepay',
    'googlepay',
  ] as const,
} as const
