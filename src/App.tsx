import { useEffect, useReducer, useRef, useState } from 'react';
import { AppContext } from './app-context';
import { CalendarView } from './components/CalendarView';
import { CourseForm } from './components/CourseForm';
import { CoursesView } from './components/CoursesView';
import { GradesView } from './components/GradesView';
import { Icon } from './components/icons';
import { LockScreen } from './components/LockScreen';
import { SettingsSheet } from './components/SettingsSheet';
import { TodayView } from './components/TodayView';
import { todayISO } from './dates';
import { loadState, reducer, saveState, STORAGE_KEY } from './store';
import type { Tab } from './types';

const TABS: { id: Tab; label: string; icon: 'today' | 'calendar' | 'courses' | 'grades' }[] = [
  { id: 'today', label: '오늘', icon: 'today' },
  { id: 'calendar', label: '달력', icon: 'calendar' },
  { id: 'courses', label: '수업', icon: 'courses' },
  { id: 'grades', label: '성적', icon: 'grades' },
];

function readTab(): Tab {
  try {
    const value = sessionStorage.getItem('semester-note.tab');
    if (value === 'today' || value === 'calendar' || value === 'courses' || value === 'grades') return value;
  } catch {
    /* Private mode can block session storage. The app opens on 오늘. */
  }
  return 'today';
}

export function App() {
  const [boot] = useState(loadState);
  const [state, dispatch] = useReducer(reducer, boot.state);
  const [tab, setTab] = useState<Tab>(readTab);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formCourseId, setFormCourseId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focus, setFocus] = useState<{ iso: string; token: number } | null>(null);
  const [gradeFocusId, setGradeFocusId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const pinAtLaunch = useRef(boot.state.pinHash);
  const [saveError, setSaveError] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    boot.corrupted ? '이전에 저장된 수첩을 읽지 못해서 새로 시작했어요.' : null,
  );
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    setSaveError(!saveState(state));
  }, [state]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: 'hydrate', state: loadState().state });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setToday(todayISO()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (state.pinHash && state.pinHash !== pinAtLaunch.current) setUnlocked(true);
  }, [state.pinHash]);

  function changeTab(next: Tab) {
    setTab(next);
    try {
      sessionStorage.setItem('semester-note.tab', next);
    } catch {
      /* Keeping the tab for this screen is enough. */
    }
  }

  const api = {
    state,
    todayISO: today,
    dispatch,
    tab,
    setTab: changeTab,
    openCourseForm: (courseId: string | null) => {
      setFormCourseId(courseId);
      setFormOpen(true);
    },
    openSettings: () => setSettingsOpen(true),
    detailId,
    setDetailId,
    openDetail: (id: string) => {
      setDetailId(id);
      changeTab('courses');
    },
    focus,
    openDate: (iso: string) => {
      setFocus({ iso, token: Date.now() });
      changeTab('calendar');
    },
    gradeFocusId,
    openGrades: (courseId: string) => {
      setGradeFocusId(courseId);
      changeTab('grades');
    },
    saveError,
    notice,
    dismissNotice: () => setNotice(null),
  };

  const locked = Boolean(state.pinHash) && !unlocked;

  return (
    <AppContext.Provider value={api}>
      {locked ? (
        <LockScreen onUnlock={() => setUnlocked(true)} />
      ) : (
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <span className="brand-mark">수</span>
              <div>
                <strong>학기수첩</strong>
                <p>{[state.settings.schoolName, state.settings.semesterName].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
            <nav className="side-nav" aria-label="화면">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? 'side-link on' : 'side-link'}
                  aria-current={tab === item.id ? 'page' : undefined}
                  onClick={() => changeTab(item.id)}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </button>
              ))}
            </nav>
            <button type="button" className="side-settings" onClick={() => setSettingsOpen(true)}>
              <Icon name="settings" />
              설정
            </button>
          </aside>
          <div className="stage">
            <header className="topbar">
              <div className="brand-inline">
                <span className="brand-mark">수</span>
                <strong>학기수첩</strong>
              </div>
              <button type="button" className="icon-btn" aria-label="설정" onClick={() => setSettingsOpen(true)}>
                <Icon name="settings" />
              </button>
            </header>
            <div className="stage-scroll">
              {notice && (
                <button type="button" className="inline-banner" onClick={() => setNotice(null)}>
                  {notice}
                </button>
              )}
              {saveError && <p className="inline-banner">이 브라우저 저장 공간이 부족해 방금 내용을 저장하지 못했어요.</p>}
              {tab === 'today' && <TodayView />}
              {tab === 'calendar' && <CalendarView />}
              {tab === 'courses' && <CoursesView />}
              {tab === 'grades' && <GradesView />}
            </div>
          </div>
          <nav className="tabbar" aria-label="화면">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'tab on' : 'tab'}
                aria-current={tab === item.id ? 'page' : undefined}
                onClick={() => changeTab(item.id)}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      {formOpen && <CourseForm courseId={formCourseId} onClose={() => setFormOpen(false)} />}
      {settingsOpen && !locked && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </AppContext.Provider>
  );
}
