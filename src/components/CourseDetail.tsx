import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useApp } from '../app-context';
import { WEEKDAY_LABELS, formatTimeRange, groupByMonth, parseISODate } from '../dates';
import { courseStats, findRecord, formatPoint, formatSchedule, meetingOn, regularSessionDates, sessionTimeline } from '../logic';
import type { Course } from '../types';
import { BackButton, StatusButtons } from './ui';

export function CourseDetail({ course }: { course: Course }) {
  const { state, todayISO, dispatch, setDetailId, openCourseForm } = useApp();
  const stats = courseStats(course, state.settings, state.attendance, todayISO);
  const dates = sessionTimeline(course, state.settings, state.attendance);
  const regular = new Set(regularSessionDates(course, state.settings));
  const [openDate, setOpenDate] = useState<string | null>(todayISO);

  return (
    <article className="card detail-card" style={{ '--c': course.color } as CSSProperties}>
      <BackButton onClick={() => setDetailId(null)} />
      <header className="detail-head">
        <p className="kicker">{course.instructor || '수업'}</p>
        <h2>{course.name}</h2>
        <p className="meta">{formatSchedule(course)}</p>
      </header>
      <div className="rate-block">
        <strong>{stats.rate === null ? '—' : `${formatPoint(stats.rate)}%`}</strong>
        <span>{stats.counted > 0 ? `${stats.attended}/${stats.counted}` : '체크 전'}</span>
        <div className="progress" aria-hidden="true">
          <i style={{ width: `${stats.rate ?? 0}%` }} />
        </div>
      </div>
      <p className="stat-line">
        출석 {stats.present} · 지각 {stats.late} · 공결 {stats.excused} · 결석 {stats.absent} · 휴강 {stats.cancelled} · 미체크 {stats.unmarkedPast}
      </p>
      <details className="hint">
        <summary>출석률 계산</summary>
        <p>출석, 지각, 공결을 출석으로 보고 결석은 빠짐으로 계산해요. 휴강과 아직 체크하지 않은 날은 빼요. 같은 버튼을 다시 누르면 체크가 지워져요.</p>
      </details>
      {course.note && <p className="note-copy">{course.note}</p>}
      <button type="button" className="ghost" onClick={() => openCourseForm(course.id)}>
        수업 정보 수정
      </button>
      {dates.length === 0 ? (
        <p className="quiet-copy">요일을 정하면 출석할 날이 여기 모여요.</p>
      ) : (
        groupByMonth(dates).map((group) => (
          <section key={group.key} className="month-group">
            <h3>{group.label}</h3>
            <ul>
              {group.dates.map((date) => {
                const record = findRecord(state.attendance, course.id, date);
                const open = openDate === date;
                const meeting = meetingOn(course, parseISODate(date).getDay());
                return (
                  <li key={date} className={date === todayISO ? 'is-today-row' : ''}>
                    <button type="button" className="session-row" onClick={() => setOpenDate(open ? null : date)}>
                      <span>
                        {parseISODate(date).getDate()}일 ({WEEKDAY_LABELS[parseISODate(date).getDay()]})
                        {meeting ? ` ${formatTimeRange(meeting.startTime, meeting.endTime)}` : ''}
                        {meeting?.room ? ` ${meeting.room}` : ''}
                        {!regular.has(date) && <em className="chip">보강</em>}
                      </span>
                      <span className={record ? `pill ${record.status}` : 'pill'}>{record ? label(record.status) : date > todayISO ? '예정' : '미체크'}</span>
                    </button>
                    {open && (
                      <div className="session-edit">
                        <StatusButtons
                          value={record?.status ?? null}
                          onChange={(status) =>
                            dispatch({ type: 'mark', courseId: course.id, date, status, note: record?.note })
                          }
                        />
                        <input
                          className="note-input"
                          value={record?.note ?? ''}
                          maxLength={80}
                          disabled={!record}
                          placeholder={record ? '메모 (선택)' : '상태를 고르면 메모를 적을 수 있어요'}
                          aria-label={`${course.name} ${date} 메모`}
                          onChange={(event) => {
                            if (!record) return;
                            dispatch({
                              type: 'mark',
                              courseId: course.id,
                              date,
                              status: record.status,
                              note: event.target.value,
                            });
                          }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </article>
  );
}

function label(status: string): string {
  if (status === 'present') return '출석';
  if (status === 'late') return '지각';
  if (status === 'absent') return '결석';
  if (status === 'excused') return '공결';
  if (status === 'cancelled') return '휴강';
  return '미체크';
}
