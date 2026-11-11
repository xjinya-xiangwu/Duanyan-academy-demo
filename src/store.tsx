import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { initialState, reducer } from "./domain/model";
import type { Action, DemoState } from "./domain/model";

const STORAGE_KEY = "duanyan-academy-demo-v04";

type StoreValue = {
  state: DemoState;
  dispatch: Dispatch<Action>;
};

const StoreContext = createContext<StoreValue | null>(null);

function isState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const record = value as DemoState;
  return record.version === 4 && Boolean(record.units?.q1) && Boolean(record.units?.a4) && Boolean(record.draft);
}

function readState(): DemoState {
  if (typeof localStorage === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? { ...parsed, notice: null } : initialState;
  } catch {
    return initialState;
  }
}

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useCourse(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("缺少课程状态");
  return value;
}
