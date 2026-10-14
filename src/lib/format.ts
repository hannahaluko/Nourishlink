/* Date + number helpers. All dates travel as `YYYY-MM-DD` strings and are
   parsed as UTC noon so day labels never drift with the viewer's timezone. */

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
}

export function toISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

/** Monday-first week start. */
export function startOfWeek(iso: string): string {
  const d = parseISO(iso);
  const dow = (d.getUTCDay() + 6) % 7; // Mon = 0
  return addDays(iso, -dow);
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function lastNDays(iso: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(iso, -(n - 1 - i)));
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const dayLetter = (iso: string) => WD[parseISO(iso).getUTCDay()][0];
export const dayShort = (iso: string) => WD[parseISO(iso).getUTCDay()];
export const dayName = (iso: string) => WD_LONG[parseISO(iso).getUTCDay()];
export const dayNumber = (iso: string) => `${parseISO(iso).getUTCDate()}`;
export const monthShort = (iso: string) => MON[parseISO(iso).getUTCMonth()];
export const monthLong = (iso: string) => MON_LONG[parseISO(iso).getUTCMonth()];
export const yearOf = (iso: string) => parseISO(iso).getUTCFullYear();

export function prettyDate(iso: string): string {
  return `${dayShort(iso)}, ${parseISO(iso).getUTCDate()} ${monthShort(iso)}`;
}

export function prettyLongDate(iso: string): string {
  return `${dayName(iso)} ${parseISO(iso).getUTCDate()} ${monthLong(iso)}`;
}

export function prettyTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${`${m}`.padStart(2, "0")}${suffix}`;
}

export function isSameWeek(a: string, b: string): boolean {
  return startOfWeek(a) === startOfWeek(b);
}

/* ---------------------------- formatting ---------------------------- */

export const naira = (n: number, compact = false) =>
  compact && n >= 1000 ? `₦${Math.round(n / 1000)}k` : `₦${n.toLocaleString("en-NG")}`;

export const num = (n: number) => n.toLocaleString("en-US");

export const oneDecimal = (n: number) => n.toFixed(1);

export const pct = (value: number, total: number) =>
  total <= 0 ? 0 : Math.min(100, Math.round((value / total) * 100));

export function glucoseStatus(v: number): { label: string; tone: "good" | "warn" | "bad" } {
  if (v < 3.9) return { label: "Low", tone: "bad" };
  if (v <= 7.8) return { label: "In range", tone: "good" };
  if (v <= 10) return { label: "Above target", tone: "warn" };
  return { label: "High", tone: "bad" };
}

export const bmi = (kg: number | null, cm: number | null) => {
  if (!kg || !cm) return null;
  return kg / (cm / 100) ** 2;
};

export function bmiLabel(value: number): string {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Healthy";
  if (value < 30) return "Overweight";
  return "Obese";
}
