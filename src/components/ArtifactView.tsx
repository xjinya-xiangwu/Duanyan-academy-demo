import type { Snapshot, TextLine } from "../domain/types";
import { versionLabel } from "../domain/labels";
import { MechanismFigure } from "./MechanismFigure";
import { MockTag } from "./MockTag";

function LineList({ lines }: { lines: TextLine[] }) {
  return (
    <ul className="lines">
      {lines.map((item) => (
        <li key={item.id} className={item.mark === "same" ? "" : `diff-${item.mark}`}>
          {item.mark === "added" ? <span className="diff-label">新增</span> : null}
          {item.mark === "changed" ? <span className="diff-label">改动</span> : null}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function Caption({ line }: { line: TextLine }) {
  return (
    <p className={line.mark === "same" ? "caption" : `caption diff-${line.mark}`}>
      {line.mark === "changed" ? <span className="diff-label">改动</span> : null}
      {line.text}
    </p>
  );
}

export function ArtifactView({
  snapshot,
  baseline,
  pendingUpdate = false,
  testId,
}: {
  snapshot: Snapshot;
  baseline: Snapshot | null;
  pendingUpdate?: boolean;
  testId: string;
}) {
  const compare = snapshot.version > 0 && baseline !== null;
  return (
    <article className="artifact" data-testid={testId} data-version={snapshot.version}>
      <header className="artifact-head">
        <h3>{snapshot.heading}</h3>
        <MockTag />
        <span className="chip">{versionLabel(snapshot.version)}</span>
        {pendingUpdate ? <span className="chip warn">待更新</span> : null}
      </header>
      {compare ? (
        <div className="compare" data-testid="visible-diff">
          <section>
            <h4>优化前</h4>
            <LineList lines={baseline.lines} />
            {baseline.caption ? <Caption line={baseline.caption} /> : null}
          </section>
          <section>
            <h4>优化后</h4>
            <LineList lines={snapshot.lines} />
            {snapshot.caption ? <Caption line={snapshot.caption} /> : null}
          </section>
        </div>
      ) : (
        <section>
          <LineList lines={snapshot.lines} />
          {snapshot.caption ? <Caption line={snapshot.caption} /> : null}
        </section>
      )}
      {snapshot.hasFigure ? <MechanismFigure version={snapshot.figureVersion} /> : null}
      <p className="fine">固定 Mock 文案，不是模型输出。</p>
    </article>
  );
}
