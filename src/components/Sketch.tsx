export function Sketch({ level }: { level: number }) {
  return (
    <figure className="sketch" data-testid="mock-figure">
      <svg viewBox="0 0 640 220" role="img" aria-label="PD-1 与 PD-L1 结合的课堂示意图">
        <rect width="640" height="220" rx="16" fill="#f4efe4" />
        <rect x="36" y="48" width="170" height="72" rx="12" fill="#fffdf8" stroke="#1e3d34" />
        <text x="121" y="80" textAnchor="middle" fill="#1c1915" fontSize="16">
          T 细胞
        </text>
        <text x="121" y="102" textAnchor="middle" fill="#1e3d34" fontSize="14">
          PD-1
        </text>
        <rect x="434" y="48" width="170" height="72" rx="12" fill="#fffdf8" stroke="#1c1915" />
        <text x="519" y="80" textAnchor="middle" fill="#1c1915" fontSize="16">
          肿瘤细胞
        </text>
        <text x="519" y="102" textAnchor="middle" fill="#1e3d34" fontSize="14">
          PD-L1
        </text>
        <line x1="206" y1="84" x2="434" y2="84" stroke="#1c1915" strokeWidth="2" />
        <text x="320" y="72" textAnchor="middle" fill="#1c1915" fontSize="14">
          结合
        </text>
        <line x1="250" y1="156" x2="390" y2="156" stroke="#1c1915" strokeWidth="2" />
        <polygon points="390,150 406,156 390,162" fill="#1c1915" />
        <text x="320" y="146" textAnchor="middle" fill="#1c1915" fontSize="14">
          活化信号
        </text>
        {level >= 1 ? (
          <>
            <line x1="286" y1="132" x2="354" y2="186" stroke="#8d3d12" strokeWidth="3" />
            <text x="320" y="206" textAnchor="middle" fill="#8d3d12" fontSize="14">
              信号减弱
            </text>
          </>
        ) : null}
        {level >= 2 ? (
          <text x="470" y="168" fill="#8d3d12" fontSize="13">
            不外推临床结局
          </text>
        ) : null}
      </svg>
      <figcaption>课堂占位图，不是实验原图。</figcaption>
    </figure>
  );
}
