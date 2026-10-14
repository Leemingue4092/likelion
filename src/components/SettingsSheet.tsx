import { useRef, useState } from 'react';
import { useApp } from '../app-context';
import { buildBackup, parseBackup, semesterError } from '../logic';
import type { Settings } from '../types';
import { PinDialog } from './LockScreen';
import { Dialog, Sheet } from './ui';

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<Settings>(state.settings);
  const [message, setMessage] = useState('');
  const [pinMode, setPinMode] = useState<'create' | 'change' | 'disable' | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<ReturnType<typeof parseBackup> | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const error = semesterError(draft);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  function update(partial: Partial<Settings>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    if (!semesterError(next)) dispatch({ type: 'settings', settings: next });
  }

  function exportBackup() {
    const backup = buildBackup(state);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = backup.exportedAt.slice(0, 10);
    link.href = url;
    link.download = `학기수첩-백업-${stamp}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage('백업 파일을 저장했어요. 기기 안에 남겨 두면 나중에 다시 불러올 수 있어요.');
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 500_000) {
      setMessage('파일이 너무 커요.');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = parseBackup(parsed);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setPendingImport(result);
    } catch {
      setMessage('파일을 읽을 수 없어요.');
    }
  }

  return (
    <Sheet title="설정" onClose={onClose}>
      <div className="form">
        <section className="card quiet inset">
          <h2>이 기기에만 저장돼요</h2>
          <p>출석, 시험일, 점수는 서버로 보내지 않아요. 브라우저 데이터를 지우면 수첩도 사라지니 백업 파일을 남겨 두세요.</p>
        </section>
        <label className="field">
          <span>학기 이름</span>
          <input
            value={draft.semesterName}
            maxLength={30}
            onChange={(event) => update({ semesterName: event.target.value })}
          />
        </label>
        <div className="two-col">
          <label className="field">
            <span>시작</span>
            <input type="date" value={draft.startDate} onChange={(event) => update({ startDate: event.target.value })} />
          </label>
          <label className="field">
            <span>끝</span>
            <input type="date" value={draft.endDate} onChange={(event) => update({ endDate: event.target.value })} />
          </label>
        </div>
        {error ? (
          <small className="form-error">{error}</small>
        ) : (
          <small className="fine">출석 칸은 학기 시작과 끝, 수업 요일로 만들어져요. 학교 일정에 맞게 바꿔 주세요.</small>
        )}

        <h2 className="settings-label">잠금</h2>
        <p className="fine">다른 사람이 이 폰을 열 때를 대비한 잠금이에요. 비밀번호는 이 기기에만 있고, 잊으면 찾을 수 없어요.</p>
        {state.pinHash ? (
          <div className="stack">
            <button type="button" className="ghost" onClick={() => setPinMode('change')}>
              비밀번호 변경
            </button>
            <button type="button" className="ghost" onClick={() => setPinMode('disable')}>
              비밀번호 끄기
            </button>
          </div>
        ) : (
          <button type="button" className="ghost" onClick={() => setPinMode('create')}>
            비밀번호 설정
          </button>
        )}

        <h2 className="settings-label">백업</h2>
        <div className="stack">
          <button type="button" className="primary" onClick={exportBackup}>
            백업 파일 저장
          </button>
          <button type="button" className="ghost" onClick={() => fileRef.current?.click()}>
            백업 파일 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>
        {message && <p className="fine">{message}</p>}

        {!standalone && (
          <>
            <h2 className="settings-label">홈 화면에 추가</h2>
            <ol className="steps">
              <li>아이폰·아이패드 Safari에서 이 페이지를 열어요.</li>
              <li>공유 버튼을 누르고 홈 화면에 추가를 골라요.</li>
              <li>추가를 누르면 앱처럼 전체 화면으로 열려요.</li>
            </ol>
          </>
        )}

        <button type="button" className="danger" onClick={() => setResetOpen(true)}>
          수첩 비우기
        </button>
        <p className="fine">학기수첩 · 기록은 이 브라우저에만 있어요.</p>
      </div>
      {pinMode && <PinDialog mode={pinMode} onClose={() => setPinMode(null)} />}
      {resetOpen && (
        <Dialog
          title="수첩을 비울까요?"
          body="수업, 출석, 성적, 비밀번호가 이 기기에서 지워져요."
          confirmLabel="비우기"
          danger
          onClose={() => setResetOpen(false)}
          onConfirm={() => {
            dispatch({ type: 'reset' });
            setResetOpen(false);
            onClose();
          }}
        />
      )}
      {pendingImport?.ok && (
        <Dialog
          title="백업을 불러올까요?"
          body="지금 수첩 내용을 파일 내용으로 바꿔요. 비밀번호는 그대로 남아요."
          confirmLabel="불러오기"
          onClose={() => setPendingImport(null)}
          onConfirm={() => {
            dispatch({
              type: 'import',
              settings: pendingImport.data.settings,
              courses: pendingImport.data.courses,
              attendance: pendingImport.data.attendance,
            });
            setDraft(pendingImport.data.settings);
            setPendingImport(null);
            setMessage('수첩을 불러왔어요.');
          }}
        />
      )}
    </Sheet>
  );
}
