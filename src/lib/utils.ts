// src/lib/utils.ts
/* Core utilities used across Polaris Coach web.
   - Date and time helpers (Manila boundary, ISO, durations)
   - Randomness (deterministic by seed for daily picks)
   - Strings (slugify, title case), numbers (clamp), async (sleep)
   - Safe JSON helpers
*/

export const MANILA_TZ = "Asia/Manila";

/** Get a Date that represents "now" in Manila, keeping local time fields aligned. */
export function nowInManila(): Date {
  // Create an ISO string in Manila and parse back to Date
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  function p(tp: string) {
    return Number(parts.find(x => x.type === tp)?.value ?? "0");
  }
  const y = p("year");
  const m = p("month");
  const d = p("day");
  const hh = p("hour");
  const mm = p("minute");
  const ss = p("second");
  // Construct as local then treat as UTC offset for stability
  return new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
}

/** Returns YYYY-MM-DD in Manila. */
export function manilaDateKey(d: Date = nowInManila()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 00:00 Manila of the given Date. */
export function startOfManilaDay(d: Date = nowInManila()): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 0, 0, 0));
}

/** 23:59:59 Manila of the given Date. */
export function endOfManilaDay(d: Date = nowInManila()): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 23, 59, 59));
}

/** Format a duration in ms to mm:ss or hh:mm:ss if long. */
export function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m)}:${String(s).padStart(2, "0")}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

/** Deterministic 32-bit hash. */
export function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic RNG in [0,1) from a seed. */
export function seededRandom(seed: string): () => number {
  let s = hash32(seed) || 1;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    // Convert to [0,1)
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

export function deterministicPick<T>(items: T[], seed: string): T {
  if (!items.length) throw new Error("deterministicPick received empty list");
  const rnd = seededRandom(seed)();
  const idx = Math.floor(rnd * items.length);
  return items[clamp(idx, 0, items.length - 1)];
}

export function randInt(minIncl: number, maxIncl: number): number {
  const r = Math.random();
  return Math.floor(r * (maxIncl - minIncl + 1)) + minIncl;
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Safe JSON parse with fallback. */
export function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Safe JSON stringify with fallback. */
export function safeStringifyJSON(v: unknown, fallback = "{}"): string {
  try {
    return JSON.stringify(v);
  } catch {
    return fallback;
  }
}

/** Build a query string from an object, skipping undefined and null. */
export function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    q.append(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Narrow type guard for non-null. */
export function notNil<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}
