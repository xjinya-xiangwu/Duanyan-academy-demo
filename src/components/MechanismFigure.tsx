export function MechanismFigure({ version }: { version: 0 | 1 | 2 }) {
  return (
    <figure className="figure" data-testid="mechanism-figure" data-figure-version={version}>
      <svg viewBox="0 0 680 230" role="img" aria-label="PD-1 与 PD-L1 结合的课堂占位示意图">
        <rect x="0" y="0" width="680" height="230" rx="12" fill="#f7f1e6" />
        <text x="16" y="24" fill="#8d3d12" fontSize="13">
          占位图 · 演示／Mock
        </text>
        <rect x="36" y="58" width="180" height="78" rx="10" fill="#fffdf8" stroke="#1f1a14" />
        <text x="126" y="90" textAnchor="middle" fill="#1f1a14" fontSize="16">
          T 细胞
        </text>
        <text x="126" y="114" textAnchor="middle" fill="#0b5f63" fontSize="14">
          PD-1
        </text>
        <rect x="464" y="58" width="180" height="78" rx="10" fill="#fffdf8" stroke="#1f1a14" />
        <text x="554" y="90" textAnchor="middle" fill="#1f1a14" fontSize="16">
          肿瘤细胞
        </text>
        <text x="554" y="114" textAnchor="middle" fill="#0b5f63" fontSize="14">
          PD-L1
        </text>
        <line x1="216" y1="96" x2="464" y2="96" stroke="#1f1a14" strokeWidth="2" />
        <text x="340" y="84" textAnchor="middle" fill="#1f1a14" fontSize="14">
          结合
        </text>
        <line x1="250" y1="168" x2="430" y2="168" stroke="#1f1a14" strokeWidth="2" />
        <polygon points="430,162 446,168 430,174" fill="#1f1a14" />
        <text x="340" y="158" textAnchor="middle" fill="#1f1a14" fontSize="14">
          活化信号
        </text>
        {version >= 1 ? (
          <>
            <line x1="300" y1="146" x2="380" y2="190" stroke="#8d3d12" strokeWidth="3" />
            <text x="340" y="214" textAnchor="middle" fill="#8d3d12" fontSize="14">
              信号减弱
            </text>
          </>
        ) : null}
        {version >= 2 ? (
          <rect x="470" y="150" width="186" height="36" rx="6" fill="#fff4e8" stroke="#8d3d12" />
        ) : null}
        {version >= 2 ? (
          <text x="563" y="173" textAnchor="middle" fill="#8d3d12" fontSize="13">
            不外推临床结局
          </text>
        ) : null}
      </svg>
      <figcaption>静态占位图（演示／Mock）。不是生图接口输出。</figcaption>
    </figure>
  );
}
