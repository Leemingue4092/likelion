import type { CSSProperties } from 'react';
import { useApp } from '../app-context';
import { formatCompactDate, formatKoreanDate, formatTimeRange, ddayLabel } from '../dates';
import {
  classesOnDate,
  examKindLabel,
  findRecord,
  nextClassDay,
  semesterWeek,
  unmarkedPastCount,
  upcomingExams,
} from '../logic';
import type { Course } from '../types';
import { CourseDot, EmptyState, StatusButtons } from './ui';

export function TodayView() {
  const { state, todayISO, dispatch, openCourseForm, openDate, openDetail, setTab } = useApp();
  const { settings, courses, attendance } = state;
  const todayClasses = classesOnDate(courses, settings, todayISO);
  const week = semesterWeek(todayISO, settings);
  const exams = upcomingExams(courses, todayISO).slice(0, 3);
  const missed = unmarkedPastCount(courses, settings, attendance, todayISO);
  const checked = todayClasses.filter((course) => findRecord(attendance, course.id, todayISO)).length;
  const upcoming = nextClassDay(courses, settings, todayISO);

  return (
    <section className="view">
      <header className="view-head">
        <div>
          <p className="kicker">{settings.semesterName}{week ? ` · ${week}주차` : ''}</p>
          <h1>{formatKoreanDate(todayISO)}</h1>
        </div>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="아직 수업이 없어요"
          body="과목, 요일, 중간고사와 기말고사 날짜를 적으면 달력과 출석 칸이 만들어져요. 기록은 이 기기에만 남아요."
          action={
            <button type="button" className="primary" onClick={() => openCourseForm(null)}>
              첫 수업 추가
            </button>
          }
        />
      ) : (
        <>
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
              아직 체크하지 않은 지난 수업이 {missed}번 있어요.
            </button>
          )}

          <div className="section-label">
            <h2>오늘 수업</h2>
            {todayClasses.length > 0 && (
              <span>
                {checked}/{todayClasses.length} 체크
              </span>
            )}
          </div>

          {todayClasses.length === 0 ? (
            <section className="card quiet">
              <h2>오늘은 수업이 없는 날이에요</h2>
              {upcoming ? (
                <p>
                  다음 수업은 {formatCompactDate(upcoming.date)} {upcoming.courses[0]?.name}
                  {upcoming.courses.length > 1 ? ` 외 ${upcoming.courses.length - 1}과목` : ''}이에요.
                </p>
              ) : (
                <p>학기 기간 안에는 다음 수업이 없어요. 기간과 요일을 설정에서 확인해 주세요.</p>
              )}
              <button type="button" className="ghost" onClick={() => openDate(todayISO)}>
                달력에서 시험일 넣기
              </button>
            </section>
          ) : (
            <div className="today-list">
              {todayClasses.map((course) => (
                <TodayCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <button type="button" className="text-btn add-link" onClick={() => openCourseForm(null)}>
              수업 추가
            </button>
          )}
        </>
      )}
    </section>
  );

  function TodayCard({ course }: { course: Course }) {
    const record = findRecord(attendance, course.id, todayISO);
    const time = formatTimeRange(course.startTime, course.endTime);
    return (
      <article className="card class-card" style={{ '--c': course.color } as CSSProperties}>
        <button type="button" className="class-main" onClick={() => openDetail(course.id)}>
          <span className="class-title">
            <CourseDot color={course.color} />
            <strong>{course.name}</strong>
          </span>
          <span className="meta">
            {[time, course.room, course.instructor].filter(Boolean).join(' · ') || '시간 미정'}
          </span>
        </button>
        <StatusButtons
          value={record?.status ?? null}
          onChange={(status) => dispatch({ type: 'mark', courseId: course.id, date: todayISO, status })}
        />
      </article>
    );
  }
}
