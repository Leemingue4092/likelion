import { useEffect, useRef, useState } from 'react';
import { useApp } from '../app-context';
import { hashPin } from '../store';
import { Sheet } from './ui';

const FAIL_KEY = 'semester-note.fails';
const LOCK_KEY = 'semester-note.lockout';

function readNumber(key: string): number {
  try {
    const value = Number(sessionStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeNumber(key: string, value: number) {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    /* Session storage can be unavailable in private mode. The lock still works for this screen. */
  }
}

export function NumberPad({
  disabled,
  onDigit,
  onBackspace,
}: {
  disabled?: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  return (
    <div className="pad" aria-label="숫자 키패드">
      {keys.map((key) =>
        key === '' ? (
          <span key="blank" />
        ) : (
          <button
            key={key}
            type="button"
            className="pad-key"
            disabled={disabled}
            aria-label={key === '⌫' ? '지우기' : key}
            onClick={() => (key === '⌫' ? onBackspace() : onDigit(key))}
          >
            {key}
          </button>
        ),
      )}
    </div>
  );
}

function Dots({ length, shake }: { length: number; shake: boolean }) {
  return (
    <div className={shake ? 'dots shake' : 'dots'} aria-label={`입력 ${length}자리`}>
      {[0, 1, 2, 3].map((index) => (
        <i key={index} className={index < length ? 'filled' : ''} />
      ))}
    </div>
  );
}

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { state } = useApp();
  const [digits, setDigits] = useState('');
  const digitsRef = useRef('');
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('비밀번호 4자리');
  const [lockUntil, setLockUntil] = useState(() => readNumber(LOCK_KEY));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const waiting = lockUntil > now;

  async function submit(next: string) {
    if (!state.pinHash) return;
    const hashed = await hashPin(next);
    if (hashed === state.pinHash) {
      writeNumber(FAIL_KEY, 0);
      onUnlock();
      return;
    }
    const fails = readNumber(FAIL_KEY) + 1;
    writeNumber(FAIL_KEY, fails);
    setPinDigits('');
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
    if (fails >= 5) {
      const until = Date.now() + 30_000;
      writeNumber(LOCK_KEY, until);
      writeNumber(FAIL_KEY, 0);
      setLockUntil(until);
      setMessage('다섯 번 틀려서 30초 동안 멈췄어요.');
      return;
    }
    setMessage('비밀번호가 달라요.');
  }

  function setPinDigits(value: string) {
    digitsRef.current = value;
    setDigits(value);
  }

  function push(digit: string) {
    if (waiting || digitsRef.current.length >= 4) return;
    const next = digitsRef.current + digit;
    setPinDigits(next);
    if (next.length === 4) void submit(next);
  }

  const seconds = Math.max(1, Math.ceil((lockUntil - now) / 1000));

  return (
    <main className="lock">
      <span className="brand-mark">수</span>
      <h1>학기수첩</h1>
      <p>{waiting ? `${seconds}초 후에 다시 입력할 수 있어요.` : message}</p>
      <Dots length={digits.length} shake={shake} />
      <NumberPad disabled={waiting} onDigit={push} onBackspace={() => setPinDigits(digitsRef.current.slice(0, -1))} />
      <p className="fine">비밀번호를 잊으면 되돌릴 수 없어요. 사이트 데이터를 지우면 수첩도 함께 지워집니다.</p>
    </main>
  );
}

export function PinDialog({
  mode,
  onClose,
}: {
  mode: 'create' | 'change' | 'disable';
  onClose: () => void;
}) {
  const { state, dispatch } = useApp();
  const steps: Array<'current' | 'next' | 'confirm'> =
    mode === 'create' ? ['next', 'confirm'] : mode === 'disable' ? ['current'] : ['current', 'next', 'confirm'];
  const [stepIndex, setStepIndex] = useState(0);
  const [digits, setDigits] = useState('');
  const digitsRef = useRef('');
  const [candidate, setCandidate] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const step = steps[stepIndex] ?? 'current';

  const prompt =
    step === 'current'
      ? '지금 비밀번호 4자리'
      : step === 'next'
        ? '새 비밀번호 4자리'
        : '한 번 더 입력해 주세요';

  function setPinDigits(value: string) {
    digitsRef.current = value;
    setDigits(value);
  }

  function fail(message: string, backToNext = false) {
    setPinDigits('');
    setShake(true);
    setError(message);
    window.setTimeout(() => setShake(false), 400);
    if (backToNext) {
      setCandidate('');
      setStepIndex(mode === 'change' ? 1 : 0);
    }
  }

  async function submit(next: string) {
    if (step === 'current') {
      const hashed = await hashPin(next);
      if (hashed !== state.pinHash) {
        fail('비밀번호가 달라요.');
        return;
      }
      if (mode === 'disable') {
        dispatch({ type: 'pin', pinHash: null });
        onClose();
        return;
      }
      setPinDigits('');
      setError('');
      setStepIndex((index) => index + 1);
      return;
    }
    if (step === 'next') {
      setCandidate(next);
      setPinDigits('');
      setError('');
      setStepIndex((index) => index + 1);
      return;
    }
    if (next !== candidate) {
      fail('두 번호가 달라요. 새 비밀번호부터 다시 입력해 주세요.', true);
      return;
    }
    dispatch({ type: 'pin', pinHash: await hashPin(next) });
    onClose();
  }

  function push(digit: string) {
    if (digitsRef.current.length >= 4) return;
    const next = digitsRef.current + digit;
    setPinDigits(next);
    if (next.length === 4) void submit(next);
  }

  const title = mode === 'disable' ? '비밀번호 끄기' : mode === 'change' ? '비밀번호 변경' : '비밀번호 설정';

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="pin-setup">
        <p>{error || prompt}</p>
        <Dots length={digits.length} shake={shake} />
        <NumberPad onDigit={push} onBackspace={() => setPinDigits(digitsRef.current.slice(0, -1))} />
        {mode === 'create' && (
          <p className="fine">
            비밀번호를 잊으면 수첩을 열 수 없어요. 사이트 데이터를 지우면 기록도 함께 사라지니, 먼저 백업 파일을 저장해 두세요.
          </p>
        )}
      </div>
    </Sheet>
  );
}
