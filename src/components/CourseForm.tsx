import { useState } from 'react';
import { useApp } from '../app-context';
import { WEEKDAY_LABELS } from '../dates';
import { COURSE_COLORS, emptyCourse, newId, syncCourseSchedule, timeOrderError } from '../logic';
import type { Course, Meeting } from '../types';
import { Dialog, Sheet, cx } from './ui';

export function CourseForm({ courseId, onClose }: { courseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const existing = courseId ? (state.courses.find((course) => course.id === courseId) ?? null) : null;
  const [draft, setDraft] = useState<Course>(() => {
    if (existing) return existing;
    return emptyCourse({
      color: COURSE_COLORS[state.courses.length % COURSE_COLORS.length],
      meetings: [{ weekday: 1, startTime: '09:00', endTime: '10:30', room: '' }],
    });
  });
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameError = draft.name.trim() ? '' : '과목 이름을 입력해 주세요.';
  const meetingError = meetingProblem(draft.meetings);
  const palette = COURSE_COLORS.some((color) => color === draft.color) ? COURSE_COLORS : [draft.color, ...COURSE_COLORS];

  function patch(partial: Partial<Course>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function updateMeeting(index: number, partial: Partial<Meeting>) {
    patch({
      meetings: draft.meetings.map((meeting, item) => (item === index ? { ...meeting, ...partial } : meeting)),
    });
  }

  function save() {
    setTried(true);
    if (nameError || meetingError) return;
    dispatch({
      type: 'save-course',
      course: syncCourseSchedule({ ...draft, id: draft.id || newId(), name: draft.name.trim() }),
    });
    onClose();
  }

  return (
    <Sheet title={existing ? '수업 수정' : '수업 추가'} onClose={onClose}>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span>과목 이름</span>
          <input
            value={draft.name}
            maxLength={40}
            autoComplete="off"
            placeholder="자료구조"
            onChange={(event) => patch({ name: event.target.value })}
          />
          {tried && nameError && <small className="form-error">{nameError}</small>}
        </label>
        <label className="field">
          <span>담당</span>
          <input
            value={draft.instructor}
            maxLength={30}
            autoComplete="off"
            placeholder="김교수"
            onChange={(event) => patch({ instructor: event.target.value })}
          />
        </label>
        <fieldset className="field">
          <legend>색</legend>
          <div className="color-row">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                className={cx('swatch', draft.color === color && 'on')}
                style={{ background: color }}
                aria-label={`색 ${color}`}
                aria-pressed={draft.color === color}
                onClick={() => patch({ color })}
              />
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>수업 시간</legend>
          <div className="stack">
            {draft.meetings.map((meeting, index) => (
              <div key={index} className="meeting-row">
                <select
                  className="meeting-day"
                  aria-label={`수업 ${index + 1} 요일`}
                  value={meeting.weekday}
                  onChange={(event) => updateMeeting(index, { weekday: Number(event.target.value) })}
                >
                  {WEEKDAY_LABELS.map((label, day) => (
                    <option key={label} value={day}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  className="meeting-time"
                  type="time"
                  aria-label={`수업 ${index + 1} 시작`}
                  value={meeting.startTime}
                  onChange={(event) => updateMeeting(index, { startTime: event.target.value })}
                />
                <input
                  className="meeting-time"
                  type="time"
                  aria-label={`수업 ${index + 1} 끝`}
                  value={meeting.endTime}
                  onChange={(event) => updateMeeting(index, { endTime: event.target.value })}
                />
                <input
                  className="meeting-room"
                  aria-label={`수업 ${index + 1} 강의실`}
                  value={meeting.room}
                  maxLength={30}
                  placeholder="강의실"
                  onChange={(event) => updateMeeting(index, { room: event.target.value })}
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`수업 ${index + 1} 삭제`}
                  onClick={() => patch({ meetings: draft.meetings.filter((_, item) => item !== index) })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              const used = new Set(draft.meetings.map((meeting) => meeting.weekday));
              const weekday = [1, 2, 3, 4, 5, 6, 0].find((day) => !used.has(day)) ?? 1;
              patch({
                meetings: [...draft.meetings, { weekday, startTime: '09:00', endTime: '10:30', room: '' }],
              });
            }}
          >
            시간 추가
          </button>
          <small className="fine">요일마다 한 칸이에요. 학기 시작부터 그 요일의 출석이 생겨요.</small>
          {tried && meetingError && <small className="form-error">{meetingError}</small>}
        </fieldset>
        <div className="two-col">
          <label className="field">
            <span>중간고사</span>
            <input type="date" value={draft.midtermDate} onChange={(event) => patch({ midtermDate: event.target.value })} />
            {draft.midtermDate && (
              <button type="button" className="text-btn" onClick={() => patch({ midtermDate: '' })}>
                날짜 지우기
              </button>
            )}
          </label>
          <label className="field">
            <span>기말고사</span>
            <input type="date" value={draft.finalDate} onChange={(event) => patch({ finalDate: event.target.value })} />
            {draft.finalDate && (
              <button type="button" className="text-btn" onClick={() => patch({ finalDate: '' })}>
                날짜 지우기
              </button>
            )}
          </label>
        </div>
        <label className="field">
          <span>메모</span>
          <textarea
            value={draft.note}
            maxLength={200}
            rows={3}
            placeholder="교재, 과제, 기억할 점"
            onChange={(event) => patch({ note: event.target.value })}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="primary">
            저장
          </button>
          {existing && (
            <button type="button" className="danger" onClick={() => setConfirmDelete(true)}>
              이 수업 삭제
            </button>
          )}
        </div>
      </form>
      {confirmDelete && existing && (
        <Dialog
          title="수업을 삭제할까요?"
          body={`${existing.name}의 출석과 점수도 함께 지워져요.`}
          confirmLabel="삭제"
          danger
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            dispatch({ type: 'delete-course', id: existing.id });
            onClose();
          }}
        />
      )}
    </Sheet>
  );
}

function meetingProblem(meetings: Meeting[]): string {
  const days = new Set<number>();
  for (const meeting of meetings) {
    if (days.has(meeting.weekday)) return '같은 요일은 한 번만 넣을 수 있어요.';
    days.add(meeting.weekday);
    if (!meeting.startTime || !meeting.endTime) return '시작과 끝 시간을 입력해 주세요.';
    const order = timeOrderError(meeting.startTime, meeting.endTime);
    if (order) return order;
  }
  return '';
}
