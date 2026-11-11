import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { initialState, reducer } from "./domain/reducer";
import type { Action, AppState } from "./domain/types";

const STORAGE_KEY = "duanyan-academy-demo-v02";

type StoreValue = {
  state: AppState;
  dispatch: Dispatch<Action>;
};

const StoreContext = createContext<StoreValue | null>(null);

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const record = value as AppState;
  return (
    Array.isArray(record.stages) &&
    record.stages.length === 3 &&
    Array.isArray(record.events) &&
    typeof record.metrics?.optimize === "number" &&
    typeof record.metrics.return === "number" &&
    typeof record.metrics.evaluate === "number"
  );
}

function readState(): AppState {
  if (typeof localStorage === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return isAppState(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("StoreProvider 缺失");
  }
  return value;
}
