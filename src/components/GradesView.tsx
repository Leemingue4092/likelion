import { useEffect, useRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import { useApp } from '../app-context';
import { compareCourses, formatPoint, gradeNote, gradeSummary, overallAverage } from '../logic';
import type { Course } from '../types';
import { CourseDot, EmptyState } from './ui';

export function GradesView() {
  const { state, dispatch, openCourseForm, gradeFocusId } = useApp();
  const courses = [...state.courses].sort(compareCourses);
  const average = overallAverage(courses);
  const focusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: 'center' });
  }, [gradeFocusId]);

  return (
    <section className="view">
      <header className="view-head">
        <div>
          <p className="kicker">입력된 과목의 단순 평균</p>
          <h1>성적</h1>
        </div>
      </header>
      {courses.length === 0 ? (
        <EmptyState
          title="점수를 적을 수업이 없어요"
          body="수업을 추가한 뒤 중간고사, 기말고사, 기타 점수를 넣을 수 있어요."
          action={
            <button type="button" className="primary" onClick={() => openCourseForm(null)}>
              수업 추가
            </button>
          }
        />
      ) : (
        <div className="grade-grid">
          <section className="card avg-hero">
            <p>전체 평균</p>
            <strong>{average.average === null ? '—' : formatPoint(average.average)}</strong>
            <span>{average.counted > 0 ? `${average.counted}과목 반영` : '점수를 입력하면 평균이 나와요'}</span>
          </section>
          {courses.map((course) => (
            <GradeCard
              key={course.id}
              course={course}
              focused={course.id === gradeFocusId}
              cardRef={course.id === gradeFocusId ? focusRef : undefined}
              onChange={(next) => dispatch({ type: 'save-course', course: next })}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GradeCard({
  course,
  focused,
  cardRef,
  onChange,
}: {
  course: Course;
  focused: boolean;
  cardRef?: Ref<HTMLElement>;
  onChange: (course: Course) => void;
}) {
  const summary = gradeSummary(course);
  const note = gradeNote(summary);
  return (
    <article
      ref={cardRef}
      className={focused ? 'card grade-card focused' : 'card grade-card'}
      style={{ '--c': course.color } as CSSProperties}
    >
      <div className="class-title">
        <CourseDot color={course.color} />
        <h2>{course.name}</h2>
      </div>
      <ScoreRow
        label="중간고사"
        date={course.midtermDate}
        score={course.midtermScore}
        max={course.midtermMax}
        weight={course.midtermWeight}
        onDate={(midtermDate) => onChange({ ...course, midtermDate })}
        onScore={(midtermScore) => onChange({ ...course, midtermScore })}
        onMax={(midtermMax) => onChange({ ...course, midtermMax })}
        onWeight={(midtermWeight) => onChange({ ...course, midtermWeight })}
      />
      <ScoreRow
        label="기말고사"
        date={course.finalDate}
        score={course.finalScore}
        max={course.finalMax}
        weight={course.finalWeight}
        onDate={(finalDate) => onChange({ ...course, finalDate })}
        onScore={(finalScore) => onChange({ ...course, finalScore })}
        onMax={(finalMax) => onChange({ ...course, finalMax })}
        onWeight={(finalWeight) => onChange({ ...course, finalWeight })}
      />
      <label className="field compact">
        <span>기타 이름</span>
        <input
          value={course.otherLabel}
          maxLength={20}
          aria-label={`${course.name} 기타 점수 이름`}
          onChange={(event) => onChange({ ...course, otherLabel: event.target.value })}
        />
      </label>
      <ScoreRow
        label={course.otherLabel.trim() || '기타'}
        date=""
        hideDate
        score={course.otherScore}
        max={course.otherMax}
        weight={course.otherWeight}
        onDate={() => undefined}
        onScore={(otherScore) => onChange({ ...course, otherScore })}
        onMax={(otherMax) => onChange({ ...course, otherMax })}
        onWeight={(otherWeight) => onChange({ ...course, otherWeight })}
      />
      <p className="estimate">
        예상 <strong>{summary.total === null ? '—' : formatPoint(summary.total)}</strong>
      </p>
      {note && <p className="fine">{note}</p>}
    </article>
  );
}

function ScoreRow({
  label,
  date,
  hideDate = false,
  score,
  max,
  weight,
  onDate,
  onScore,
  onMax,
  onWeight,
}: {
  label: string;
  date: string;
  hideDate?: boolean;
  score: number | null;
  max: number;
  weight: number;
  onDate: (value: string) => void;
  onScore: (value: number | null) => void;
  onMax: (value: number) => void;
  onWeight: (value: number) => void;
}) {
  return (
    <fieldset className="score-row">
      <legend>{label}</legend>
      {!hideDate && <input type="date" aria-label={`${label} 날짜`} value={date} onChange={(event) => onDate(event.target.value)} />}
      <div className="score-numbers">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={1000}
          step="0.1"
          aria-label={`${label} 점수`}
          value={score ?? ''}
          placeholder="점수"
          onChange={(event) => onScore(readScore(event.target.value))}
        />
        <span>/</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          max={1000}
          step="0.1"
          aria-label={`${label} 만점`}
          value={max}
          onChange={(event) => onMax(readMax(event.target.value))}
        />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          aria-label={`${label} 반영 비율`}
          value={weight}
          onChange={(event) => onWeight(readWeight(event.target.value))}
        />
        <span>%</span>
      </div>
    </fieldset>
  );
}

function readScore(raw: string): number | null {
  if (!raw.trim()) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1000) return null;
  return Math.round(value * 10) / 10;
}

function readMax(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 1000) return 100;
  return Math.round(value * 10) / 10;
}

function readWeight(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
