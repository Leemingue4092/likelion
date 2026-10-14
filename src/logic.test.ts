import { describe, expect, it } from 'vitest';
import { formatISODate, monthGrid, parseISODate } from './dates';
import {
  buildBackup,
  classesOnDate,
  courseStats,
  defaultSettings,
  emptyCourse,
  gradeNote,
  gradeSummary,
  normalizeState,
  overallAverage,
  parseBackup,
  regularSessionDates,
  upcomingExams,
} from './logic';
import { hashPin, reducer } from './store';
import type { AppState, Course, Settings } from './types';

const settings: Settings = {
  semesterName: '2026년 2학기',
  startDate: '2026-09-01',
  endDate: '2026-09-14',
};

function course(partial: Partial<Course> = {}): Course {
  return emptyCourse({
    id: 'algo',
    name: '자료구조',
    weekdays: [1, 3],
    startTime: '09:00',
    endTime: '10:30',
    ...partial,
  });
}

function baseState(): AppState {
  return {
    version: 1,
    settings,
    courses: [course()],
    attendance: [],
    pinHash: null,
  };
}

describe('달력', () => {
  it('2026년 10월 1일은 목요일이고 14일은 수요일이다', () => {
    expect(parseISODate('2026-10-01').getDay()).toBe(4);
    expect(parseISODate('2026-10-14').getDay()).toBe(3);
    const grid = monthGrid(2026, 10);
    expect(grid[0][4]).toBe('2026-10-01');
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
    expect(formatISODate(parseISODate('2026-02-31'))).not.toBe('2026-02-31');
  });
});

describe('출석', () => {
  it('학기 안의 월·수 수업만 정규 수업일로 만든다', () => {
    expect(regularSessionDates(course(), settings)).toEqual([
      '2026-09-02',
      '2026-09-07',
      '2026-09-09',
      '2026-09-14',
    ]);
    expect(classesOnDate([course()], settings, '2026-09-02').map((item) => item.id)).toEqual(['algo']);
    expect(classesOnDate([course()], settings, '2026-09-15')).toEqual([]);
  });

  it('지각은 출석으로 보고 휴강과 미체크는 출석률에서 뺀다', () => {
    const attendance = [
      { courseId: 'algo', date: '2026-09-02', status: 'present' as const, note: '' },
      { courseId: 'algo', date: '2026-09-07', status: 'late' as const, note: '' },
      { courseId: 'algo', date: '2026-09-09', status: 'absent' as const, note: '' },
      { courseId: 'algo', date: '2026-09-14', status: 'cancelled' as const, note: '' },
    ];
    const stats = courseStats(course(), settings, attendance, '2026-09-14');
    expect(stats).toMatchObject({ present: 1, late: 1, absent: 1, cancelled: 1, unmarkedPast: 0, attended: 2, counted: 3 });
    expect(stats.rate).toBeCloseTo((2 / 3) * 100);

    const earlier = courseStats(course(), settings, attendance.slice(0, 1), '2026-09-08');
    expect(earlier.unmarkedPast).toBe(1);
    expect(earlier.upcoming).toBe(2);
    expect(earlier.rate).toBe(100);
  });

  it('보강 기록은 정규 요일이 아니어도 출석률에 포함한다', () => {
    const attendance = [{ courseId: 'algo', date: '2026-09-05', status: 'excused' as const, note: '병원' }];
    const stats = courseStats(course(), settings, attendance, '2026-09-01');
    expect(stats.excused).toBe(1);
    expect(stats.rate).toBe(100);
  });

  it('체크를 지우면 기록이 사라지고 메모는 상태를 바꿀 때 유지된다', () => {
    let state = reducer(baseState(), { type: 'mark', courseId: 'algo', date: '2026-09-02', status: 'present' });
    state = reducer(state, { type: 'mark', courseId: 'algo', date: '2026-09-02', status: 'excused', note: '병원' });
    expect(state.attendance).toEqual([
      { courseId: 'algo', date: '2026-09-02', status: 'excused', note: '병원' },
    ]);
    state = reducer(state, { type: 'mark', courseId: 'algo', date: '2026-09-02', status: 'late' });
    expect(state.attendance[0]?.note).toBe('병원');
    state = reducer(state, { type: 'mark', courseId: 'algo', date: '2026-09-02', status: null });
    expect(state.attendance).toEqual([]);
  });

  it('수업을 지우면 출석 기록도 지운다', () => {
    const marked = reducer(baseState(), { type: 'mark', courseId: 'algo', date: '2026-09-02', status: 'present' });
    const next = reducer(marked, { type: 'delete-course', id: 'algo' });
    expect(next.courses).toEqual([]);
    expect(next.attendance).toEqual([]);
  });
});

describe('성적', () => {
  it('입력된 비율만으로 예상 점수를 계산한다', () => {
    const partial = gradeSummary(
      course({ midtermScore: 80, finalScore: 90, midtermWeight: 40, finalWeight: 40, otherWeight: 20 }),
    );
    expect(partial.total).toBeCloseTo(85);
    expect(partial.pendingLabels).toEqual(['기타']);
    expect(gradeNote(partial)).toContain('다시 맞춰');

    const full = gradeSummary(
      course({
        midtermScore: 80,
        finalScore: 90,
        otherScore: 100,
        midtermWeight: 40,
        finalWeight: 40,
        otherWeight: 20,
      }),
    );
    expect(full.total).toBeCloseTo(88);
    expect(gradeNote(full)).toBeNull();
    expect(overallAverage([course({ midtermScore: 80, finalScore: 80 }), course({ midtermScore: 100 })])).toMatchObject({
      counted: 2,
    });
  });

  it('다가오는 시험만 가까운 순서로 보여 준다', () => {
    const items = upcomingExams(
      [
        course({ midtermDate: '2026-10-21', finalDate: '2026-12-16' }),
        course({ id: 'eng', name: '영어', midtermDate: '2026-10-14', weekdays: [2] }),
      ],
      '2026-10-14',
    );
    expect(items.map((item) => [item.course.name, item.kind, item.diff])).toEqual([
      ['영어', 'midterm', 0],
      ['자료구조', 'midterm', 7],
    ]);
  });
});

describe('백업과 잠금', () => {
  it('백업 파일을 검사하고 비밀번호는 포함하지 않는다', () => {
    const backup = buildBackup(baseState(), '2026-10-14T00:00:00.000Z');
    expect(backup).not.toHaveProperty('pinHash');
    expect(parseBackup(backup).ok).toBe(true);
    expect(parseBackup({ version: 2 }).ok).toBe(false);
    const normalized = normalizeState({
      version: 1,
      settings: { semesterName: ' 가을 ', startDate: '2026-09-01', endDate: '2026-12-19' },
      courses: [course(), { id: 'bad' }, course({ name: '바뀐 이름' })],
      attendance: [
        { courseId: 'algo', date: '2026-09-02', status: 'present', note: '  메모  ' },
        { courseId: 'missing', date: '2026-09-02', status: 'absent', note: '' },
      ],
      pinHash: 'a'.repeat(64),
    });
    expect(normalized?.courses).toHaveLength(1);
    expect(normalized?.courses[0]?.name).toBe('바뀐 이름');
    expect(normalized?.attendance).toHaveLength(1);
    expect(normalized?.pinHash).toHaveLength(64);
  });

  it('기본 학기는 10월이면 그해 2학기다', () => {
    expect(defaultSettings(new Date(2026, 9, 14)).semesterName).toBe('2026년 2학기');
    expect(defaultSettings(new Date(2027, 0, 10)).semesterName).toBe('2026년 2학기');
  });

  it('비밀번호 해시는 네 자리를 그대로 저장하지 않는다', async () => {
    const hash = await hashPin('1357');
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain('1357');
    expect(await hashPin('1357')).toBe(hash);
    expect(await hashPin('1358')).not.toBe(hash);
  });
});
