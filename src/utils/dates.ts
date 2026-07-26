

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_LOOKUP = new Map<string, number>(
  MONTHS.flatMap((name, index) => [
    [name.toLowerCase(), index],
    [name.slice(0, 3).toLowerCase(), index],
  ])
);

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isoToServiceDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function serviceDateToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatLongDate(iso: string): string {
  const date = fromIsoDate(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  const date = fromIsoDate(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const AMPM_TIME_RE = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\.?$/i;
const TWENTY_FOUR_TIME_RE = /^(\d{1,2})[:.](\d{2})$/;
const ISO_DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const SLASHED_DATE_RE = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;
const DAY_FIRST_DATE_RE = /^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/;
const MONTH_FIRST_DATE_RE = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/;

export function parseServiceTimeMinutes(raw: string): number | null {
  const value = raw.trim();
  if (!value) return null;

  const ampm = AMPM_TIME_RE.exec(value);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = ampm[2] ? Number(ampm[2]) : 0;
    const period = ampm[3].toLowerCase();
    if (hours === 12) hours = 0;
    if (period === "pm") hours += 12;
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  const twentyFour = TWENTY_FOUR_TIME_RE.exec(value);
  if (twentyFour) {
    const hours = Number(twentyFour[1]);
    const minutes = Number(twentyFour[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
}

export function isDinnerServiceTime(raw: string): boolean {
  const minutes = parseServiceTimeMinutes(raw);
  if (minutes == null) return false;
  return minutes >= 15 * 60;
}

export function parseSheetDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const iso = ISO_DATE_RE.exec(value);
  if (iso) return buildIso(+iso[1], +iso[2], +iso[3]);

  const slashed = SLASHED_DATE_RE.exec(value);
  if (slashed) return buildIso(+slashed[3], +slashed[2], +slashed[1]);

  const dayFirst = DAY_FIRST_DATE_RE.exec(value);
  if (dayFirst) {
    const month = MONTH_LOOKUP.get(dayFirst[2].toLowerCase());
    if (month !== undefined) return buildIso(+dayFirst[3], month + 1, +dayFirst[1]);
  }

  const monthFirst = MONTH_FIRST_DATE_RE.exec(value);
  if (monthFirst) {
    const month = MONTH_LOOKUP.get(monthFirst[1].toLowerCase());
    if (month !== undefined) return buildIso(+monthFirst[3], month + 1, +monthFirst[2]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : toIsoDate(parsed);
}

function buildIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
