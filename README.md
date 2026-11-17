# 端砚学院 · 聚焦章节任务 Demo v0.8

在线预览：https://xjinya-xiangwu.github.io/Duanyan-academy-demo/

默认入口按 2026-11-17 读取的《端砚AI加速科研通识课大纲》revision 175 展示五章、23 微课。正文及其中 ChatGPT Courses 章节任务插图已通过飞书 CLI 读取/预览。

最新需求：[Demo PRD v0.8](docs/demo-prd-v0.8.md)。飞书现有 PRD：https://aicarrier.feishu.cn/docx/W8Fzd2e6toGBZLxr5cCcpovYnsh 。历史 PRD 保留，默认首页及学生主线以 v0.8 为准。

## 学生主线

1. 自由进入任一章，填写研究方向、阶段、本次需求、材料与成功标准；也可主动填入示例。
2. 生成任务 Prompt，原表单收拢。检查或编辑 Prompt，点击“前往端砚执行”，直接进入同站执行结果页。
3. 返回课程查看交付物，可保存到本章。
4. 对结果填写修改要求，生成带根任务、上一版结果和本轮要求的修改 Prompt，再提交端砚重跑。旧版本完整保留。

研究问题定义卡、证据卡、最小分析卡、纠错卡、SKILL 卡分别对应五章。全部章节无学习前置锁。只有输入完整性和 Prompt 校验，不强制先读微课或标注。

主导航仅课程章节。微课/方法提示、原始输入、Prompt/轨迹历史默认折叠；教师成果和高级数据功能放在次要入口。教师默认先看通识课章节成果。

## 保留的专题能力

旧生医课在 /course/biomed，原 /course/unit/:unit、/course/studio/:unit 等地址仍可访问。PD-1／PD-L1 整课、三作业、教师 AI 辅助人工标注、轨迹可视化与两条高质量合成 JSONL 保留，未把这些旧数据冒充新通识课任务。

[两条合成 JSONL](src/domain/high-quality-trajectories.jsonl) 继续可从教师科研资产数据集下载；每条为两次执行、三版产物、学生教师各两轮标注。provenance=synthetic_demo，training_used=false。

## 状态与边界

用户自定义输入原样进入 Prompt 与章节示例，结果不再固定成 PD-1 内容。修改输入使旧 Prompt 失效；确认 Prompt 是明确执行动作；刷新不重复执行；失败保留已有内容并可重试；重跑以 previousRunId 关联版本。

Prompt 使用规则模板，执行与结果仍为前端 Mock。未接真实端砚跳转/回调、真实模型、文献检索、统计、文件上传或 SKILL 广场。缺材料只提示所需输入，不生成虚假 DOI/数值。微课仅有大纲与方法提示，完整约五小时视频内容未制作。

默认回传沿用用户要求，当前只保存在浏览器和本地导出，没有真实云端入库或生产训练授权效力。v0.4/v0.6/v0.7 浏览器进度保留。

## 开发与验证

    npm ci
    npm test
    npm run build
    npx playwright install chromium
    npm run test:e2e
    npm run bundle:offline -- <输出路径>

React 18、TypeScript、Vite，无新依赖。Playwright 使用独立 5178 服务；截图目录 SCREENSHOT_DIR 或 test-results/screenshots。沿用 GitHub Actions 发布 Pages；Pages 是 Mock 前端预览。
