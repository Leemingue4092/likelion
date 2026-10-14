import { initialState, normalizeState } from './logic';
import type { AppState, AttendanceRecord, AttendanceStatus, Course, Settings } from './types';

export const STORAGE_KEY = 'semester-note.v1';
const CORRUPT_KEY = 'semester-note.corrupt';

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'settings'; settings: Settings }
  | { type: 'save-course'; course: Course }
  | { type: 'delete-course'; id: string }
  | { type: 'mark'; courseId: string; date: string; status: AttendanceStatus | null; note?: string }
  | { type: 'pin'; pinHash: string | null }
  | { type: 'import'; settings: Settings; courses: Course[]; attendance: AttendanceRecord[] }
  | { type: 'reset' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'settings':
      return { ...state, settings: action.settings };
    case 'save-course': {
      const exists = state.courses.some((course) => course.id === action.course.id);
      const courses = exists
        ? state.courses.map((course) => (course.id === action.course.id ? action.course : course))
        : [...state.courses, action.course];
      return { ...state, courses };
    }
    case 'delete-course':
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== action.id),
        attendance: state.attendance.filter((record) => record.courseId !== action.id),
      };
    case 'mark': {
      const rest = state.attendance.filter(
        (record) => !(record.courseId === action.courseId && record.date === action.date),
      );
      if (action.status === null) return { ...state, attendance: rest };
      const previous = state.attendance.find(
        (record) => record.courseId === action.courseId && record.date === action.date,
      );
      const note = (action.note !== undefined ? action.note : (previous?.note ?? '')).slice(0, 80);
      return {
        ...state,
        attendance: [
          ...rest,
          { courseId: action.courseId, date: action.date, status: action.status, note },
        ],
      };
    }
    case 'pin':
      return { ...state, pinHash: action.pinHash };
    case 'import':
      return {
        ...state,
        settings: action.settings,
        courses: action.courses,
        attendance: action.attendance,
      };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

export function loadState(): { state: AppState; corrupted: boolean } {
  if (typeof localStorage === 'undefined') return { state: initialState(), corrupted: false };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { state: initialState(), corrupted: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    const state = normalizeState(parsed);
    if (!state) {
      localStorage.setItem(CORRUPT_KEY, raw);
      return { state: initialState(), corrupted: true };
    }
    return { state, corrupted: false };
  } catch {
    try {
      localStorage.setItem(CORRUPT_KEY, raw);
    } catch {
      /* The browser refused the backup write. The empty notebook still opens. */
    }
    return { state: initialState(), corrupted: true };
  }
}

export function saveState(state: AppState): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`semester-note.pin.v1:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
