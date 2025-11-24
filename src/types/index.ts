// src/types/index.ts

/**
 * Polaris Web - shared frontend types
 * Mirrors core/src/types/index.ts with a safe, client-side subset.
 * No secrets. Public env only.
 */

// ---------- JSON helpers

export type JSONPrimitive = string | number | boolean | null
export type JSONValue = JSONPrimitive | JSONObject | JSONArray

export interface JSONObject {
  [k: string]: JSONValue
}

export interface JSONArray extends Array<JSONValue> {}

// ---------- Public env (frontend only)

export interface PublicEnv {
  NEXT_PUBLIC_APP_VERSION: string
  NEXT_PUBLIC_APP_BASE_URL: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  // Add new public env fields here if the frontend really needs them.
}

// ---------- Tiers and coaches

export enum Tier {
  FREE = 'free',
  PRO = 'pro',
  VIP = 'vip',
}

export type CoachKey =
  | 'chase_krashen'
  | 'dr_claire_swales'
  | 'carter_goleman'
  | 'chelsea_lightbown'
  | 'dr_clark_atul'
  | 'dr_crystal_benner'
  | 'christopher_buffett'
  | 'colton_covey'
  | 'cody_turing'
  | 'chloe_sinek'

export interface CoachMeta {
  key: CoachKey
  name: string
  audience: string
  tags: string[]
}

// ---------- Onboarding and matching

export interface QuizAnswers {
  firstName: string
  profession: string
  goal: string
  domains: string[]
  priorities: Array<
    | 'fluency'
    | 'interview'
    | 'exam'
    | 'leadership'
    | 'technical'
    | 'medical'
    | 'nursing'
    | 'finance'
    | 'admissions'
    | 'personal'
  >
  difficulty: 1 | 2 | 3 | 4 | 5
}

export interface CoachRec {
  coach: CoachKey
  score: number
  reason: string[]
}

export interface StarterDrill {
  title: string
  prompt: string
  estMinutes: number
}

export interface SevenDayPlanItem {
  day: number
  type: 'drill' | 'vocab' | 'reflection'
  title: string
  prompt?: string
}

export interface SevenDayPlan {
  coach: CoachKey
  dayPlan: SevenDayPlanItem[]
}

// ---------- Attribution (client-visible subset)

export type AttributionChannel =
  | 'direct'
  | 'organic_search'
  | 'paid_search'
  | 'paid_social'
  | 'social'
  | 'email'
  | 'referral'
  | 'affiliate'
  | 'unknown'

export interface AttributionUtm {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface AttributionClickIds {
  gclid?: string
  msclkid?: string
  fbclid?: string
  twclid?: string
  ttclid?: string
  clid?: string
}

export interface AttributionCore {
  ts: string
  request_id: string
  landing_url?: string
  referrer?: string
  user_agent?: string
  country?: string
  ip_hash?: string
  utm: AttributionUtm
  click: AttributionClickIds
  affiliate_code?: string
  channel: AttributionChannel
  site_domain?: string
}

export interface AttributionCookies {
  firstTouch?: string
  lastTouch?: string
}

// ---------- Session summaries (client view of core recap)

export type SessionDomain = 'medical' | 'finance' | 'general'

export interface SessionSummaryMetrics {
  wpm?: number
  clarity?: number
  taskSuccess?: number
}

export interface SessionSummaryFeedback {
  wins: string[]
  fixes: string[]
  next: string
}

export interface SessionSummaryExpressionItem {
  id: string
  text: string
  normalized: string
  tags: string[]
  risky: boolean
  publishable: boolean
  addedAt: string
  reviewDueAt: string[]
}

export interface SessionSummaryExpressionsPack {
  items: SessionSummaryExpressionItem[]
  counts: {
    total: number
    added: number
    duplicates: number
    risky: number
  }
}

export interface SessionSummary {
  sessionId: string
  userId: string
  coach: CoachKey
  rubricId?: string
  domain: SessionDomain
  minutesUsed: number
  transcript?: string
  userText?: string
  modelText?: string
  feedback: SessionSummaryFeedback
  expressions: SessionSummaryExpressionsPack
  metrics: SessionSummaryMetrics
  disclaimerShown: boolean
  disclaimerText?: string
  createdAt: string
}

// ---------- Practice engine contracts (UI uses these shapes)

export interface ExpressionItem {
  text_original: string
  text_upgraded: string
  collocations: string[]
  pronunciation?: { word: string; hint: string }
  examples?: string[]
}

/**
 * Base practice response from the core engine.
 *
 * RubricShape is intentionally unconstrained here so that
 * coach specific rubric interfaces can be plugged in without
 * needing to satisfy the JSONObject index signature.
 * The rubric interfaces below are plain JSON friendly shapes.
 */
export interface BasePracticeResponse<RubricShape> {
  modelAnswer: string
  wins: [string, string, string]
  fixes: [string, string]
  nextPrompt: string
  rubric: RubricShape & { overall: number }
  expressions: ExpressionItem[]
}

// Rubric shapes per coach (same keys as core)

export interface RubricChaseKrashen {
  structure: number
  evidence: number
  reasoning: number
  clarity: number
  delivery: number
}

export interface RubricClaireSwales {
  structure: number
  fit_alignment: number
  evidence_methods: number
  clarity_style: number
  presence_confidence: number
}

export interface RubricCarterGoleman {
  structure: number
  relevance: number
  impact: number
  clarity: number
  presence: number
}

export interface RubricChelseaLightbown {
  fluency_coherence: number
  lexical_resource: number
  grammar_accuracy: number
  pronunciation: number
  topic_development: number
}

export interface RubricClarkAtul {
  structure: number
  clinical_reasoning: number
  safety_recommendations: number
  clarity_tone: number
  evidence_guidelines: number
}

export interface RubricCrystalBenner {
  structure: number
  accuracy: number
  clarity: number
  empathy_tone: number
  safety: number
}

export interface RubricChristopherBuffett {
  clarity: number
  accuracy: number
  structure: number
  client_framing: number
  numeracy: number
}

export interface RubricColtonCovey {
  clarity: number
  relevance: number
  structure: number
  persuasion: number
  presence: number
}

export interface RubricCodyTuring {
  clarity: number
  technical_accuracy: number
  structure: number
  audience_targeting: number
  brevity_under_stress: number
}

export interface RubricChloeSinek {
  clarity: number
  specificity_action: number
  presence_tone: number
  structure: number
  follow_through: number
}

export type RubricByCoach = {
  chase_krashen: RubricChaseKrashen
  dr_claire_swales: RubricClaireSwales
  carter_goleman: RubricCarterGoleman
  chelsea_lightbown: RubricChelseaLightbown
  dr_clark_atul: RubricClarkAtul
  dr_crystal_benner: RubricCrystalBenner
  christopher_buffett: RubricChristopherBuffett
  colton_covey: RubricColtonCovey
  cody_turing: RubricCodyTuring
  chloe_sinek: RubricChloeSinek
}

export type PracticeResponseByCoach = {
  [K in CoachKey]: BasePracticeResponse<RubricByCoach[K]>
}

// ---------- Sessions and attempts (fields the UI renders)

export interface Session {
  id: string
  user_id: string
  coach_key: CoachKey
  started_at: string
  finished_at?: string
  tier: Tier
}

export interface Attempt {
  id: string
  session_id: string
  drill_id: string
  coach_key: CoachKey
  rubric_json: JSONObject
  overall_score: number
  wins: string[]
  fixes: string[]
  next_prompt: string
  expressions_json: JSONArray
  expressions_count: number
  time_on_task_seconds: number
  words_per_minute: number | null
  report_rate?: number | null
  helpfulness_rating?: number | null
  flag_safety?: boolean
  flag_risky_language?: boolean
  created_at: string
}

export interface ProfileRow {
  id: string
  user_id: string | null
  first_name: string | null
  profession: string | null
  goal: string | null
  domains: string[] | null
  priorities: QuizAnswers['priorities'] | null
  difficulty: 1 | 2 | 3 | 4 | 5 | null
  coach_key: CoachKey | null
  tier: Tier
  timezone: string | null
  country_code: string | null
  currency_code: string | null
  daily_target_minutes: number | null
  reminder_time_local: string | null
  practice_focus: string | null
  marketing_opt_in: boolean
  created_at: string
  updated_at: string
}

// ---------- Analytics

export type AnalyticsEventName =
  | 'onboarding_completed'
  | 'coach_selected'
  | 'practice_started'
  | 'practice_submitted'
  | 'feedback_viewed'
  | 'vocab_saved'
  | 'day_completed'
  | 'plan_upgraded'
  | 'payment_status'
  | 'coach_switched'
  | 'drill_opened'
  | 'chat_coach'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  user_id: string
  coach_key?: CoachKey
  tier?: Tier
  dimensions?: JSONObject
  created_at: string
}

// ---------- Billing types used on the client

export type PlanId =
  | 'free'
  | 'pro_monthly'
  | 'pro_yearly'
  | 'vip_monthly'
  | 'vip_yearly'

export interface CheckoutSession {
  id: string
  merchantAccount: string
  reference: string
  amount: { value: number; currency: string }
}

export interface CheckoutResponse {
  session: CheckoutSession
}

export interface PortalResponse {
  url: string
}

// ---------- Branding and accessibility tokens

export interface BrandTokens {
  colors: {
    primary: '#07435E'
    secondary: '#042838'
    accent: '#4390BA'
    surface: '#DBF7FF'
    baseDark: '#001C29'
    text: '#000000'
  }
  wcag: {
    bodyTextAA: boolean
    largeTextAA: boolean
  }
}

export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  colors: {
    primary: '#07435E',
    secondary: '#042838',
    accent: '#4390BA',
    surface: '#DBF7FF',
    baseDark: '#001C29',
    text: '#000000',
  },
  wcag: { bodyTextAA: true, largeTextAA: true },
}

// ---------- Small helpers

export type Values<T> = T[keyof T]

export function isCoachKey(x: string): x is CoachKey {
  return [
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
  ].includes(x as CoachKey)
}

export function tierWeight(t: Tier): number {
  switch (t) {
    case Tier.VIP:
      return 3
    case Tier.PRO:
      return 2
    case Tier.FREE:
    default:
      return 1
  }
}

export function meetsTier(userTier: Tier, min: Tier): boolean {
  return tierWeight(userTier) >= tierWeight(min)
}
