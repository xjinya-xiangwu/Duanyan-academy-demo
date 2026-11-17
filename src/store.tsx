import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { createInitialState, reducer, type Action, type GovernanceAction, type DemoState } from "./domain/logic";
import { PRACTICE_IDS } from "./domain/content";
import type { ChapterAction } from "./domain/chapters";
const STORAGE_KEY = "duanyan-academy-demo-v04";
function load(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if ([4, 6, 7, 8].includes(saved?.version) && PRACTICE_IDS.every((id) => saved.units?.[id] && Array.isArray(saved.units[id].submissions)) && Array.isArray(saved.events) && saved.courseDraft) {
      const base = createInitialState();
      for (const id of PRACTICE_IDS) saved.units[id] = { ...base.units[id], ...saved.units[id], receivedVersion: typeof saved.units[id].receivedVersion === "number" ? saved.units[id].receivedVersion : saved.units[id].submissions.length ? saved.units[id].executeVersion : 0 };
      for (const id of PRACTICE_IDS) {
        const work = saved.units[id];
        for (const submission of work.submissions) if (!submission.artifactVersion) {
          let snapshot = work.artifactHistory.find((item: { content: string }) => item.content === submission.artifact);
          if (!snapshot) { snapshot = { version: ++work.artifactVersion, content: submission.artifact, figure: submission.figure, reason: "历史提交迁移，未补造执行轨迹" }; work.artifactHistory.push(snapshot); }
          submission.artifactVersion = snapshot.version;
        }
        if (work.draft && work.artifactHistory.at(-1)?.content !== work.draft) work.artifactHistory.push({ version: ++work.artifactVersion, content: work.draft, figure: work.figure, reason: "历史草稿迁移，未补造轨迹" });
      }
      // shortcut: legacy history stays readable; annotations and detailed runs require new work.
      return { ...base, ...saved, version: 8, chapters: { ...base.chapters, ...saved.chapters }, topicConfirmed: true, annotations: saved.annotations || [], annotationTemplates: { ...base.annotationTemplates, ...saved.annotationTemplates }, unitConfigs: { ...base.unitConfigs, ...saved.unitConfigs }, assetReviews: { ...base.assetReviews, ...saved.assetReviews } };
    }
  } catch { /* Browser storage is optional for this local preview. */ }
  return createInitialState();
}
interface DemoApi { state: DemoState; dispatch: (action: Action | GovernanceAction | ChapterAction) => void }
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
  const run = (action: Action | GovernanceAction | ChapterAction, after?: () => void) => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    timer.current = setTimeout(() => { dispatch(action); lock.current = false; setBusy(false); after?.(); }, 850);
  };
  return { busy, run };
}
