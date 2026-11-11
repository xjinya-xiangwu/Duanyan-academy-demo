import { COMPLETION_TEXT } from "../domain/content";

export function CompletionNote() {
  return (
    <section className="completion" data-testid="completion">
      <h2>{COMPLETION_TEXT}</h2>
      <p>3 个引导阶段都已由老师点为通过。这里没有证明文书，这个句子也不进入回流计数。</p>
    </section>
  );
}
