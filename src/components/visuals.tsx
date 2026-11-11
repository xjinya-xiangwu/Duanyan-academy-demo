import { useId } from "react";
export function CourseArt({ muted = false }: { muted?: boolean }) {
  const id = useId().replaceAll(":", "");
  return <svg className={"course-art " + (muted ? "art-muted" : "")} viewBox="0 0 600 390" role="img" aria-label="PD-1 与 PD-L1 的抽象细胞研究插画">
    <defs>
      <radialGradient id={id + "a"}><stop stopColor="#e3ead7" /><stop offset=".72" stopColor="#91ac95" /><stop offset="1" stopColor="#547b62" /></radialGradient>
      <radialGradient id={id + "b"}><stop stopColor="#e7d4b8" /><stop offset=".74" stopColor="#ccb090" /><stop offset="1" stopColor="#aa896e" /></radialGradient>
      <pattern id={id + "dots"} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#84947e" opacity=".32" /></pattern>
      <filter id={id + "shadow"} x="-.3" y="-.3" width="1.6" height="1.6"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#244d37" floodOpacity=".14" /></filter>
    </defs>
    <rect width="600" height="390" rx="12" fill="#e7eadf" />
    <rect x="18" y="18" width="564" height="354" fill={"url(#" + id + "dots)"} />
    <g stroke="#aebaa3" fill="none" strokeWidth="1">
      <path d="M18 76h85m-48-44v91M477 322h105m-52-40v80M0 240h46m506-91h48" />
      <path d="M88 310c78-42 262-251 413-235M67 326C245 380 364 58 549 73" strokeDasharray="3 6" />
      <circle cx="300" cy="198" r="165" opacity=".24" /><circle cx="300" cy="198" r="183" opacity=".18" />
    </g>
    <g filter={"url(#" + id + "shadow)"}>
      <circle cx="188" cy="202" r="105" fill={"url(#" + id + "a)"} stroke="#648c6c" strokeWidth="2" />
      <circle cx="188" cy="202" r="93" fill="none" stroke="#f4f5e8" strokeOpacity=".5" />
      <ellipse cx="172" cy="197" rx="47" ry="43" fill="#315d45" opacity=".55" transform="rotate(-20 172 197)" />
      <path d="M145 194c10-13 37-11 45 6m-43 13c11-9 29-7 35 4m-33-35c10-4 21-4 28 2" fill="none" stroke="#b1c8a2" strokeWidth="2" opacity=".5" />
      <circle cx="421" cy="219" r="116" fill={"url(#" + id + "b)"} stroke="#b89a7c" strokeWidth="2" />
      <circle cx="421" cy="219" r="103" fill="none" stroke="#faebd3" strokeOpacity=".65" />
      <ellipse cx="437" cy="223" rx="47" ry="52" fill="#937954" opacity=".43" transform="rotate(25 437 223)" />
      <path d="M418 207c18-12 34 0 36 12m-38 18c16-8 29-2 32 9m-31-45c10-5 21-3 26 1" fill="none" stroke="#ead7b4" strokeWidth="2" opacity=".65" />
    </g>
    {Array.from({ length: 23 }, (_, n) => {
      const angle = n * Math.PI * 2 / 23;
      return <g key={n}><circle cx={188 + Math.cos(angle) * 100} cy={202 + Math.sin(angle) * 100} r="3.1" fill="#cbd9ba" stroke="#65846b" strokeWidth=".7" /><circle cx={421 + Math.cos(angle + .1) * 111} cy={219 + Math.sin(angle + .1) * 111} r="3.2" fill="#ead7b7" stroke="#b69a7b" strokeWidth=".7" /></g>;
    })}
    <g stroke="#193e2b" strokeWidth="2.4" fill="#e2ead8">
      <path d="m280 183 11-5 10 18-10 6-11-19Z" /><path d="m313 196 11-4 8 20-10 4-9-20Z" fill="#cbb18a" />
      <path d="m298 194 17 3" strokeDasharray="2 3" />
    </g>
    <g fill="#234630" fontFamily="Georgia, 'Microsoft YaHei', sans-serif">
      <text x="38" y="48" fontSize="15" letterSpacing="2">PD-1 / PD-L1</text>
      <text x="116" y="335" fontSize="12" letterSpacing="2">T CELL</text>
      <text x="391" y="359" fontSize="12" letterSpacing="2">TUMOR CELL</text>
    </g>
    <path d="m193 308-16 13m250 17 8 8M302 181l20-46h75" stroke="#617358" strokeWidth="1" fill="none" />
    <rect x="327" y="113" width="96" height="33" rx="4" fill="#f7f7ed" stroke="#c3ccb8" />
    <text x="375" y="134" textAnchor="middle" fontSize="13" fill="#31553c" fontFamily="Georgia, serif">a question begins</text>
    <text x="38" y="366" fontSize="10" fill="#52664e" letterSpacing="1.3">MOLECULES TO MEANING</text>
  </svg>;
}
export function MechanismFigure() {
  const id = useId().replaceAll(":", "");
  return <figure className="mechanism-figure" data-testid="mock-figure"><div className="mechanism-panels">{[0, 1].map((panel) => <svg key={panel} viewBox="0 0 360 266" role="img" aria-label={panel ? "抗体阻断 PD-1／PD-L1 连接的教学示意" : "PD-1／PD-L1 结合与抑制性信号的教学示意"}>
      <defs><marker id={id + "-arrow-" + panel} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 8 4 0 8" fill="#4c6c56" /></marker></defs>
      <rect x="8" y="8" width="344" height="252" rx="10" fill={panel ? "#f1f5ed" : "#f6f2e9"} />
      <text x="28" y="36" fill="#193f30" fontSize="17" fontWeight="600">{panel ? "通路阻断 · 研究示意" : "PD-1／PD-L1 结合"}</text>
      <circle cx="83" cy="139" r="52" fill="#d8e5d1" stroke="#8da382" strokeWidth="1.5" />
      <circle cx="273" cy="139" r="52" fill="#ecd9c7" stroke="#bea184" strokeWidth="1.5" />
      <text x="83" y="145" textAnchor="middle" fontSize="18" fill="#31563c">T 细胞</text>
      <text x="273" y="145" textAnchor="middle" fontSize="17" fill="#6e503b">肿瘤细胞</text>
      <rect x="130" y="131" width="35" height="17" rx="5" fill="#466f51" />
      <rect x="191" y="131" width="35" height="17" rx="5" fill="#b68b66" />
      <text x="146" y="120" textAnchor="middle" fontSize="16" fill="#31563c">PD-1</text>
      <text x="208" y="120" textAnchor="middle" fontSize="16" fill="#70513d">PD-L1</text>
      {panel ? <><path d="m169 80 15 18 15-18m-15 18v42" stroke="#a26f35" strokeWidth="7" strokeLinecap="round" fill="none" /><text x="184" y="66" textAnchor="middle" fontSize="15" fill="#765525">抗体阻断示意</text><path d="M169 150h18" stroke="#6d8065" strokeDasharray="3 4" /></> : <><path d="M165 140h26" stroke="#52694c" strokeWidth="2" /><path d="M150 164c-10 25-37 28-55 9" fill="none" stroke="#4c6c56" markerEnd={"url(#" + id + "-arrow-" + panel + ")"} /><text x="176" y="206" textAnchor="middle" fontSize="16" fill="#536649">参与抑制性信号</text></>}
      <text x="180" y="240" textAnchor="middle" fontSize="14" fill="#55664c">{panel ? "表达通路关系，不预测个体疗效" : "机制证据须与具体研究条件对应"}</text>
    </svg>)}</div><figcaption><strong>图 1　从受体与配体的关系，理解通路阻断。</strong><span>结合图中 PD-1 与 PD-L1 连接，参与抑制性信号；阻断图中的 Y 形表示抗体阻断这一研究问题。教学示意，不是实验记录或仿真结果。</span></figcaption></figure>;
}
