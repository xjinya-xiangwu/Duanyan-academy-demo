export type PracticeId = "q1" | "a1" | "a2" | "a3";
export type UnitId = "lesson" | PracticeId | "peer";
export const COURSE_TITLE = "用 AI 开展肿瘤免疫研究";
export const COURSE_SUBTITLE = "从 PD-1／PD-L1 文献，到论文与机制图";
export const TOPIC_TITLE = "PD-1／PD-L1 通路、肿瘤免疫逃逸与早期阻断证据";
export const TOPIC_ID = "BM-PD1-001";
export const INVITE_CODE = "生医6-DEMO";
export const STUDENT_NAME = "林可";
export const TEACHER_NAME = "周衡";
export const PRACTICE_IDS: PracticeId[] = ["q1", "a1", "a2", "a3"];
export const ASSIGNMENT_IDS: PracticeId[] = ["a1", "a2", "a3"];
export interface UnitDef {
  id: UnitId; kind: "lesson" | "quiz" | "assignment" | "optional";
  title: string; shortTitle: string; label: string; duration: string;
  description: string; outcome: string; goals: string[]; prompt?: string; sourceStep: string;
}
export const UNITS: UnitDef[] = [
  {
    id: "lesson", kind: "lesson", label: "课时 01", duration: "约 12 分钟",
    title: "理解免疫检查点，找到研究的起点", shortTitle: "从通路到科学问题",
    description: "先认识 PD-1／PD-L1 通路，再区分机制研究与早期临床观察各能回答什么。",
    outcome: "建立机制、证据与科学问题之间的联系。",
    goals: ["区分 PD-1 与 PD-L1 的角色", "读懂机制研究与临床观察的证据边界", "为后续研究准备同一份文献清单"],
    sourceStep: "① 教学背景阅读",
  },
  {
    id: "q1", kind: "quiz", label: "课内测验", duration: "约 8 分钟",
    title: "检查理解：从机制走向证据", shortTitle: "从机制走向证据",
    description: "完成两道概念题，再用端砚整理一段有出处的文献比较。",
    outcome: "一份区分机制主张与早期临床观察的简短回答。",
    goals: ["可选：回答两道概念自测题", "比较一篇机制研究和一篇早期临床观察", "在本测验位收到短实训产物"],
    prompt: "围绕当前课题，只用课程阅读清单完成短实训：用两三句话区分 PD-1 受体与 PD-L1 配体；比较 Iwai 等（2002）与 Topalian 等（2012）分别回答的研究问题。标明年份与 DOI，并说明早期临床观察不能支持的结论。不要编造清单外文献，也不要把教学内容写成个体治疗建议。",
    sourceStep: "① 后课内检查（Q1）",
  },
  {
    id: "a1", kind: "assignment", label: "作业 01", duration: "约 20 分钟",
    title: "界定一个可回答的研究问题", shortTitle: "问题界定与文献主张",
    description: "在同一课题中梳理研究范围、文献主张与尚未回答的问题。",
    outcome: "问题界定说明，以及 5—8 篇关键文献的主张摘要。",
    goals: ["沿用已带入的生医课题", "写清纳入与排除标准", "给出关键文献、共识与未决问题"],
    prompt: "在当前端砚课题中界定科学问题：PD-1／PD-L1 如何参与肿瘤免疫逃逸，早期通路阻断证据说明了什么、仍缺什么。只使用课内七篇阅读清单。纳入 1992—2015 年相关原始研究与重要综述；排除 2015 年之后的大型确证性随机试验、只讨论其他检查点的文献和无明确主张的新闻社论。用两三句话提出问题，选 5—8 篇关键文献，逐条写主张、年份、DOI，辨认共识、分歧和空缺。产物挂到同一课题，不虚构新数据。",
    sourceStep: "② 课题＋Agent 界定 / BM-T1",
  },
  {
    id: "a2", kind: "assignment", label: "作业 02", duration: "约 25 分钟",
    title: "把文献主张写成论文段落", shortTitle: "论文大纲与初稿",
    description: "承接问题界定，把已经有出处的主张组织成大纲和初稿。",
    outcome: "五部分论文大纲，以及带有可追溯引用的初稿段落。",
    goals: ["使用问题界定说明，未提交时带入课程示例", "组织论文大纲并写出初稿", "核对每条引用主张的出处"],
    prompt: "继续同一 PD-1／PD-L1 课题。根据已完成的问题界定、同一份阅读清单和论文结构说明，给出论文大纲，并写 1—2 节初稿段落。建议结构为背景与问题、通路与免疫抑制、免疫逃逸的实验证据、早期临床观察、分歧空缺与下一步。每条主张须能回溯到篇名、年份与 DOI。不要换病种、编造清单外文献或声称产生新实验数据。将大纲和初稿挂到同一课题。",
    sourceStep: "③ Agent 论文 / BM-T2",
  },
  {
    id: "a3", kind: "assignment", label: "作业 03", duration: "约 15 分钟",
    title: "用机制图表达你的研究", shortTitle: "机制图与图注",
    description: "把问题界定与论文主张转成一张对象明确、边界清楚的教学图。",
    outcome: "一张机制示意图，以及说明其用途和局限的图注。",
    goals: ["带入课题与论文主张，未提交时使用课程示例", "只使用对象清单中的分子与细胞", "提交机制图及教学用途说明"],
    prompt: "在同一课题中，用端砚图生制作 PD-1／PD-L1 通路的教学机制示意图。允许对象为 T 细胞、肿瘤细胞、PD-1、PD-L1、抗 PD-1 与抗 PD-L1 抗体；TCR 和 MHC—抗原肽只作识别背景。不要加入其他检查点或清单外通路。先说明机制与已有主张的联系，再制作图与简短图注。写明：教学示意图，不是实验记录或仿真结果。具体生产图生工具与模型尚未确定。",
    sourceStep: "④ 图生 / BM-T3",
  },
  {
    id: "peer", kind: "optional", label: "可选活动", duration: "自由阅读",
    title: "换一个视角，回看自己的研究", shortTitle: "阅读互评建议",
    description: "带着同伴的视角检查问题、引用和机制图；这部分不要求提交。",
    outcome: "一份用于回看自己研究的检查清单。",
    goals: ["检查问题是否具体", "检查文献主张与出处是否一致", "检查图中的对象是否都有依据"],
    sourceStep: "⑤ 可选互评",
  },
];
export const unitOf = (id: UnitId) => UNITS.find((unit) => unit.id === id)!;
export const isPracticeId = (id: string): id is PracticeId => PRACTICE_IDS.includes(id as PracticeId);
export const READING = [
  { authors: "Ishida 等", year: "1992", journal: "The EMBO Journal", title: "Induced expression of PD-1, a novel member of the immunoglobulin gene superfamily, upon programmed cell death", doi: "10.1002/j.1460-2075.1992.tb05481.x", role: "PD-1 发现" },
  { authors: "Freeman 等", year: "2000", journal: "J. Exp. Med.", title: "Engagement of the Pd-1 Immunoinhibitory Receptor by a Novel B7 Family Member Leads to Negative Regulation of Lymphocyte Activation", doi: "10.1084/jem.192.7.1027", role: "配体与免疫抑制" },
  { authors: "Iwai 等", year: "2002", journal: "PNAS", title: "Involvement of PD-L1 on tumor cells in the escape from host immune system and tumor immunotherapy by PD-L1 blockade", doi: "10.1073/pnas.192461099", role: "肿瘤免疫逃逸" },
  { authors: "Topalian 等", year: "2012", journal: "NEJM", title: "Safety, Activity, and Immune Correlates of Anti–PD-1 Antibody in Cancer", doi: "10.1056/NEJMoa1200690", role: "早期抗 PD-1 观察" },
  { authors: "Brahmer 等", year: "2012", journal: "NEJM", title: "Safety and Activity of Anti–PD-L1 Antibody in Patients with Advanced Cancer", doi: "10.1056/NEJMoa1200694", role: "早期抗 PD-L1 观察" },
  { authors: "Herbst 等", year: "2014", journal: "Nature", title: "Predictive correlates of response to the anti-PD-L1 antibody MPDL3280A in cancer patients", doi: "10.1038/nature14011", role: "应答相关线索" },
  { authors: "Sharma、Allison", year: "2015", journal: "Science", title: "The future of immune checkpoint therapy", doi: "10.1126/science.aaa8172", role: "综述与未决问题" },
];
export const QUIZ_QUESTIONS = [
  {
    id: "mechanism", question: "PD-1 与 PD-L1 结合，在本课的机制框架中主要体现什么？", answer: "b",
    options: [{ id: "a", text: "直接提高 T 细胞对所有肿瘤的杀伤" }, { id: "b", text: "参与抑制 T 细胞活化的免疫调节信号" }, { id: "c", text: "能够单独决定患者的临床治疗结果" }],
    explanation: "关注抑制性信号与 T 细胞活化。机制主张需要与肿瘤微环境和具体证据联系起来。",
  },
  {
    id: "evidence", question: "阅读 2012 年的早期抗 PD-1／PD-L1 临床观察时，哪种表述更合适？", answer: "c",
    options: [{ id: "a", text: "已经证明对所有肿瘤类型均有长期获益" }, { id: "b", text: "可以替代后续确证性比较研究" }, { id: "c", text: "提供早期安全性与活性线索，结论仍受研究设计限制" }],
    explanation: "研究设计决定了能支持的结论。早期观察与后续确证性研究的证据层级不同。",
  },
];
export const ARTIFACTS: Record<PracticeId, string> = {
  q1: [
    "## 机制与证据，回答的是不同问题",
    "PD-1 是抑制性免疫受体，PD-L1 是其配体之一。二者结合参与对淋巴细胞活化的负向调节。来源：Freeman 等，2000，DOI：10.1084/jem.192.7.1027。",
    "Iwai 等（2002）讨论肿瘤细胞 PD-L1、宿主免疫逃逸与通路阻断的实验依据；Topalian 等（2012）报告抗 PD-1 抗体的早期安全性、活性及免疫相关观察。二者的研究对象和证据类型不同。",
    "早期临床观察不能单独推出对所有肿瘤类型的长期获益，也不能替代后续确证性比较研究。",
    "出处：10.1073/pnas.192461099；10.1056/NEJMoa1200690。",
  ].join("\n\n"),
  a1: [
    "## 研究问题",
    "PD-1／PD-L1 通路参与肿瘤免疫逃逸的证据如何从受体与配体关系，延伸到肿瘤模型及早期通路阻断临床观察？不同研究留下了哪些尚未解决的问题？",
    "## 研究范围",
    "纳入 1992—2015 年相关原始研究与重要综述；不将 2015 年后的大型确证性随机试验、仅讨论其他检查点的文献或新闻社论作为本课关键证据。",
    "## 关键文献与主张线索",
    ...READING.map((item) => item.authors + "（" + item.year + "）｜" + item.role + "。DOI：" + item.doi),
    "## 共识与空缺",
    "这些文献分别提供发现、配体关系、免疫逃逸实验及早期临床观察的不同层次线索。下一步需逐条核对原文，区分机制支持、相关观察与因果推断；早期活性线索并不等于对所有肿瘤的普遍结论。",
    "论文与机制图将继续沿用这七篇文献与同一课题，不引入清单外分子或虚构实验数据。",
  ].join("\n\n"),
  a2: [
    "## 论文大纲",
    "1. 背景与问题：从 PD-1 的发现提出研究问题，依据 Ishida 等（1992）。\n2. 通路与免疫抑制：梳理受体、配体及抑制性信号，依据 Freeman 等（2000）。\n3. 免疫逃逸的实验证据：讨论肿瘤 PD-L1 与模型研究，依据 Iwai 等（2002）。\n4. 早期临床观察：比较 Topalian 等、Brahmer 等（2012）与 Herbst 等（2014）的线索。\n5. 分歧、空缺与下一步：参照 Sharma、Allison（2015），明确证据边界。",
    "## 初稿：从机制建立问题",
    "PD-1／PD-L1 的研究需要区分分子关系与疾病结论。Freeman 等（2000）关于受体配体结合及淋巴细胞活化负向调节的工作，为理解抑制性信号提供依据（DOI：10.1084/jem.192.7.1027）。Iwai 等（2002）将问题推进到肿瘤细胞 PD-L1 与免疫逃逸的实验情境（DOI：10.1073/pnas.192461099）。",
    "## 初稿：区分临床观察的边界",
    "早期抗 PD-1 与抗 PD-L1 临床研究提供了安全性与活性线索，但研究设计、对象与观察范围限定其可支持的结论。本文将这些观察与机制研究并列呈现，不将其改写成新实验数据或个体疗效预测（Topalian 等，2012，DOI：10.1056/NEJMoa1200690；Brahmer 等，2012，DOI：10.1056/NEJMoa1200694）。",
    "本稿为基于课程材料的教学初稿，论文篇幅与具体生产工具未在本演示中冻结。",
  ].join("\n\n"),
  a3: [
    "## 图 1 · PD-1／PD-L1 通路的机制表达",
    "结合图表示 T 细胞上的 PD-1 与肿瘤细胞上的 PD-L1 结合所参与的抑制性信号；阻断图用抗体阻断连接的教学构图，说明通路阻断这一研究问题。",
    "## 图注",
    "允许对象：T 细胞、肿瘤细胞、PD-1、PD-L1、抗 PD-1 抗体与抗 PD-L1 抗体。线条表达教学关系，不表达定量反应或个体疗效。",
    "依据：Freeman 等（2000），DOI：10.1084/jem.192.7.1027；Iwai 等（2002），DOI：10.1073/pnas.192461099。",
    "教学示意图，不是实验记录或仿真结果。该图为本地预置 Mock，未调用真实图生服务。",
  ].join("\n\n"),
};
export const OPTIMIZATIONS: Record<PracticeId, string[]> = {
  q1: ["补充证据边界：将受体配体关系、模型中的实验依据、早期临床观察分别标注，避免跨层次推论。", "补充核对清单：机制主张回溯至 Freeman／Iwai，临床观察回溯至 Topalian；缺少原文信息时保留待核对标记。"],
  a1: ["补充问题收窄：本课比较机制证据如何支持通路阻断研究，不讨论清单外检查点，也不预测个体治疗效果。", "补充纳排说明：2015 年以后的确证性试验不进入本课关键证据；相关观察不直接改写为因果结论。"],
  a2: ["补充引用核对：将受体配体主张与 Freeman（2000）对应，将肿瘤模型证据与 Iwai（2002）对应，临床段落保留两项 2012 年研究出处。", "补充讨论段：模型与早期临床观察的外推边界不同，需验证各论点与原文的一致性，不把本稿写成实验新数据。"],
  a3: ["优化图注：分开未阻断的抑制性连接和通路阻断的研究示意，不将阻断画成所有患者均获益。", "补充对象核对：只保留课程对象清单，箭头表示关系而非定量效果，保留教学示意与实验记录的边界。"],
};
export function readingCSV() {
  const quote = (text: string) => '"' + text.replaceAll('"', '""') + '"';
  return "\uFEFF" + ["title,first_authors,year,venue,doi,role_in_packet", ...READING.map((item) => [item.title, item.authors, item.year, item.journal, item.doi, item.role].map(quote).join(","))].join("\r\n");
}
