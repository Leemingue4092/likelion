import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { Action } from './store';
import type { AppState, Tab } from './types';

export interface AppApi {
  state: AppState;
  todayISO: string;
  dispatch: Dispatch<Action>;
  tab: Tab;
  setTab: (tab: Tab) => void;
  openCourseForm: (courseId: string | null) => void;
  openSettings: () => void;
  detailId: string | null;
  setDetailId: (id: string | null) => void;
  openDetail: (id: string) => void;
  focus: { iso: string; token: number } | null;
  openDate: (iso: string) => void;
  gradeFocusId: string | null;
  openGrades: (courseId: string) => void;
  saveError: boolean;
  notice: string | null;
  dismissNotice: () => void;
}

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const value = useContext(AppContext);
  if (!value) throw new Error('학기수첩 화면 밖에서 상태를 읽었습니다.');
  return value;
}
