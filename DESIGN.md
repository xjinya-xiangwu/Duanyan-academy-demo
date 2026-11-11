---
name: "端砚学院 Demo"
description: "米白纸面与深绿操作组成的研究课程体验；按当前实现提取。"
colors:
  canvas: "#fbfaf6"
  paper: "#fffefb"
  ink: "#23352b"
  heading: "#153c2b"
  green: "#0e3d2c"
  green-hover: "#1e5840"
  green-tint: "#edf2e8"
  muted: "#5e6b5b"
  line: "#e0e3d8"
  subtle: "#f2f2e9"
  gold: "#876323"
  gold-tint: "#f6f0df"
  danger: "#974d35"
  danger-tint: "#fbefe7"
typography:
  display:
    fontFamily: 'Georgia, "Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif'
    fontSize: "clamp(36px, 3.6vw, 48px)"
    fontWeight: 600
    lineHeight: 1.27
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'Georgia, "Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif'
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  section:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.5
  title:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 2
  control:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  chip: "4px"
  field: "5px"
  control: "6px"
  toast: "7px"
  studio: "9px"
  illustration: "12px"
  circle: "50%"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "40": "40px"
  "48": "48px"
  "56": "56px"
  "64": "64px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.green-tint}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-ghost-hover:
    backgroundColor: "{colors.green-tint}"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
    width: "100%"
  unit-navigation:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 12px"
    width: "100%"
  unit-navigation-selected:
    backgroundColor: "#eaf0e2"
    textColor: "{colors.green}"
  status-chip:
    backgroundColor: "#f0f1ea"
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    padding: "3px 9px"
  feedback-card:
    backgroundColor: "#f0f3e8"
    rounded: "{rounded.control}"
    padding: "{spacing.24}"
  task-flow:
    textColor: "{colors.green}"
    padding: "0 0 24px"
  tabs:
    textColor: "{colors.muted}"
    padding: "12px 0 15px"
---

# Design System: 端砚学院 Demo

## Overview

**Creative North Star: "米白纸上的研究课堂"**

以现有米白纸面与深绿文字构成一间安静的研究课堂。大标题、讲义、文献、图解和作业共用连续的纸面；绿色承担身份与主要操作，细线、留白和浅色块帮助读者辨认章节与当前状态。

标题使用带中文回退的衬线字体，正文和控件采用系统中文无衬线。科研插画与机制教学图由本地 SVG 绘制；细胞、受体和通路关系服务课程理解。作业与反馈沿用同一视觉语言，通过清楚的动作名称表达任务当前处于网页还是端砚执行页。

**Key Characteristics:**

- 温暖米白画布与低饱和浅色分层。
- 深绿主操作、衬线课程标题与清晰的中文正文。
- 连续章节、细分隔线和有节奏的留白。
- 小圆角控件、轻边框与文字说明共同表达状态。
- 本地 SVG 教学图与显式的前端 Mock 标识。

本文件为 2026-11-11 的 as-built 记录。依据 PRODUCT.md、课程 surface brief、全局 styles.css、课程与任务组件、Shell、StudioPage、路由和解锁逻辑提取；这些名称描述既有实现。此文档不代表真实模型、端砚服务或后端已接通。

## Colors

暖纸色与偏灰绿的中性色构成大面积背景，深绿提供清楚的视觉锚点。frontmatter 保留当前源码的十六进制颜色，sidecar 的八阶色带仅为预览生成，不是新增应用配色。

### Primary

- **深林绿**（green）：品牌、主要按钮、当前导航与关键操作文字；悬停沿用 green-hover。
- **浅叶绿**（green-tint）：次要操作悬停、辅助背景与轻量交互反馈。

### Secondary

- **温金**（gold、gold-tint）：键盘焦点、待反馈状态及辅助评估事件；不作为第二套主按钮色。
- **赭红**（danger、danger-tint）：错误、需修改状态和返工提示，并始终配合文字说明。

### Neutral

- **米白画布**（canvas）与**浅纸面**（paper）：页面与输入区、执行面板、提示浮层。
- **墨绿正文**（ink）与**深绿标题**（heading）：阅读层级。
- **灰绿辅助字**（muted）：元信息、说明、资源描述与时间。
- **纸灰分隔**（line）与**浅灰底**（subtle）：细线、滚动条轨道等低强调元素。

**The 绿墨分工 Rule.** 深绿用于品牌、主操作、当前导航与关键任务标题；浅绿承接辅助分区。金色用于等待与键盘焦点，赭红用于错误与需修改反馈。

## Typography

**Display Font:** 中文衬线回退栈由 frontmatter 的 display、headline 定义；英文优先 Georgia，中文按本机可用字体回退。

**Body Font:** Segoe UI、PingFang SC、Microsoft YaHei、Noto Sans SC 与系统无衬线回退。

课程首页使用 display；单元标题使用 headline；小节使用 section，普通三级标题使用 title。根字号为 body，讲义长文使用 reading 的宽松行高；按钮使用 control，元信息使用 label。字号来自现有 CSS，未强行整理为等比刻度。

正文段落的一般行高为（1.85），讲义与产物段落为（2）。讲义最大宽度为（820px），单元简介最大宽度为（660px）；较长的交付物允许断行。部分上下文与状态字号在（9–12px）之间，属于当前实现记录。

**The 标题与操作分声 Rule.** 课程、单元和产物标题沿用衬线字体；导航、表单、按钮和状态标签沿用无衬线字体。英文文献标题与年份保留现有 Georgia 排版。

## Layout

标准页面居中，最大宽度为（1280px），默认内边距为（28px 56px 64px）。页眉高（80px），内部最大宽度为（1440px），保持顶部吸附。课程首页以约等宽的两列呈现课程信息和本地 SVG，后续使用正文加（290px）资料侧栏。

课内页面最大宽度为（1320px），默认目录列为（246px），栏间距为（56px），目录在（110px）处吸附。端砚执行面板最大页面宽度为（1440px），默认上下文列为（270px）；教师反馈采用正文加（320px）反馈列。复用间距以 frontmatter 的离散值为准，各组件保留已实现的局部内边距。

宽度收缩按现有媒体查询执行：

- （1100px）以下收窄横向留白与各侧栏。
- （850px）以下端砚执行结果位于前方，上下文转到下方，避免压缩主要工作区。
- （680px）以下课程、作业和反馈切为单列；主导航与桌面目录收起，课内目录变为可展开区，关键操作铺满可用宽度。
- （365px）以下缩小页边距、品牌与标签；教师提交表保持（530px）最小内容宽度并局部滚动。
- （1600px）以上增加顶部与课程首段留白。打印样式隐藏导航、操作按钮和提示，保留正文。

**The 纸面连续 Rule.** 章节之间沿用留白和细线，浅色块承接已有的提示、任务上下文和教师反馈用途。长文允许自然换行，表格在窄屏容器内滚动。

## Elevation & Depth

纸面与浅色块提供结构层次。正文、目录、作业和反馈区以细边框与留白为主；只有演示设置浮层和 toast 使用现有盒阴影。

### Shadow Vocabulary

- **设置浮层**（0 8px 30px #213a1a14）：页脚上方的演示设置。
- **操作通知**（0 6px 30px #25361e1a）：底部居中的 toast。
- 教学插画保留自身 SVG 的柔和投影，不把这一图像效果扩展为页面容器阴影。

**The 正文平面 Rule.** 课程正文、作业与反馈区以边框和色调区分层次；现有盒阴影只用于演示设置浮层与 toast。插画内部的 SVG 投影属于图像本身。

## Shapes

控件采用紧凑矩形与轻圆角。状态标签、输入框、按钮、提示和执行面板分别使用 frontmatter 的 chip、field、control、toast 与 studio。头像、完成标记和事件节点使用 circle。SVG 图像自身保留已实现的圆角与有机细胞轮廓。

边框通常为（1px），文字链接以下划线或文字颜色反馈悬停；选中导航以浅绿块和文字共同识别，标签保持可读文字。

**The 小圆角 Rule.** 标签、表单和按钮采用小圆角；圆形只用于头像、完成标记与时间线节点。不要将现有矩形操作控件改成胶囊形。

## Components

### Buttons

主按钮为深绿底、浅纸面字；次按钮为浅纸面与轻边框；文字操作沿用绿字。默认最小高度为（42px），大按钮为（48px）。禁用状态降低透明度至（0.5），光标显示不可操作；它表达当前操作条件，不承担学习顺序锁定。

按钮背景、文字和边框用（0.15s）过渡。悬停只改变已有颜色；键盘焦点使用温金描边（2px）与外偏移（4px）。未定义额外的按压变形。

### Inputs / Fields

浅纸面输入框与 textarea 使用轻边框（#cfd5c7）和 field 圆角，内边距见 field。textarea 支持纵向调整，行高为（1.9）；网页 Prompt 字段字号为（12px）。错误输入使用 danger 边框并配错误文字，placeholder 使用 muted。网页交付物编辑区最小高度为（260px）。

### Navigation

主导航、课程单元和标签页各自表达位置。桌面单元目录以小标签、标题和线性图标排布；当前单元使用浅绿底，主导航与标签页使用底部细线（2px）。窄屏采用已有的可展开课程目录，保留同一单元链接。

**The 可访问单元 Rule.** 完成入课校验后，讲义、测验、三份作业与选读均可直接进入；当前导航和完成状态分别表达位置与进度，不表达学习前置锁。作业使用默认课题，缺少前置产物时使用课程样例。

### Chips

状态标签为小圆角、浅底色、轻字号，状态文字保持可见。等待用浅金，通过与已回传用浅绿，需修改用浅赭红。通过状态增加勾选图标；颜色与图标共同辅助文字，不单独承担含义。

### Cards / Containers

复用浅色提示、反馈编辑区与课题上下文块；教师反馈区使用 feedback-card。一般分区延续纸面和细线，执行面板保留独立轻边框。浮层阴影遵循 Elevation & Depth。

### Task Preparation / Web Result

作业准备区以三段简短流程呈现“课程网页准备 Prompt → 端砚执行 Agent → 网页优化并提交”，首段清楚显示“前往端砚执行（演示）”。Prompt 可展开生成与编辑；执行结果返回网页后提供预览、文字编辑、优化和独立提交按钮。两项主要动作的排列与标签体现实际职责。

**The 网页归口 Rule.** 课程网页生成和编辑 Prompt，接收并编辑、优化执行结果，再由学员手动提交。端砚同站 Mock 只接收标准任务、执行 Agent 并返回结果；入口与动作标签持续表达这一职责。

### Agent Execution / Trace / Feedback

端砚页只展示输入、执行结果和运行记录；执行结果在此只读。运行状态使用文字及浅色骨架，骨架呼吸周期为（1.2s），透明度由（1）降至（0.45）；用户偏好减少动画时停用动画与过渡。

运行记录使用竖向细线、圆形图标节点与时间文字，执行记录和提交反馈保持当前单元上下文。教师反馈区域包含人工反馈动作和单独的 AI 辅助评估说明。

**The 演示证据 Rule.** 页脚保留课程、产物与轨迹为 Mock 的说明；端砚执行页和网页优化结果旁保留对应演示说明。AI 评估是建议，最终反馈由教师点击。

## Do's and Don'ts

### Do:

- Do 保留米白画布与深绿主操作，沿用 frontmatter 的颜色 token。
- Do 用衬线标题与无衬线正文、控件维持现有层级。
- Do 保留键盘焦点、可读标签、错误文字与状态说明。
- Do 在窄屏保持任务入口与提交按钮可用，并沿用课程目录折叠和表格局部滚动。
- Do 将 Prompt 编辑、交付物优化与手动提交放在课程网页。
- Do 保留全单元自由访问、课程样例与各处 Mock 说明。

### Don't:

- Don't 替换已确认的米白与深绿视觉身份。
- Don't 为课程正文与普通分区增加悬浮阴影或胶囊形主按钮。
- Don't 用颜色单独代替状态文字、错误说明或当前导航标识。
- Don't 将课程教学图、前端产物或模拟轨迹描述为实验记录、真实模型结果或真实端砚接入。
- Don't 把优化当成提交、把 AI 建议当成教师裁定，或恢复学习顺序的前置锁。
