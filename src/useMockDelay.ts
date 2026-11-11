import { useEffect, useRef, useState } from "react";
import type { FailureKind } from "./domain/types";
import { useStore } from "./store";

const DELAY_MS = 1500;

export function useMockDelay() {
  const { state, dispatch } = useStore();
  const stateRef = useRef(state);
  stateRef.current = state;
  const lock = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState<FailureKind | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function delayFor(kind: FailureKind): Promise<boolean | null> {
    if (lock.current) return null;
    lock.current = true;
    if (mounted.current) setBusy(kind);
    await new Promise((resolve) => {
      window.setTimeout(resolve, DELAY_MS);
    });
    const failed = stateRef.current.armedFailure === kind;
    lock.current = false;
    if (mounted.current) setBusy(null);
    return failed;
  }

  return { state, dispatch, busy, delayFor };
}
