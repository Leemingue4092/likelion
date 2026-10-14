export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'cancelled';

export type Tab = 'today' | 'calendar' | 'courses' | 'grades';

export interface Settings {
  semesterName: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  room: string;
  color: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  midtermDate: string;
  finalDate: string;
  midtermScore: number | null;
  finalScore: number | null;
  midtermMax: number;
  finalMax: number;
  midtermWeight: number;
  finalWeight: number;
  otherLabel: string;
  otherScore: number | null;
  otherMax: number;
  otherWeight: number;
  note: string;
}

export interface AttendanceRecord {
  courseId: string;
  date: string;
  status: AttendanceStatus;
  note: string;
}

export interface AppState {
  version: 1;
  settings: Settings;
  courses: Course[];
  attendance: AttendanceRecord[];
  pinHash: string | null;
}

export interface BackupFile {
  version: 1;
  exportedAt: string;
  settings: Settings;
  courses: Course[];
  attendance: AttendanceRecord[];
}
