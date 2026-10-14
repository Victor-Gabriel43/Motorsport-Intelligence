import type { Preferences } from "@/store/myApex";

const locale = "pt-BR";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) {
  // Date-only strings are interpreted as UTC days.
  const date = iso.length === 10 ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return new Intl.DateTimeFormat(locale, { timeZone: iso.length === 10 ? "UTC" : undefined, ...opts }).format(date);
}

export function formatDateRange(start: string, end: string) {
  const s = formatDate(start, { day: "2-digit" });
  const e = formatDate(end, { day: "2-digit", month: "short" });
  return start === end ? e : `${s}–${e}`;
}

export function formatSessionTime(iso: string, tz: Preferences["timeZone"]) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz === "utc" ? "UTC" : undefined,
    timeZoneName: tz === "utc" ? "short" : undefined,
  }).format(new Date(iso));
}

export function formatLength(km: number, units: Preferences["units"]) {
  if (units === "imperial") return `${(km / 1.609344).toLocaleString(locale, { maximumFractionDigits: 3 })} mi`;
  return `${km.toLocaleString(locale, { maximumFractionDigits: 3 })} km`;
}

/** Whole days between today and an ISO date (negative = past). */
export function daysFrom(iso: string, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).getTime();
  return Math.round((target - today) / 86_400_000);
}

export function relativeDays(iso: string) {
  const d = daysFrom(iso);
  if (d === 0) return "Hoje";
  if (d === 1) return "Amanhã";
  if (d === -1) return "Ontem";
  return d > 0 ? `Em ${d} dias` : `Há ${-d} dias`;
}

/** Regional-indicator flag from an ISO 3166 code — rendered as text, with the code as fallback. */
export function countryCode(code: string) {
  return code.toUpperCase();
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Championship accents are tuned for fills; lighten them when used as small text on black (WCAG AA). */
export function accentText(color?: string) {
  return color ? `color-mix(in oklab, ${color} 72%, white)` : undefined;
}
