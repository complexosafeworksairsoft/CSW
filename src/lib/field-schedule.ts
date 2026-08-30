// Static configuration (not data, same status as SITE_IMAGE_SLOTS in
// site-images.ts): the fixed weekly windows the field is open for booking.
// Segunda-feira has no windows on purpose — the field is closed that day.

export type TimeWindow = {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};

// Keyed by Date#getDay() (0 = domingo ... 6 = sábado).
const WEEKDAY_WINDOWS: Record<number, TimeWindow[]> = {
  0: [
    { start: "08:00", end: "11:00" },
    { start: "15:00", end: "18:00" },
  ], // domingo
  1: [], // segunda — fechado
  2: [{ start: "19:00", end: "22:00" }], // terça
  3: [{ start: "19:00", end: "22:00" }], // quarta
  4: [{ start: "19:00", end: "22:00" }], // quinta
  5: [{ start: "19:00", end: "22:00" }], // sexta
  6: [{ start: "15:00", end: "18:00" }], // sábado
};

export const MAX_ADVANCE_DAYS = 31; // "próximo mês"

function parseDateOnly(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** The fixed windows open on a given weekday, e.g. [] for a segunda-feira. */
export function getWindowsForDate(dateStr: string): TimeWindow[] {
  const date = parseDateOnly(dateStr);
  if (!date) return [];
  return WEEKDAY_WINDOWS[date.getDay()] ?? [];
}

/** Whether `dateStr` is within the bookable window (today..+MAX_ADVANCE_DAYS) AND has at least one open time window. */
export function isDateBookable(dateStr: string): boolean {
  const date = parseDateOnly(dateStr);
  if (!date) return false;

  const today = startOfToday();
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0 || diffDays > MAX_ADVANCE_DAYS) return false;

  return getWindowsForDate(dateStr).length > 0;
}

export function todayISO(): string {
  return startOfToday().toISOString().slice(0, 10);
}

export function maxBookableDateISO(): string {
  const max = startOfToday();
  max.setDate(max.getDate() + MAX_ADVANCE_DAYS);
  return max.toISOString().slice(0, 10);
}

/** "ter, 09/09" style label for a "AAAA-MM-DD" date — used in "Meus agendamentos". */
export function formatDateLabel(dateStr: string): string {
  const date = parseDateOnly(dateStr);
  if (!date) return dateStr;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}
