import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { initialState, reducer, type Action, type DemoState } from "./domain/logic";

const KEY = "duanyan-academy-demo-v03";

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== 3 || !parsed.slots || !parsed.work || !parsed.events) return initialState;
    return parsed;
  } catch {
    return initialState;
  }
}

interface DemoApi {
  state: DemoState;
  dispatch: (action: Action) => void;
}

const DemoContext = createContext<DemoApi | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);
  return <DemoContext.Provider value={{ state, dispatch }}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoApi {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider missing");
  return value;
}

export function useDelayedDispatch() {
  const { dispatch } = useDemo();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function later(action: Action, ms = 450) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    timer.current = window.setTimeout(() => {
      dispatch(action);
      lock.current = false;
      setBusy(false);
      timer.current = null;
    }, ms);
  }

  return { busy, dispatch, later };
}
