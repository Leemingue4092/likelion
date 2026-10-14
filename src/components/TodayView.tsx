import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useApp } from '../app-context';
import {
  WEEKDAY_LABELS,
  addDaysISO,
  ddayLabel,
  formatCompactDate,
  formatTimeRange,
  mondayOf,
  parseISODate,
} from '../dates';
import {
  classesOnDate,
  examKindLabel,
  findRecord,
  markersInRange,
  meetingOn,
  semesterWeek,
  unmarkedPastCount,
  upcomingExams,
} from '../logic';
import type { Course } from '../types';
import { StatusButtons, cx } from './ui';

const GRID_START = 9 * 60;
const GRID_HOURS = 9;

const STATUS_MARK: Record<string, string> = {
  present: '출',
  late: '지',
  absent: '결',
  excused: '공',
  cancelled: '휴',
};

function minutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function clampMonday(iso: string, startDate: string, endDate: string): string {
  const monday = mondayOf(iso);
  const first = mondayOf(startDate);
  const last = mondayOf(endDate);
  if (monday < first) return first;
  if (monday > last) return last;
  return monday;
}

function weekTitle(monday: string): string {
  const friday = addDaysISO(monday, 4);
  const start = parseISODate(monday);
  const end = parseISODate(friday);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`;
  }
  return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

export function TodayView() {
  const { state, todayISO, dispatch, openDate, openDetail, setTab } = useApp();
  const { settings, courses, attendance } = state;
  const firstMonday = mondayOf(settings.startDate);
  const lastMonday = mondayOf(settings.endDate);
  const [monday, setMonday] = useState(() => clampMonday(todayISO, settings.startDate, settings.endDate));
  const [picked, setPicked] = useState<{ courseId: string; date: string } | null>(null);
  const days = useMemo(() => [0, 1, 2, 3, 4].map((offset) => addDaysISO(monday, offset)), [monday]);
  const holidaySet = useMemo(() => new Set(settings.holidays), [settings.holidays]);
  const visibleWeek = days.map((iso) => semesterWeek(iso, settings)).find((week) => week !== null) ?? null;
  const exams = upcomingExams(courses, todayISO).slice(0, 3);
  const missed = unmarkedPastCount(courses, settings, attendance, todayISO);
  const weekNotes = markersInRange(settings, days[0], days[4]);
  const pickedCourse = picked ? courses.find((course) => course.id === picked.courseId) : null;
  const pickedMeeting =
    picked && pickedCourse ? meetingOn(pickedCourse, parseISODate(picked.date).getDay()) : null;
  const pickedRecord = picked ? findRecord(attendance, picked.courseId, picked.date) : null;

  function shiftWeek(delta: number) {
    const next = addDaysISO(monday, delta * 7);
    if (next < firstMonday || next > lastMonday) return;
    setMonday(next);
    setPicked(null);
  }

  function choose(course: Course, date: string) {
    setPicked((current) =>
      current?.courseId === course.id && current.date === date ? null : { courseId: course.id, date },
    );
  }

  return (
    <section className="view">
      <header className="view-head">
        <div>
          <p className="kicker">
            {[settings.schoolName, settings.semesterName].filter(Boolean).join(' · ')}
            {visibleWeek ? ` · ${visibleWeek}주차` : ''}
          </p>
          <h1>시간표</h1>
        </div>
      </header>

      {exams.length > 0 && (
        <div className="banner-row">
          {exams.map((exam) => (
            <button
              key={`${exam.course.id}-${exam.kind}`}
              type="button"
              className="exam-banner"
              onClick={() => openDate(exam.date)}
            >
              <span className="dday">{ddayLabel(exam.diff)}</span>
              <span>
                <strong>{exam.course.name}</strong>
                <small>
                  {examKindLabel(exam.kind)} · {formatCompactDate(exam.date)}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      {missed > 0 && (
        <button type="button" className="inline-banner" onClick={() => setTab('courses')}>
          오늘까지 체크하지 않은 수업이 {missed}번 있어요.
        </button>
      )}

      <div className="week-nav">
        <button type="button" className="icon-btn" aria-label="이전 주" disabled={monday <= firstMonday} onClick={() => shiftWeek(-1)}>
          ‹
        </button>
        <div>
          <strong>{weekTitle(monday)}</strong>
          {monday !== clampMonday(todayISO, settings.startDate, settings.endDate) && (
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setMonday(clampMonday(todayISO, settings.startDate, settings.endDate));
                setPicked(null);
              }}
            >
              이번 주
            </button>
          )}
        </div>
        <button type="button" className="icon-btn" aria-label="다음 주" disabled={monday >= lastMonday} onClick={() => shiftWeek(1)}>
          ›
        </button>
      </div>

      {weekNotes.length > 0 && (
        <p className="fine week-note">
          {weekNotes.some((marker) => marker.kind === 'exam')
            ? `이번 주는 ${weekNotes.map((marker) => marker.label).join(' · ')} 주간이에요. 수업이 열리면 출석이나 휴강으로 표시해요.`
            : `이번 주에는 ${weekNotes.map((marker) => marker.label).join(' · ')}이 있어요. 휴일 칸은 출석에서 빠져 있어요.`}
        </p>
      )}

      <p className="fine">칸을 누르면 그 수업의 출석을 표시해요. 개강일인 8월 31일부터 넘길 수 있어요.</p>
      <div className="tt" style={{ '--hours': String(GRID_HOURS) } as CSSProperties}>
        <div className="tt-head">
          <span />
          <div className="tt-dows">
            {days.map((iso) => {
              const date = parseISODate(iso);
              return (
                <span key={iso} className={cx('tt-dow', iso === todayISO && 'is-today', holidaySet.has(iso) && 'is-holiday')}>
                  <small>{WEEKDAY_LABELS[date.getDay()]}</small>
                  <strong>{date.getDate()}</strong>
                </span>
              );
            })}
          </div>
        </div>
        <div className="tt-body">
          <div className="tt-times" aria-hidden="true">
            {Array.from({ length: GRID_HOURS }, (_, index) => (
              <span key={index} style={{ '--i': index } as CSSProperties}>
                {9 + index}
              </span>
            ))}
          </div>
          <div className="tt-cols">
            {days.map((iso) => {
              const weekday = parseISODate(iso).getDay();
              const holiday = holidaySet.has(iso);
              const blocks = holiday ? [] : classesOnDate(courses, settings, iso);
              return (
                <div key={iso} className={cx('tt-col', holiday && 'is-holiday', iso === todayISO && 'is-today')}>
                  {holiday && <span className="tt-holiday">휴일</span>}
                  {blocks.map((course) => {
                    const meeting = meetingOn(course, weekday);
                    if (!meeting?.startTime || !meeting.endTime) return null;
                    const start = minutes(meeting.startTime);
                    const end = minutes(meeting.endTime);
                    const record = findRecord(attendance, course.id, iso);
                    const selected = picked?.courseId === course.id && picked.date === iso;
                    return (
                      <button
                        key={course.id}
                        type="button"
                        className={cx('tt-block', selected && 'on', record && `is-${record.status}`)}
                        style={
                          {
                            '--c': course.color,
                            top: `${((start - GRID_START) / (GRID_HOURS * 60)) * 100}%`,
                            height: `${((end - start) / (GRID_HOURS * 60)) * 100}%`,
                          } as CSSProperties
                        }
                        aria-pressed={selected}
                        aria-label={`${course.name} ${meeting.startTime} ${record ? STATUS_MARK[record.status] : '미체크'}`}
                        onClick={() => choose(course, iso)}
                      >
                        <strong>{course.name}</strong>
                        <small>{meeting.room}</small>
                        {record && <em className="tt-badge">{STATUS_MARK[record.status]}</em>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {picked && pickedCourse && (
        <article className="card mark-dock">
          <div className="mark-head">
            <div>
              <strong>{pickedCourse.name}</strong>
              <p className="meta">
                {formatCompactDate(picked.date)}
                {pickedMeeting ? ` · ${formatTimeRange(pickedMeeting.startTime, pickedMeeting.endTime)}` : ''}
                {pickedMeeting?.room ? ` · ${pickedMeeting.room}` : ''}
              </p>
            </div>
            <button type="button" className="icon-btn" aria-label="출석 닫기" onClick={() => setPicked(null)}>
              ×
            </button>
          </div>
          <StatusButtons
            value={pickedRecord?.status ?? null}
            onChange={(status) =>
              dispatch({ type: 'mark', courseId: picked.courseId, date: picked.date, status, note: pickedRecord?.note })
            }
          />
          <button type="button" className="text-btn" onClick={() => openDetail(pickedCourse.id)}>
            이 수업 기록 보기
          </button>
        </article>
      )}
    </section>
  );
}
