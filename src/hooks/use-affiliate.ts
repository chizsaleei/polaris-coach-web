// src/hooks/use-affiliate.ts
'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pc_affiliate'

type AffiliateState = {
  code?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  clickId?: string
}

/**
 * useAffiliate
 *
 * - Reads affiliate / UTM params from the current URL (aff, affiliateCode, utm_*)
 * - Persists them in localStorage so they survive redirects
 * - Exposes the current affiliate code and a helper to append it to URLs
 *
 * Core expects:
 *   - aff or affiliateCode on auth/callback and checkout URLs
 *   - utm_source / utm_medium / utm_campaign for richer attribution (optional)
 */
export function useAffiliate() {
  const [state, setState] = useState<AffiliateState>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const params = url.searchParams

    const rawCode =
      params.get('aff') ||
      params.get('affiliateCode') ||
      params.get('affiliate_code') ||
      undefined

    const utmSource = params.get('utm_source') || undefined
    const utmMedium = params.get('utm_medium') || undefined
    const utmCampaign = params.get('utm_campaign') || undefined
    const clickId = params.get('clickId') || params.get('click_id') || undefined

    let next: AffiliateState | null = null

    try {
      const storedRaw = window.localStorage.getItem(STORAGE_KEY)
      const stored: AffiliateState | null = storedRaw ? JSON.parse(storedRaw) : null

      // If the URL has a new code, prefer it over stored
      if (rawCode) {
        next = {
          code: rawCode,
          utmSource: utmSource ?? stored?.utmSource,
          utmMedium: utmMedium ?? stored?.utmMedium,
          utmCampaign: utmCampaign ?? stored?.utmCampaign,
          clickId: clickId ?? stored?.clickId,
        }
      } else if (stored?.code) {
        next = stored
      }
    } catch {
      // ignore parse errors; fall back to URL-only
      if (rawCode) {
        next = { code: rawCode, utmSource, utmMedium, utmCampaign, clickId }
      }
    }

    if (!next) return

    setState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage may be unavailable; ignore
    }
  }, [])

  const appendToUrl = (href: string): string => {
    if (!state.code) return href
    try {
      // Relative or absolute
      const base =
        typeof window !== 'undefined' ? window.location.origin : 'https://polaris.example.com'
      const url = href.startsWith('http') ? new URL(href) : new URL(href, base)
      const params = url.searchParams

      if (!params.get('aff') && !params.get('affiliateCode')) {
        params.set('aff', state.code)
      }

      // Do not overwrite existing utm_* if present
      if (state.utmSource && !params.get('utm_source')) params.set('utm_source', state.utmSource)
      if (state.utmMedium && !params.get('utm_medium')) params.set('utm_medium', state.utmMedium)
      if (state.utmCampaign && !params.get('utm_campaign')) params.set('utm_campaign', state.utmCampaign)
      if (state.clickId && !params.get('clickId') && !params.get('click_id')) {
        params.set('clickId', state.clickId)
      }

      // Return relative if original was relative
      return href.startsWith('http')
        ? url.toString()
        : url.pathname + (url.search || '') + (url.hash || '')
    } catch {
      return href
    }
  }

  return {
    affiliateCode: state.code,
    utmSource: state.utmSource,
    utmMedium: state.utmMedium,
    utmCampaign: state.utmCampaign,
    clickId: state.clickId,
    appendToUrl,
  }
}
