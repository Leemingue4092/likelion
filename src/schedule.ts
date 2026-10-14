import type { Course, Meeting, Settings } from './types';

/** 순천향대학교 2026학년도 학사일정. 수업은 8월 31일 개강, 12월 4일까지. */
export function schSettings(): Settings {
  return {
    semesterName: '2026년 2학기',
    schoolName: '순천향대학교',
    startDate: '2026-08-31',
    endDate: '2026-12-04',
    holidays: ['2026-09-24', '2026-09-25', '2026-10-05', '2026-10-09'],
    markers: [
      { startDate: '2026-09-24', endDate: '2026-09-27', label: '추석', kind: 'holiday' },
      { startDate: '2026-10-05', endDate: '2026-10-05', label: '대체공휴일', kind: 'holiday' },
      { startDate: '2026-10-09', endDate: '2026-10-09', label: '한글날', kind: 'holiday' },
      { startDate: '2026-10-19', endDate: '2026-10-23', label: '중간고사', kind: 'exam' },
      { startDate: '2026-12-07', endDate: '2026-12-11', label: '기말고사', kind: 'exam' },
      { startDate: '2026-12-14', endDate: '2026-12-18', label: '보강주간', kind: 'makeup' },
    ],
  };
}

function schCourse(
  id: string,
  name: string,
  color: string,
  meetings: Meeting[],
): Course {
  const earliest = [...meetings].sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.weekday - b.weekday,
  )[0];
  const rooms = [...new Set(meetings.map((meeting) => meeting.room).filter(Boolean))];
  return {
    id,
    name,
    instructor: '',
    room: rooms.join(' · '),
    color,
    weekdays: [...new Set(meetings.map((meeting) => meeting.weekday))].sort((a, b) => a - b),
    startTime: earliest?.startTime ?? '',
    endTime: earliest?.endTime ?? '',
    meetings,
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
  };
}

export function schCourses(): Course[] {
  return [
    schCourse('circuit', '회로이론2', '#c45c52', [
      { weekday: 2, startTime: '10:30', endTime: '12:00', room: 'M203' },
      { weekday: 3, startTime: '15:00', endTime: '16:30', room: 'M203' },
    ]),
    schCourse('circuit-lab', '회로이론실습설계2', '#c4aa67', [
      { weekday: 2, startTime: '12:00', endTime: '16:00', room: 'M218' },
    ]),
    schCourse('europe', '유럽문화산책', '#adc77c', [
      { weekday: 3, startTime: '11:00', endTime: '13:00', room: 'U201' },
    ]),
    schCourse('english', '현대응용영어', '#7cb1a5', [
      { weekday: 3, startTime: '13:30', endTime: '15:00', room: 'RC203' },
      { weekday: 5, startTime: '13:30', endTime: '15:00', room: 'RC203' },
    ]),
    schCourse('career', '자기주도진로설계', '#738dc2', [
      { weekday: 4, startTime: '14:00', endTime: '15:00', room: 'M203' },
    ]),
    schCourse('em2', '전자기학2', '#cd9663', [
      { weekday: 4, startTime: '15:00', endTime: '18:00', room: 'H205' },
    ]),
    schCourse('ds', '자료구조', '#8575bb', [
      { weekday: 5, startTime: '09:00', endTime: '12:00', room: 'M203' },
    ]),
    schCourse('engmath', '공업수학3', '#77ac7b', [
      { weekday: 5, startTime: '15:00', endTime: '18:00', room: 'H205' },
    ]),
  ];
}
