import { dayDiff, eachDate, isISODate, parseISODate } from './dates';
import type {
  AppState,
  AttendanceRecord,
  AttendanceStatus,
  BackupFile,
  Course,
  Settings,
} from './types';

export const COURSE_COLORS = [
  '#1e5c40',
  '#234e70',
  '#8a4b2f',
  '#5c4580',
  '#9d2c2c',
  '#0f5f5c',
  '#8a6414',
  '#3d4a38',
] as const;

export const STATUSES: { id: AttendanceStatus; label: string }[] = [
  { id: 'present', label: '출석' },
  { id: 'late', label: '지각' },
  { id: 'absent', label: '결석' },
  { id: 'excused', label: '공결' },
  { id: 'cancelled', label: '휴강' },
];

export function defaultSettings(now = new Date()): Settings {
  const year = now.getMonth() <= 1 ? now.getFullYear() - 1 : now.getFullYear();
  return {
    semesterName: `${year}년 2학기`,
    startDate: `${year}-09-01`,
    endDate: `${year}-12-19`,
  };
}

export function emptyCourse(partial: Partial<Course> = {}): Course {
  return {
    id: '',
    name: '',
    instructor: '',
    room: '',
    color: COURSE_COLORS[0],
    weekdays: [],
    startTime: '',
    endTime: '',
    midtermDate: '',
    finalDate: '',
    midtermScore: null,
    finalScore: null,
    midtermMax: 100,
    finalMax: 100,
    midtermWeight: 50,
    finalWeight: 50,
    otherLabel: '기타',
    otherScore: null,
    otherMax: 100,
    otherWeight: 0,
    note: '',
    ...partial,
  };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function semesterError(settings: Settings): string | null {
  if (!settings.semesterName.trim()) return '학기 이름을 입력해 주세요.';
  if (!isISODate(settings.startDate) || !isISODate(settings.endDate)) return '학기 기간을 확인해 주세요.';
  if (settings.endDate < settings.startDate) return '끝나는 날은 시작 날과 같거나 이후여야 해요.';
  if (dayDiff(settings.startDate, settings.endDate) > 366) return '학기 기간은 1년 안으로 정해 주세요.';
  return null;
}

export function timeOrderError(start: string, end: string): string | null {
  if (!start || !end) return null;
  if (end <= start) return '끝나는 시간은 시작 시간보다 뒤여야 해요.';
  return null;
}

export function semesterWeek(dateISO: string, settings: Settings): number | null {
  if (!isISODate(dateISO) || semesterError(settings)) return null;
  if (dateISO < settings.startDate || dateISO > settings.endDate) return null;
  return Math.floor(dayDiff(settings.startDate, dateISO) / 7) + 1;
}

export function compareCourses(a: Course, b: Course): number {
  const left = a.startTime || '99:99';
  const right = b.startTime || '99:99';
  if (left !== right) return left < right ? -1 : 1;
  return a.name.localeCompare(b.name, 'ko');
}

export function classesOnDate(courses: Course[], settings: Settings, iso: string): Course[] {
  if (!isISODate(iso) || semesterError(settings)) return [];
  if (iso < settings.startDate || iso > settings.endDate) return [];
  const weekday = parseISODate(iso).getDay();
  return courses.filter((course) => course.weekdays.includes(weekday)).sort(compareCourses);
}

export function regularSessionDates(course: Course, settings: Settings): string[] {
  if (semesterError(settings) || course.weekdays.length === 0) return [];
  return eachDate(settings.startDate, settings.endDate).filter((date) =>
    course.weekdays.includes(parseISODate(date).getDay()),
  );
}

export type ExamKind = 'midterm' | 'final';

export function examKindLabel(kind: ExamKind): string {
  return kind === 'midterm' ? '중간고사' : '기말고사';
}

export function examsOnDate(courses: Course[], iso: string): { course: Course; kind: ExamKind }[] {
  const exams: { course: Course; kind: ExamKind }[] = [];
  for (const course of [...courses].sort(compareCourses)) {
    if (course.midtermDate === iso) exams.push({ course, kind: 'midterm' });
    if (course.finalDate === iso) exams.push({ course, kind: 'final' });
  }
  return exams;
}

export interface UpcomingExam {
  course: Course;
  kind: ExamKind;
  date: string;
  diff: number;
}

export function upcomingExams(courses: Course[], today: string, within = 45): UpcomingExam[] {
  const items: UpcomingExam[] = [];
  for (const course of courses) {
    for (const kind of ['midterm', 'final'] as const) {
      const date = kind === 'midterm' ? course.midtermDate : course.finalDate;
      if (!isISODate(date)) continue;
      const diff = dayDiff(today, date);
      if (diff >= 0 && diff <= within) items.push({ course, kind, date, diff });
    }
  }
  items.sort((a, b) => a.date.localeCompare(b.date) || a.course.name.localeCompare(b.course.name, 'ko'));
  return items;
}

export function nextClassDay(
  courses: Course[],
  settings: Settings,
  fromISO: string,
): { date: string; courses: Course[] } | null {
  if (!isISODate(fromISO) || semesterError(settings)) return null;
  let cursor = parseISODate(fromISO);
  for (let step = 0; step < 70; step += 1) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (iso > settings.endDate) return null;
    const list = classesOnDate(courses, settings, iso);
    if (list.length > 0) return { date: iso, courses: list };
  }
  return null;
}

export interface DayPlan {
  exams: { course: Course; kind: ExamKind }[];
  regular: Course[];
  extra: Course[];
  availableForMakeup: Course[];
}

export function dayPlan(
  courses: Course[],
  settings: Settings,
  attendance: AttendanceRecord[],
  iso: string,
): DayPlan {
  const exams = examsOnDate(courses, iso);
  const regular = classesOnDate(courses, settings, iso);
  const regularIds = new Set(regular.map((course) => course.id));
  const extraIds = new Set(
    attendance.filter((record) => record.date === iso && !regularIds.has(record.courseId)).map((record) => record.courseId),
  );
  const extra = courses.filter((course) => extraIds.has(course.id)).sort(compareCourses);
  const listed = new Set([...regularIds, ...extra.map((course) => course.id)]);
  return {
    exams,
    regular,
    extra,
    availableForMakeup: courses.filter((course) => !listed.has(course.id)).sort(compareCourses),
  };
}

export function findRecord(
  attendance: AttendanceRecord[],
  courseId: string,
  date: string,
): AttendanceRecord | null {
  return attendance.find((record) => record.courseId === courseId && record.date === date) ?? null;
}

export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  excused: number;
  cancelled: number;
  unmarkedPast: number;
  upcoming: number;
  attended: number;
  counted: number;
  rate: number | null;
}

export function courseStats(
  course: Course,
  settings: Settings,
  attendance: AttendanceRecord[],
  today: string,
): AttendanceStats {
  const regular = new Set(regularSessionDates(course, settings));
  const records = attendance.filter((record) => record.courseId === course.id);
  const dates = new Set<string>([...regular, ...records.map((record) => record.date)]);
  const stats: AttendanceStats = {
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    cancelled: 0,
    unmarkedPast: 0,
    upcoming: 0,
    attended: 0,
    counted: 0,
    rate: null,
  };

  for (const date of dates) {
    const record = records.find((item) => item.date === date);
    if (!record) {
      if (!regular.has(date)) continue;
      if (date > today) stats.upcoming += 1;
      else stats.unmarkedPast += 1;
      continue;
    }
    if (record.status === 'present') stats.present += 1;
    else if (record.status === 'late') stats.late += 1;
    else if (record.status === 'absent') stats.absent += 1;
    else if (record.status === 'excused') stats.excused += 1;
    else stats.cancelled += 1;
  }

  stats.attended = stats.present + stats.late + stats.excused;
  stats.counted = stats.attended + stats.absent;
  stats.rate = stats.counted > 0 ? (stats.attended / stats.counted) * 100 : null;
  return stats;
}

export function unmarkedPastCount(
  courses: Course[],
  settings: Settings,
  attendance: AttendanceRecord[],
  today: string,
): number {
  return courses.reduce(
    (total, course) => total + courseStats(course, settings, attendance, today).unmarkedPast,
    0,
  );
}

export function sessionTimeline(course: Course, settings: Settings, attendance: AttendanceRecord[]): string[] {
  const regular = regularSessionDates(course, settings);
  const extra = attendance
    .filter((record) => record.courseId === course.id && !regular.includes(record.date))
    .map((record) => record.date);
  return [...new Set([...regular, ...extra])].sort();
}

export interface GradePart {
  key: 'midterm' | 'final' | 'other';
  label: string;
  score: number | null;
  max: number;
  weight: number;
  included: boolean;
}

export interface GradeSummary {
  total: number | null;
  parts: GradePart[];
  pendingLabels: string[];
  ignoredScoreLabels: string[];
  weightSum: number;
}

function finiteWeight(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function gradeSummary(course: Course): GradeSummary {
  const raw = [
    {
      key: 'midterm' as const,
      label: '중간고사',
      score: course.midtermScore,
      max: course.midtermMax,
      weight: finiteWeight(course.midtermWeight),
    },
    {
      key: 'final' as const,
      label: '기말고사',
      score: course.finalScore,
      max: course.finalMax,
      weight: finiteWeight(course.finalWeight),
    },
    {
      key: 'other' as const,
      label: course.otherLabel.trim() || '기타',
      score: course.otherScore,
      max: course.otherMax,
      weight: finiteWeight(course.otherWeight),
    },
  ];
  const parts: GradePart[] = raw.map((part) => ({
    ...part,
    included: part.weight > 0 && part.score !== null && part.max > 0,
  }));
  const included = parts.filter((part) => part.included);
  const includedWeight = included.reduce((sum, part) => sum + part.weight, 0);
  const total =
    includedWeight > 0
      ? included.reduce((sum, part) => sum + ((part.score ?? 0) / part.max) * 100 * (part.weight / includedWeight), 0)
      : null;
  return {
    total,
    parts,
    pendingLabels: parts.filter((part) => part.weight > 0 && !part.included).map((part) => part.label),
    ignoredScoreLabels: parts.filter((part) => part.weight <= 0 && part.score !== null).map((part) => part.label),
    weightSum: parts.reduce((sum, part) => sum + part.weight, 0),
  };
}

export function gradeNote(summary: GradeSummary): string | null {
  if (summary.weightSum <= 0) return '비율을 정하면 예상 점수를 계산해요.';
  if (summary.total === null) return '점수를 입력하면 예상 점수가 나와요.';
  const bits: string[] = [];
  if (summary.pendingLabels.length > 0) bits.push(`${summary.pendingLabels.join(', ')} 점수는 아직 빠져 있어요`);
  if (Math.abs(summary.weightSum - 100) > 0.01 || summary.pendingLabels.length > 0) {
    bits.push('입력된 비율만으로 다시 맞춰 계산했어요');
  }
  if (summary.ignoredScoreLabels.length > 0) {
    bits.push(`비율이 0%인 항목(${summary.ignoredScoreLabels.join(', ')})은 합산에서 빼요`);
  }
  return bits.length > 0 ? `${bits.join('. ')}.` : null;
}

export function overallAverage(courses: Course[]): { average: number | null; counted: number } {
  const totals = courses
    .map((course) => gradeSummary(course).total)
    .filter((total): total is number => total !== null);
  if (totals.length === 0) return { average: null, counted: 0 };
  return {
    average: totals.reduce((sum, total) => sum + total, 0) / totals.length,
    counted: totals.length,
  };
}

export function formatPoint(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function asText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function asDate(value: unknown): string {
  return typeof value === 'string' && isISODate(value) ? value : '';
}

function asScore(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1000) return null;
  return Math.round(number * 10) / 10;
}

function asMax(value: unknown, fallback = 100): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 1000) return fallback;
  return Math.round(number * 10) / 10;
}

function asWeight(value: unknown, fallback: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function asWeekdays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const days = new Set<number>();
  for (const item of value) {
    const day = typeof item === 'number' ? item : Number(item);
    if (Number.isInteger(day) && day >= 0 && day <= 6) days.add(day);
  }
  return [...days].sort((a, b) => a - b);
}

function asColor(value: unknown): string {
  if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  return COURSE_COLORS[0];
}

function asId(value: unknown): string {
  if (typeof value !== 'string') return '';
  const id = value.trim();
  return /^[\w-]{1,80}$/.test(id) ? id : '';
}

const STATUS_SET = new Set<AttendanceStatus>(['present', 'late', 'absent', 'excused', 'cancelled']);

export function normalizeCourse(value: unknown): Course | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const id = asId(raw.id);
  const name = asText(raw.name, 40);
  if (!id || !name) return null;
  return {
    id,
    name,
    instructor: asText(raw.instructor, 30),
    room: asText(raw.room, 30),
    color: asColor(raw.color),
    weekdays: asWeekdays(raw.weekdays),
    startTime: /^\d{2}:\d{2}$/.test(String(raw.startTime)) ? String(raw.startTime) : '',
    endTime: /^\d{2}:\d{2}$/.test(String(raw.endTime)) ? String(raw.endTime) : '',
    midtermDate: asDate(raw.midtermDate),
    finalDate: asDate(raw.finalDate),
    midtermScore: asScore(raw.midtermScore),
    finalScore: asScore(raw.finalScore),
    midtermMax: asMax(raw.midtermMax),
    finalMax: asMax(raw.finalMax),
    midtermWeight: asWeight(raw.midtermWeight, 50),
    finalWeight: asWeight(raw.finalWeight, 50),
    otherLabel: asText(raw.otherLabel, 20) || '기타',
    otherScore: asScore(raw.otherScore),
    otherMax: asMax(raw.otherMax),
    otherWeight: asWeight(raw.otherWeight, 0),
    note: asText(raw.note, 200),
  };
}

export function normalizeCourses(value: unknown): Course[] {
  if (!Array.isArray(value)) return [];
  const map = new Map<string, Course>();
  for (const item of value) {
    const course = normalizeCourse(item);
    if (course) map.set(course.id, course);
  }
  return [...map.values()].slice(0, 40);
}

export function normalizeAttendance(value: unknown, courseIds?: Set<string>): AttendanceRecord[] {
  if (!Array.isArray(value)) return [];
  const map = new Map<string, AttendanceRecord>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    const courseId = asId(raw.courseId);
    const date = asDate(raw.date);
    const status = raw.status;
    if (!courseId || !date || typeof status !== 'string' || !STATUS_SET.has(status as AttendanceStatus)) continue;
    if (courseIds && !courseIds.has(courseId)) continue;
    map.set(`${courseId}:${date}`, {
      courseId,
      date,
      status: status as AttendanceStatus,
      note: asText(raw.note, 80),
    });
  }
  return [...map.values()].slice(0, 5000);
}

export function normalizeSettings(value: unknown): Settings {
  const fallback = defaultSettings();
  if (!value || typeof value !== 'object') return fallback;
  const raw = value as Record<string, unknown>;
  const settings: Settings = {
    semesterName: asText(raw.semesterName, 30) || fallback.semesterName,
    startDate: asDate(raw.startDate) || fallback.startDate,
    endDate: asDate(raw.endDate) || fallback.endDate,
  };
  return semesterError(settings) ? fallback : settings;
}

export function normalizeState(value: unknown): AppState | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1) return null;
  const courses = normalizeCourses(raw.courses);
  const pinHash = typeof raw.pinHash === 'string' && /^[0-9a-f]{64}$/.test(raw.pinHash) ? raw.pinHash : null;
  return {
    version: 1,
    settings: normalizeSettings(raw.settings),
    courses,
    attendance: normalizeAttendance(raw.attendance, new Set(courses.map((course) => course.id))),
    pinHash,
  };
}

export function buildBackup(
  state: Pick<AppState, 'settings' | 'courses' | 'attendance'>,
  exportedAt = new Date().toISOString(),
): BackupFile {
  return {
    version: 1,
    exportedAt,
    settings: state.settings,
    courses: state.courses,
    attendance: state.attendance,
  };
}

export function parseBackup(value: unknown): { ok: true; data: BackupFile } | { ok: false; error: string } {
  if (!value || typeof value !== 'object') return { ok: false, error: '파일을 읽을 수 없어요.' };
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1) return { ok: false, error: '이 앱에서 만든 백업 파일이 아니에요.' };
  if (!raw.settings || !Array.isArray(raw.courses) || !Array.isArray(raw.attendance)) {
    return { ok: false, error: '백업 내용이 올바르지 않아요.' };
  }
  const courses = normalizeCourses(raw.courses);
  const data: BackupFile = {
    version: 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
    settings: normalizeSettings(raw.settings),
    courses,
    attendance: normalizeAttendance(raw.attendance, new Set(courses.map((course) => course.id))),
  };
  return { ok: true, data };
}

export function initialState(now = new Date()): AppState {
  return {
    version: 1,
    settings: defaultSettings(now),
    courses: [],
    attendance: [],
    pinHash: null,
  };
}

export function statusLabel(status: AttendanceStatus | null): string {
  if (!status) return '미체크';
  return STATUSES.find((item) => item.id === status)?.label ?? '미체크';
}
