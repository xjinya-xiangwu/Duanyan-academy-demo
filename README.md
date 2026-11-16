# 端砚学院 · 轨迹与多轮标注 Demo v0.7

默认打开学员课程，全部课时、测验与作业可自由进入。网页准备 Prompt、优化交付物和标注；端砚薄页仅执行标准 Agent 任务并返回结果。

在线预览：https://xjinya-xiangwu.github.io/Duanyan-academy-demo/

最新需求：[Demo PRD v0.7](docs/demo-prd-v0.7.md)。飞书 PRD：https://aicarrier.feishu.cn/docx/W8Fzd2e6toGBZLxr5cCcpovYnsh 。本轮依据用户 2026-11-16 的五条反馈；历史 v0.6 文档保留归档，授权 UI 与默认仅教学约定由 v0.7 取代。

## 以最终数据倒推流程

1. 教师在“环节配置”选择测验或作业，AI 生成标注 Prompt 和六字段模板，人工编辑确认。
2. 学生在网页准备任务，前往端砚执行。在“运行记录”查看当前批次的轮次、工具、失败修正、模拟时间概览、输入与输出检查器。
3. 结果返回“交付物工作区”。点击段落或图注区块，AI 建议结构化字段，学生编辑并保存自己的判断和理由，可多轮标注；手动提交。
4. 教师在同一提交的突出交付物区域完成 AI 辅助的人工标注，保留原建议和每次确认，再通过或请修改。
5. 学生重做、优化或编辑产生新产物版本；旧标注继续指向旧版区块。最终包保留全部运行、失败、版本、字段、学生与教师判断。
6. 教师“科研资产数据集”顶部直接查看两个完整成品：终稿、完整轨迹、多轮标注、JSONL。静态样例与用户实际操作的本地数据分开展示。

逐任务授权与三方勾选已移除。任务输入、轨迹、中间/最终产物、失败修订和学生教师标注默认回传；当前仅浏览器 Mock，未接云端或真实生产协议。

## 两条高质量轨迹样例

[high-quality-trajectories.jsonl](src/domain/high-quality-trajectories.jsonl) 每行一个完整任务资产，恰好两行：

- HQ-TRACE-001：论文证据链，保留外推错误、教师纠错、学生修订和终稿。
- HQ-TRACE-002：机制图，保留对象清单、图注边界与多轮修正。

每条有 2 次执行、3 版产物、学生 2 轮和教师 2 轮标注；每轮六字段：research_question、claim、evidence_doi、evidence_level、limitation、revision_reason。标注保留 author/round/artifactVersion/blockId/field/value/rationale/proposalId。

所有数据标记 provenance=synthetic_demo、training_used=false；工具输入输出、耗时和专家评审均为人工编制的模拟。结构质量不等于真实科学质量、真实金标、环境复现或模型提升。

## 参考与范围

轨迹 UI 参考 DeepSeek 官方 deepseek-ai/deepseek-harness 的 packages/client/ui-trajectory/README.zh.md：按轮次记录表、时间概览、父子工具、失败状态和输入输出检查器。未引入 Harness 依赖；没有完整缩放拖选、海量虚拟化或隐藏思维链。

图像标注到图/图注区块，未做像素坐标绘制。AI 模板和字段仍为前端预置建议。模型、真实端砚、云入库、数据权利协议、训练、科学评审和证书签发尚未接入。

原 PD-1／PD-L1 课程、七篇历史文献、教师配置、布置发布、请修改重做、实战申请仍保留。缺少三份强制作业仍阻断发布，实战申请需作业通过。示例邀请码：生医6-DEMO。

## 开发与验证

    npm ci
    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e
    npm run bundle:offline -- <输出路径>

沿用 React 18、TypeScript、Vite，无新依赖。旧 v0.4/v0.6 浏览器进度保留，不补造缺失的详细运行和标注。Playwright 独立启动 5178 服务，截图用 SCREENSHOT_DIR 或 test-results/screenshots。GitHub main 发布现有 Pages Actions；Pages 是 Mock 前端预览。
