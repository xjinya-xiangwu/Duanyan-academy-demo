import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { createInitialState, reducer, type Action, type GovernanceAction, type DemoState } from "./domain/logic";
import { PRACTICE_IDS } from "./domain/content";
const STORAGE_KEY = "duanyan-academy-demo-v04";
function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if ([4, 6].includes(saved?.version) && PRACTICE_IDS.every((id) => saved.units?.[id] && Array.isArray(saved.units[id].submissions)) && Array.isArray(saved.events) && saved.courseDraft) {
      const base = createInitialState();
      for (const id of PRACTICE_IDS) saved.units[id] = { ...base.units[id], ...saved.units[id], receivedVersion: typeof saved.units[id].receivedVersion === "number" ? saved.units[id].receivedVersion : saved.units[id].submissions.length ? saved.units[id].executeVersion : 0 };
      // shortcut: v0.4 history is kept as teaching evidence; new candidate review starts unapproved.
      return { ...base, ...saved, version: 6, topicConfirmed: true, unitConfigs: { ...base.unitConfigs, ...saved.unitConfigs }, consents: { ...base.consents, ...saved.consents }, assetReviews: { ...base.assetReviews, ...saved.assetReviews } };
    }
  } catch { /* Browser storage is optional for this local preview. */ }
  return createInitialState();
}
interface DemoApi { state: DemoState; dispatch: (action: Action | GovernanceAction) => void }
const Context = createContext<DemoApi | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep the current session usable. */ } }, [state]);
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider missing");
  return value;
}
export function useDelayedAction() {
  const { dispatch } = useDemo();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const run = (action: Action, after?: () => void) => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    timer.current = setTimeout(() => { dispatch(action); lock.current = false; setBusy(false); after?.(); }, 850);
  };
  return { busy, run };
}
