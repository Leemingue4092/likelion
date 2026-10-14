import type { CSSProperties } from 'react';
import { useApp } from '../app-context';
import { formatCompactDate } from '../dates';
import { compareCourses, courseStats, formatPoint, formatSchedule } from '../logic';
import { CourseDetail } from './CourseDetail';
import { CourseDot, EmptyState, cx } from './ui';

export function CoursesView() {
  const { state, todayISO, detailId, setDetailId, openCourseForm } = useApp();
  const courses = [...state.courses].sort(compareCourses);
  const selected = courses.find((course) => course.id === detailId) ?? null;

  return (
    <section className="view">
      <header className="view-head">
        <div>
          <p className="kicker">{[state.settings.schoolName, state.settings.semesterName].filter(Boolean).join(' · ')}</p>
          <h1>수업</h1>
        </div>
        <button type="button" className="primary small" onClick={() => openCourseForm(null)}>
          수업 추가
        </button>
      </header>
      {courses.length === 0 ? (
        <EmptyState
          title="수업 목록이 비어 있어요"
          body="요일과 시간을 정해 두면 그 수업마다 출석을 체크할 수 있어요."
          action={
            <button type="button" className="primary" onClick={() => openCourseForm(null)}>
              첫 수업 추가
            </button>
          }
        />
      ) : (
        <div className={cx('courses-layout', selected && 'has-detail')}>
          <div className="course-list">
            {courses.map((course) => {
              const stats = courseStats(course, state.settings, state.attendance, todayISO);
              return (
                <button
                  key={course.id}
                  type="button"
                  className={cx('card course-button', selected?.id === course.id && 'selected')}
                  style={{ '--c': course.color } as CSSProperties}
                  onClick={() => setDetailId(course.id)}
                >
                  <span className="class-title">
                    <CourseDot color={course.color} />
                    <strong>{course.name}</strong>
                  </span>
                  <span className="meta">
                    {[formatSchedule(course), course.instructor].filter(Boolean).join(' · ')}
                  </span>
                  <span className="meta">
                    출석률 {stats.rate === null ? '—' : `${formatPoint(stats.rate)}%`}
                    {stats.unmarkedPast > 0 ? ` · 미체크 ${stats.unmarkedPast}` : ''}
                    {course.midtermDate ? ` · 중간 ${formatCompactDate(course.midtermDate)}` : ''}
                    {course.finalDate ? ` · 기말 ${formatCompactDate(course.finalDate)}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="course-detail-pane">
            {selected ? (
              <CourseDetail course={selected} />
            ) : (
              <section className="card quiet wide-only">
                <h2>수업을 고르면 출석 기록이 나와요</h2>
                <p>지난 미체크도 여기서 바로 채울 수 있어요.</p>
              </section>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
