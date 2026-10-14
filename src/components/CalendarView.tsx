import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useApp } from '../app-context';
import {
  WEEKDAY_LABELS,
  addMonths,
  formatCompactDate,
  formatKoreanDate,
  monthGrid,
  parseISODate,
} from '../dates';
import { dayPlan, examKindLabel, findRecord, semesterWeek } from '../logic';
import type { ExamKind } from '../logic';
import type { AttendanceRecord, AttendanceStatus, Course } from '../types';
import { Dialog, StatusButtons, cx, useWide } from './ui';

export function CalendarView() {
  const { state, todayISO, dispatch, focus, openCourseForm, openGrades } = useApp();
  const wide = useWide();
  const today = parseISODate(todayISO);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [selected, setSelected] = useState(todayISO);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState<{ course: Course; kind: ExamKind; previous: string } | null>(null);

  useEffect(() => {
    if (!focus) return;
    const date = parseISODate(focus.iso);
    setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 });
    setSelected(focus.iso);
    setSheet(true);
  }, [focus]);

  const weeks = monthGrid(cursor.year, cursor.month);
  const plan = dayPlan(state.courses, state.settings, state.attendance, selected);
  const outside =
    selected < state.settings.startDate || selected > state.settings.endDate
      ? '이 날은 학기 기간 밖이에요. 시험일은 넣을 수 있고, 정규 출석 칸은 학기 안에서만 생겨요.'
      : '';

  function selectDay(iso: string) {
    setSelected(iso);
    setSheet(true);
  }

  function move(delta: number) {
    setCursor((current) => addMonths(current.year, current.month, delta));
  }

  function applyExam(course: Course, kind: ExamKind) {
    const key = kind === 'midterm' ? 'midtermDate' : 'finalDate';
    const previous = course[key];
    if (previous === selected) {
      dispatch({ type: 'save-course', course: { ...course, [key]: '' } });
      return;
    }
    if (previous) {
      setConfirm({ course, kind, previous });
      return;
    }
    dispatch({ type: 'save-course', course: { ...course, [key]: selected } });
  }

  const week = semesterWeek(selected, state.settings);

  return (
    <section className="view">
      <header className="view-head">
        <div>
          <p className="kicker">{state.settings.semesterName}</p>
          <h1>달력</h1>
        </div>
      </header>
      <div className="calendar-layout">
        <div className="card month-card">
          <div className="month-nav">
            <button type="button" className="icon-btn" aria-label="이전 달" onClick={() => move(-1)}>
              ‹
            </button>
            <strong>
              {cursor.year}년 {cursor.month}월
            </strong>
            <button type="button" className="icon-btn" aria-label="다음 달" onClick={() => move(1)}>
              ›
            </button>
          </div>
          {(cursor.year !== today.getFullYear() || cursor.month !== today.getMonth() + 1) && (
            <button
              type="button"
              className="text-btn today-jump"
              onClick={() => {
                setCursor({ year: today.getFullYear(), month: today.getMonth() + 1 });
                selectDay(todayISO);
              }}
            >
              오늘로
            </button>
          )}
          <div className="dow" aria-hidden="true">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={label} className={index === 0 ? 'sun' : index === 6 ? 'sat' : ''}>
                {label}
              </span>
            ))}
          </div>
          <div className="month-grid">
            {weeks.flat().map((iso, index) => {
              if (!iso) return <span key={`empty-${index}`} className="day empty-day" />;
              const date = parseISODate(iso);
              const weekday = date.getDay();
              const classes = dayPlan(state.courses, state.settings, state.attendance, iso);
              const examCount = classes.exams.length;
              const dots = [...classes.regular, ...classes.extra].slice(0, 3);
              return (
                <button
                  key={iso}
                  type="button"
                  data-date={iso}
                  className={cx(
                    'day',
                    weekday === 0 && 'sun',
                    weekday === 6 && 'sat',
                    iso === todayISO && 'is-today',
                    iso === selected && 'is-selected',
                    examCount > 0 && 'has-exam',
                  )}
                  aria-label={`${formatKoreanDate(iso)}${dots.length ? `, 수업 ${dots.length}` : ''}${examCount ? `, 시험 ${examCount}` : ''}`}
                  aria-pressed={iso === selected}
                  onClick={() => selectDay(iso)}
                >
                  <span className="day-num">{date.getDate()}</span>
                  <span className="dots">
                    {examCount > 0 && <i className="exam-dot" />}
                    {dots.map((course) => (
                      <i key={course.id} style={{ '--c': course.color } as CSSProperties} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="legend">
            <i className="exam-dot" /> 시험
            <i className="sample-dot" /> 수업
          </p>
        </div>

        {sheet && !wide && <button type="button" className="scrim" aria-label="날짜 닫기" onClick={() => setSheet(false)} />}
        <aside className={cx('day-panel card', (sheet || wide) && 'open')}>
          <header className="day-head">
            <div>
              <p className="kicker">{week ? `${week}주차` : '학기 밖'}</p>
              <h2>{formatCompactDate(selected)}</h2>
            </div>
            <button type="button" className="icon-btn phone-only" aria-label="닫기" onClick={() => setSheet(false)}>
              ×
            </button>
          </header>
          {outside && <p className="fine">{outside}</p>}

          {plan.exams.length > 0 && (
            <div className="stack">
              {plan.exams.map((exam) => (
                <article key={`${exam.course.id}-${exam.kind}`} className="exam-card">
                  <div>
                    <strong>{exam.course.name}</strong>
                    <p>{examKindLabel(exam.kind)}</p>
                  </div>
                  <div className="inline-actions">
                    <button type="button" className="ghost tiny" onClick={() => openGrades(exam.course.id)}>
                      점수
                    </button>
                    <button type="button" className="ghost tiny" onClick={() => applyExam(exam.course, exam.kind)}>
                      날짜 지우기
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {[...plan.regular, ...plan.extra].length === 0 && plan.exams.length === 0 && (
            <p className="quiet-copy">이 날의 수업은 아직 없어요.</p>
          )}

          <div className="stack">
            {plan.regular.map((course) => (
              <ClassMark
                key={course.id}
                course={course}
                date={selected}
                makeup={false}
                record={findRecord(state.attendance, course.id, selected)}
                onMark={(status, note) => dispatch({ type: 'mark', courseId: course.id, date: selected, status, note })}
              />
            ))}
            {plan.extra.map((course) => (
              <ClassMark
                key={course.id}
                course={course}
                date={selected}
                makeup
                record={findRecord(state.attendance, course.id, selected)}
                onMark={(status, note) => dispatch({ type: 'mark', courseId: course.id, date: selected, status, note })}
              />
            ))}
          </div>

          {plan.availableForMakeup.length > 0 && (
            <details className="hint">
              <summary>보강 출석 추가</summary>
              <div className="stack">
                {plan.availableForMakeup.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className="ghost"
                    onClick={() =>
                      dispatch({ type: 'mark', courseId: course.id, date: selected, status: 'present' })
                    }
                  >
                    {course.name}
                  </button>
                ))}
              </div>
            </details>
          )}

          <details className="hint">
            <summary>이 날을 시험일로 지정</summary>
            {state.courses.length === 0 ? (
              <button type="button" className="primary" onClick={() => openCourseForm(null)}>
                수업 먼저 추가
              </button>
            ) : (
              <div className="stack">
                {state.courses.map((course) => (
                  <div key={course.id} className="exam-assign">
                    <span>{course.name}</span>
                    <button type="button" className="ghost tiny" onClick={() => applyExam(course, 'midterm')}>
                      {course.midtermDate === selected ? '중간 해제' : '중간'}
                    </button>
                    <button type="button" className="ghost tiny" onClick={() => applyExam(course, 'final')}>
                      {course.finalDate === selected ? '기말 해제' : '기말'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </details>
        </aside>
      </div>

      {confirm && (
        <Dialog
          title="시험일을 바꿀까요?"
          body={`${confirm.course.name} ${examKindLabel(confirm.kind)}를 ${formatCompactDate(confirm.previous)}에서 ${formatCompactDate(selected)}로 바꿔요.`}
          confirmLabel="바꾸기"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const key = confirm.kind === 'midterm' ? 'midtermDate' : 'finalDate';
            dispatch({ type: 'save-course', course: { ...confirm.course, [key]: selected } });
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}

function ClassMark({
  course,
  date,
  makeup,
  record,
  onMark,
}: {
  course: Course;
  date: string;
  makeup: boolean;
  record: AttendanceRecord | null;
  onMark: (status: AttendanceStatus | null, note?: string) => void;
}) {
  return (
    <article className="mark-card">
      <div className="class-title">
        <strong>{course.name}</strong>
        {makeup && <span className="chip">보강</span>}
      </div>
      <StatusButtons
        value={record?.status ?? null}
        onChange={(status) => onMark(status, record?.note)}
      />
      <input
        className="note-input"
        value={record?.note ?? ''}
        maxLength={80}
        placeholder={record ? '메모 (선택)' : '상태를 고르면 메모를 적을 수 있어요'}
        disabled={!record}
        aria-label={`${course.name} ${date} 메모`}
        onChange={(event) => {
          if (!record) return;
          onMark(record.status, event.target.value);
        }}
      />
    </article>
  );
}
