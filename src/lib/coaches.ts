// src/lib/coaches.ts
import type { CoachKey } from '@/types'

/**
 * Human readable labels for each coach.
 * Keep these aligned with marketing copy and dashboard displays.
 */
export const COACH_LABELS: Record<CoachKey, string> = {
  chase_krashen: 'Chase Krashen · Academic English',
  dr_claire_swales: 'Dr. Claire Swales · Admissions',
  carter_goleman: 'Carter Goleman · Interviews',
  chelsea_lightbown: 'Chelsea Lightbown · IELTS and TOEFL',
  dr_clark_atul: 'Dr. Clark Atul · Physicians',
  dr_crystal_benner: 'Dr. Crystal Benner · Nursing',
  christopher_buffett: 'Christopher Buffett · Finance',
  colton_covey: 'Colton Covey · Leadership',
  cody_turing: 'Cody Turing · Technical',
  chloe_sinek: 'Chloe Sinek · Personal vision',
}

/**
 * Avatar image for each coach.
 * Paths are relative to the public/ folder and match your existing assets:
 *   public/coach-assets/<kebab-name>/avatar-256.webp
 */
export const COACH_AVATAR: Record<CoachKey, string> = {
  chase_krashen: '/coach-assets/chase-krashen/avatar-256.webp',
  dr_claire_swales: '/coach-assets/claire-swales/avatar-256.webp',
  carter_goleman: '/coach-assets/carter-goleman/avatar-256.webp',
  chelsea_lightbown: '/coach-assets/chelsea-lightbown/avatar-256.webp',
  dr_clark_atul: '/coach-assets/clark-atul/avatar-256.webp',
  dr_crystal_benner: '/coach-assets/crystal-benner/avatar-256.webp',
  christopher_buffett: '/coach-assets/christopher-buffett/avatar-256.webp',
  colton_covey: '/coach-assets/colton-covey/avatar-256.webp',
  cody_turing: '/coach-assets/cody-turing/avatar-256.webp',
  chloe_sinek: '/coach-assets/chloe-sinek/avatar-256.webp',
}

/**
 * Allowed coach keys and type guard.
 * Keep this in sync with your CoachKey union in '@/types'.
 */
const COACH_KEYS: CoachKey[] = [
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
]

const COACH_KEY_SET = new Set<string>(COACH_KEYS)

export function isCoachKey(value: unknown): value is CoachKey {
  if (typeof value !== 'string') return false
  return COACH_KEY_SET.has(value)
}
