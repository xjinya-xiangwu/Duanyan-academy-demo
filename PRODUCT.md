# 端砚学院

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Science 背景科研学生与课程教师。当前用于客户或领导演示，默认学生课程主线。

## Product Purpose

学生用相对结构化的信息准备真实科研任务 Prompt，直接交端砚执行，取回结果后通过修改 Prompt 继续迭代。

## Operating Context

现有 React、TypeScript、Vite 静态前端；支持 GitHub Pages 和离线单文件。2026-11-17 以通识课大纲 revision 175 与用户本轮要求为准，Demo PRD v0.8。

## Capabilities and Constraints

默认 /course 为五章通识课与 23 微课大纲。每章任务：研究问题定义卡、证据卡、最小分析卡、纠错卡、SKILL 卡。五章均可自由进入。输入研究方向、阶段、需求、材料、成功标准后生成 Prompt，确认后一次点击直达端砚执行结果；返回原章后生成修改 Prompt 重跑，保留每轮输入、输出及版本关联。

学习提示、历史、轨迹和原始需求默认折叠。教师先看通识课章节成果，旧生医课位于次要入口 /course/biomed；原教师标注、轨迹和合成 JSONL 样例保留。默认回传任务数据，无逐任务授权。

所有执行与结果为前端 Mock；Prompt 使用规则模板，无真实端砚服务、模型、科研工具、上传或云端回流。23 微课只提供大纲与方法提示，没有完整视频课程。输入变化需重新生成 Prompt；材料缺失时不编造数值和文献。

## Brand Commitments

围绕当前任务组织页面。每屏有明确下一步；生成 Prompt 后收拢表单，结果返回后优先呈现交付物与修改入口。沿用米白纸面、深绿操作和中文可读字体。Mock 边界保留在页脚及示例结果中。

## Evidence on Hand

飞书课程大纲 revision 175 与 ChatGPT Courses 插图已通过 CLI 读取和预览。旧生医课、两条 JSONL 是历史演示样例，非真实科研或模型提升证据。

## Product Principles

- 输入明确，执行前可确认 Prompt。
- 修改 Prompt 带根任务、紧邻上一版结果和本轮要求。
- 结果回到来源章节，历史不覆盖。
- 不以资料、标注、schema 或指标阻挡学生主线。
- 文档、前端演示与真实能力分开验收。
