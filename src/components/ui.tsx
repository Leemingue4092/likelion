import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { STATUSES } from '../logic';
import type { AttendanceStatus } from '../types';
import { Icon } from './icons';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

let pageLocks = 0;
let previousOverflow = '';

function lockPage(): () => void {
  if (pageLocks === 0) previousOverflow = document.body.style.overflow;
  pageLocks += 1;
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');
  return () => {
    pageLocks = Math.max(0, pageLocks - 1);
    if (pageLocks === 0) {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('modal-open');
    }
  };
}

export function useWide(query = '(min-width: 800px)'): boolean {
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return wide;
}

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const unlock = lockPage();
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="sheet-root">
      <button type="button" className="scrim" aria-label="닫기" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}

export function Dialog({
  title,
  body,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const unlock = lockPage();
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="dialog-root">
      <button type="button" className="scrim" aria-label="닫기" onClick={onClose} />
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" className="ghost" onClick={onClose}>
            취소
          </button>
          <button type="button" className={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function StatusButtons({
  value,
  onChange,
}: {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus | null) => void;
}) {
  return (
    <div className="status-row" role="group" aria-label="출석 상태">
      {STATUSES.map((status) => {
        const selected = value === status.id;
        return (
          <button
            key={status.id}
            type="button"
            className={cx('status-btn', selected && 'on')}
            data-status={status.id}
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : status.id)}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}

export function CourseDot({ color }: { color: string }) {
  return <span className="dot" style={{ '--c': color } as CSSProperties} />;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section className="empty card">
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}

export function BackButton({ onClick, label = '뒤로' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="text-btn back-btn" onClick={onClick}>
      <Icon name="back" />
      {label}
    </button>
  );
}
