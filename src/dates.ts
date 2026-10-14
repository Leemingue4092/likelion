export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return formatISODate(parseISODate(value)) === value;
}

export function todayISO(now = new Date()): string {
  return formatISODate(now);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysISO(iso: string, days: number): string {
  return formatISODate(addDays(parseISODate(iso), days));
}

export function mondayOf(iso: string): string {
  const date = parseISODate(iso);
  const delta = date.getDay() === 0 ? -6 : 1 - date.getDay();
  return formatISODate(addDays(date, delta));
}

export function dayDiff(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function eachDate(startISO: string, endISO: string): string[] {
  if (!isISODate(startISO) || !isISODate(endISO) || endISO < startISO) return [];
  const dates: string[] = [];
  let cursor = parseISODate(startISO);
  const end = parseISODate(endISO);
  while (cursor <= end && dates.length < 400) {
    dates.push(formatISODate(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const count = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [];
  for (let index = 0; index < first.getDay(); index += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(formatISODate(new Date(year, month - 1, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export function formatKoreanDate(iso: string, withYear = false): string {
  const date = parseISODate(iso);
  const year = withYear ? `${date.getFullYear()}년 ` : '';
  return `${year}${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}

export function formatCompactDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

export function formatWeekdays(days: number[]): string {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const picked = order.filter((day) => days.includes(day));
  if (picked.length === 0) return '요일 없음';
  return picked.map((day) => WEEKDAY_LABELS[day]).join('·');
}

export function formatTimeRange(start: string, end: string): string {
  if (start && end) return `${start}–${end}`;
  return start || end;
}

export function ddayLabel(diff: number): string {
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  return `D-${diff}`;
}

export function groupByMonth(dates: string[]): { key: string; label: string; dates: string[] }[] {
  const groups: { key: string; label: string; dates: string[] }[] = [];
  for (const date of dates) {
    const parsed = parseISODate(date);
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const label = `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월`;
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) groups.push({ key, label, dates: [date] });
    else last.dates.push(date);
  }
  return groups;
}
