export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'cancelled';

export type Tab = 'today' | 'calendar' | 'courses' | 'grades';

export interface Meeting {
  weekday: number;
  startTime: string;
  endTime: string;
  room: string;
}

export type MarkerKind = 'holiday' | 'exam' | 'makeup';

export interface SemesterMarker {
  startDate: string;
  endDate: string;
  label: string;
  kind: MarkerKind;
}

export interface Settings {
  semesterName: string;
  startDate: string;
  endDate: string;
  schoolName: string;
  holidays: string[];
  markers: SemesterMarker[];
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
  meetings: Meeting[];
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
