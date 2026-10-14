import { useState } from 'react';
import { useApp } from '../app-context';
import { WEEKDAY_LABELS } from '../dates';
import { COURSE_COLORS, emptyCourse, newId, timeOrderError } from '../logic';
import type { Course } from '../types';
import { Dialog, Sheet, cx } from './ui';

export function CourseForm({ courseId, onClose }: { courseId: string | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const existing = courseId ? (state.courses.find((course) => course.id === courseId) ?? null) : null;
  const [draft, setDraft] = useState<Course>(
    () => existing ?? emptyCourse({ color: COURSE_COLORS[state.courses.length % COURSE_COLORS.length] }),
  );
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameError = draft.name.trim() ? '' : '과목 이름을 입력해 주세요.';
  const timeError = timeOrderError(draft.startTime, draft.endTime) ?? '';

  function patch(partial: Partial<Course>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function toggleDay(day: number) {
    patch({
      weekdays: draft.weekdays.includes(day)
        ? draft.weekdays.filter((item) => item !== day)
        : [...draft.weekdays, day],
    });
  }

  function save() {
    setTried(true);
    if (nameError || timeError) return;
    dispatch({
      type: 'save-course',
      course: { ...draft, id: draft.id || newId(), name: draft.name.trim() },
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
        <div className="two-col">
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
          <label className="field">
            <span>강의실</span>
            <input
              value={draft.room}
              maxLength={30}
              autoComplete="off"
              placeholder="공학관 301"
              onChange={(event) => patch({ room: event.target.value })}
            />
          </label>
        </div>
        <fieldset className="field">
          <legend>색</legend>
          <div className="color-row">
            {COURSE_COLORS.map((color) => (
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
          <legend>수업 요일</legend>
          <div className="weekday-row">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={label}
                type="button"
                className={cx('weekday', draft.weekdays.includes(day) && 'on', day === 0 && 'sun', day === 6 && 'sat')}
                aria-pressed={draft.weekdays.includes(day)}
                onClick={() => toggleDay(day)}
              >
                {label}
              </button>
            ))}
          </div>
          <small className="fine">요일을 고르면 학기 기간 동안 출석 칸이 생겨요.</small>
        </fieldset>
        <div className="two-col">
          <label className="field">
            <span>시작</span>
            <input type="time" value={draft.startTime} onChange={(event) => patch({ startTime: event.target.value })} />
          </label>
          <label className="field">
            <span>끝</span>
            <input type="time" value={draft.endTime} onChange={(event) => patch({ endTime: event.target.value })} />
          </label>
        </div>
        {timeError && <small className="form-error">{timeError}</small>}
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
