export const MOCK_DELAY_MS = 350;

export function wait(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
