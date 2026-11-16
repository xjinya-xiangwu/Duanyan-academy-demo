import { useState } from "react";
import { HIGH_QUALITY_ASSETS, HIGH_QUALITY_JSONL } from "../domain/finished-assets";
import { downloadText, TextArtifact } from "../components/common";
import { TrajectoryViewer } from "../components/trajectory-viewer";
import { MechanismFigure } from "../components/visuals";

export function FinishedAssets() {
  const [assetId, setAssetId] = useState(HIGH_QUALITY_ASSETS[0].asset_id), [tab, setTab] = useState("artifact");
  const asset = HIGH_QUALITY_ASSETS.find((item) => item.asset_id === assetId)!;
  return <section className="finished-assets" data-testid="finished-assets"><header className="finished-assets-heading"><div><span>最终数据成品 · FINAL DATASET</span><h2>两条高质量科研轨迹样例</h2><p>从最终交付物、执行轨迹和学生／教师双轮标注，核对完整的数据资产。</p></div><button className="button primary" data-testid="download-jsonl" onClick={() => downloadText("high-quality-trajectories-v0.7.jsonl", HIGH_QUALITY_JSONL, "application/x-ndjson")}>下载 2 条 JSONL</button></header><div className="finished-asset-cards">{HIGH_QUALITY_ASSETS.map((item) => <button key={item.asset_id} aria-pressed={item.asset_id === assetId} onClick={() => setAssetId(item.asset_id)}><span>{item.asset_id} · 合成样例</span><h3>{item.title}</h3><p>2 次执行 · 3 版产物 · 学生 2 轮＋教师 2 轮</p><small>{item.capability_tags.join(" / ")}</small></button>)}</div>
    <nav className="course-tabs" aria-label="最终资产查看方式">{[["artifact", "最终交付物"], ["trajectory", "完整执行轨迹"], ["annotations", "多轮标注"], ["jsonl", "结构化 JSONL"]].map(([key, label]) => <button key={key} aria-pressed={key === tab} onClick={() => setTab(key)}>{label}</button>)}</nav>
    {tab === "artifact" && <div className="finished-artifact"><div className="deliverable-banner"><div><span>FINAL ARTIFACT · V{asset.final_output.version}</span><h3>{asset.title}</h3><p>{asset.verification.quality}</p></div></div>{asset.artifact_versions.at(-1)?.figure && <MechanismFigure />}<TextArtifact text={asset.final_output.content} /><div className="final-field-grid">{Object.entries(asset.final_output.fields).map(([key, value]) => <section key={key}><strong>{key}</strong><p>{value}</p></section>)}</div></div>}
    {tab === "trajectory" && <TrajectoryViewer key={asset.asset_id} runs={asset.runs} />}
    {tab === "annotations" && <div className="finished-annotation-rounds">{[1, 2].map((round) => <section key={round}><h3>Round {round} · {round === 1 ? "初稿判断与教师纠错" : "学生修订与教师确认"}</h3>{asset.annotations.filter((item) => item.round === round && item.author !== "ai").map((item) => <article key={item.id}><span>{item.author === "student" ? "学生自标注" : "教师人工标注"} · V{item.artifactVersion} · {item.blockId}</span><strong>{item.field}：{item.value}</strong><p>{item.rationale}</p><small>{item.proposalId ? "保留 AI 建议来源：" + item.proposalId : "人工独立判断"}</small></article>)}</section>)}</div>}
    {tab === "jsonl" && <pre className="jsonl-inspector" data-testid="finished-jsonl">{JSON.stringify(asset, null, 2)}</pre>}
    <details className="reverse-journey"><summary>从最终数据倒推用户功能与旅程</summary><ol><li>教师定义任务目标、rubric、标注 Prompt 与字段 schema。</li><li>学生在网页使用模板准备任务，端砚执行并保留工具、观察、失败和修正。</li><li>网页突出交付物与区块，AI 建议结构化字段，学生编辑确认并提交。</li><li>教师查看产物与轨迹，AI 辅助定位，人工标注、纠错与确认；学生按意见形成新版本。</li><li>保存每轮作者、目标、字段、理由和版本；最终合并字段、轨迹、失败与版本链，输出 JSONL。</li></ol></details><p className="small-note">两条数据是人工编制的 synthetic_demo，模拟高质量结构与多轮审核；没有真实工具执行、真实专家评审或真实训练。</p>
  </section>;
}
