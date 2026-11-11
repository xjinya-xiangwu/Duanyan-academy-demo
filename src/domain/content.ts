export const COURSE_ID = "bio-pd1";
export const CLOSED_ID = "protein-intro";
export const COURSE_TITLE = "PD-1 与 PD-L1：机制示意与文献综述";
export const CLOSED_TITLE = "蛋白质结构入门";
export const TEACHER_NAME = "周衡";
export const STUDENT_NAME = "林可";
export const TOPIC_ID = "topic-pd1";
export const TOPIC_TITLE = "PD-1／PD-L1 机制示意与文献综述";
export const INVITE_CODE = "生医6-DEMO";
export const ROSTER = ["林可", "学员甲", "学员乙"] as const;

export const LECTURE = [
  "T 细胞要识别肿瘤细胞时，会用到表面的受体 PD-1。肿瘤细胞则可以在自己表面放上 PD-L1。二者结合之后，T 细胞的活化信号不再保持原来的强度。",
  "这门课只画一张示意图。图上要能看清两件事：PD-1 和 PD-L1 有没有结合；结合之后，指向活化的箭头是减弱，还是和未结合时一样。",
  "图里不写剂量，不写有效率，也不放入真实患者的记录。后文如果出现文献，那些条目是课堂用的虚构占位，用来练习「主张要跟得上出处」，不能写成已经发表的定论。",
  "学完这一课之后，先做一次课内测验，再完成三份作业：把课题收成可检验的问题，写一段带引用主张的论文草稿，最后为同一课题放上这张图。最后的同学互看可以不做。",
] as const;

export const TEMPLATE_STEPS = [
  { id: "lesson", required: false, label: "① 教学课时" },
  { id: "q1", required: false, label: "测验 Q1" },
  { id: "a2", required: true, label: "② 作业：课题与 Agent 界定" },
  { id: "a3", required: true, label: "③ 作业：Agent 论文" },
  { id: "a4", required: true, label: "④ 作业：图生" },
  { id: "peer", required: false, label: "⑤ 可选互评" },
] as const;

export type UnitId = "q1" | "a2" | "a3" | "a4";
export type ConfigKey = "lesson" | UnitId;

export interface UnitConfig {
  title: string;
  notes: string;
  requirement: string;
  duanyanRequired: boolean;
}

export const DEFAULT_CONFIGS: Record<ConfigKey, UnitConfig> = {
  lesson: {
    title: "结合之后，活化信号怎么画",
    notes: "结合之后，活化信号怎么画。",
    requirement: "读完讲义。已读不计为作业完成。",
    duanyanRequired: false,
  },
  q1: {
    title: "Q1 · 课内检查",
    notes: "纸面两题用来回忆。短实训在端砚里做，回到这一节。",
    requirement: "用两三句话写出这张图的边界，并回到这一测验。课题仍是上面这一门。",
    duanyanRequired: true,
  },
  a2: {
    title: "课题与 Agent 界定",
    notes: "打开本课课题，写出可检验的问题界定。",
    requirement: "回传一份问题界定短文。",
    duanyanRequired: true,
  },
  a3: {
    title: "Agent 论文",
    notes: "写大纲中的一段，并给出引用主张。",
    requirement: "回传段落和引用主张。",
    duanyanRequired: true,
  },
  a4: {
    title: "图生",
    notes: "为同一课题放一张机制示意。",
    requirement: "回传图和图注。",
    duanyanRequired: true,
  },
};

export function unitShort(unitId: UnitId): string {
  switch (unitId) {
    case "q1":
      return "测验 Q1";
    case "a2":
      return "作业 ②";
    case "a3":
      return "作业 ③";
    case "a4":
      return "作业 ④";
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function unitTitle(unitId: UnitId): string {
  switch (unitId) {
    case "q1":
      return "课内检查";
    case "a2":
      return "课题与 Agent 界定";
    case "a3":
      return "Agent 论文";
    case "a4":
      return "图生";
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function promptDraft(unitId: UnitId): readonly string[] {
  switch (unitId) {
    case "q1":
      return [
        "草案。用两三句话写清：PD-1 与 PD-L1 结合后，示意图如何表示 T 细胞的活化信号。",
        "只比较结合与未结合。不要写成临床结论。",
      ];
    case "a2":
      return [
        "草案。把本课课题收成一段可检验的问题界定。",
        "写明这一张图纳入什么、排除什么。课题不要换。",
      ];
    case "a3":
      return [
        "草案。写大纲中的一段，并给出两条引用主张。",
        "引用只用虚构条目。写完后由你自己回传。",
      ];
    case "a4":
      return [
        "草案。为同一课题放一张机制示意，并写图注。",
        "图注要写明：这是课堂示意，不表示临床效果。",
      ];
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function baseArtifact(unitId: UnitId): string {
  switch (unitId) {
    case "q1":
      return "PD-1 与 PD-L1 结合之后，示意图把 T 细胞的活化信号画成减弱。比较只停在结合与未结合，不下临床结论。";
    case "a2":
      return `问题界定：在「${TOPIC_TITLE}」里，只检验示意图能否表示 PD-1 与 PD-L1 结合后活化信号减弱。不建立肿瘤微环境的定量模型。`;
    case "a3":
      return "大纲段落：先复述课堂问题，再放上出处。虚构作者甲，2019，《PD-1 通路示意综述（虚构条目）》。虚构作者乙，2021，《PD-L1 与 T 细胞活化信号（虚构条目）》。主张：示意图只支持「结合—信号减弱」，不能外推。";
    case "a4":
      return "图注：PD-1 与 PD-L1 结合后，T 细胞活化信号减弱。这是课堂示意，不表示临床效果。";
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function optimizeAddition(unitId: UnitId, index: number): string {
  if (index >= 3) return "第三次优化只留在稿上，按规则不再计入。";
  switch (unitId) {
    case "q1":
      return index === 1
        ? "优化补上：图上要能指出「结合」和「信号减弱」，不能指出疗效。"
        : "再优化：不画剂量，也不画生存差异。";
    case "a2":
      return index === 1
        ? "优化补上：可核对的说法是，图能区分结合与未结合，且信号只在结合时减弱。"
        : "再优化：排除真实患者记录和任何疗效数字。";
    case "a3":
      return index === 1
        ? "优化补上：两条主张都只指向虚构条目，不把占位文献写成定论。"
        : "再优化：段落里不出现剂量、有效率或生存差异。";
    case "a4":
      return index === 1
        ? "优化补上：图注写明箭头表示信号减弱，不表示治疗效果。"
        : "再优化：图中不画剂量，也不画临床结局。";
    default: {
      const neverId: never = unitId;
      return neverId;
    }
  }
}

export function suggestionFor(level: number): {
  tendency: "pass" | "redo";
  headline: string;
  reasons: string[];
} {
  if (level <= 0) {
    return {
      tendency: "redo",
      headline: "倾向：建议请修改",
      reasons: [
        "产物仍绑定本课课题。",
        "稿上还没有优化留下的可见差别。",
        "要不要请学生修改，得由老师自己点。",
      ],
    };
  }
  return {
    tendency: "pass",
    headline: "倾向：建议通过",
    reasons: [
      "产物仍绑定本课课题。",
      "稿上可以看见优化补上的句子。",
      "说法停在课堂示意，没有写成临床结论。",
    ],
  };
}
