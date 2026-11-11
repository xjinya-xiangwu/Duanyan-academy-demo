import type { Snapshot, StageId, Suggestion, TextLine } from "./types";

export const TOPIC_NAME = "示例课题：PD-1／PD-L1 机制示意与文献综述";

export const COURSE_NAME = "生医示例课";

export const COMPLETION_TEXT = "长程课题已走完引导路径（演示）";

export const REQUIRED_ITEMS: Record<StageId, readonly string[]> = {
  1: ["问题界定短文"],
  2: ["综述大纲与引用占位", "机制示意占位图"],
  3: ["修订稿"],
};

export const DEMO_FIELDS = [
  ["stage_id", "阶段编号"],
  ["event_kind", "事件种类"],
  ["counted", "是否计入回流"],
  ["topic_ref", "课题引用"],
] as const;

export const REVIEW_RUBRIC = [
  "是否仍绑定同一课题「示例课题：PD-1／PD-L1 机制示意与文献综述」",
  "本阶段必选产物是否已出现在课内作业位",
  "主张或图注是否能在时间线上抽检",
] as const;

export type Resource = {
  name: string;
  format: string;
  source: string;
  note: string;
  body: string;
};

export type StagePack = {
  id: StageId;
  name: string;
  goal: string;
  lessons: { title: string; body: string }[];
  taskSteps: string[];
  promptTitle: string;
  promptBody: string[];
  resources: Resource[];
  skills: string[];
};

const line = (id: string, text: string, mark: TextLine["mark"] = "same"): TextLine => ({
  id,
  text,
  mark,
});

const stage1: Record<0 | 1 | 2, Snapshot> = {
  0: {
    stageId: 1,
    version: 0,
    heading: "问题界定",
    lines: [
      line("s1-q", "课堂问题：PD-1 与 PD-L1 结合之后，示意图上如何表示 T 细胞活化被减弱？"),
      line("s1-scope", "范围：只做机制示意和文献综述草稿。"),
      line("s1-out", "不做：不下临床疗效结论，不使用真实患者数据。"),
    ],
    caption: null,
    hasFigure: false,
    figureVersion: 0,
  },
  1: {
    stageId: 1,
    version: 1,
    heading: "问题界定",
    lines: [
      line("s1-q", "课堂问题：PD-1 与 PD-L1 结合之后，示意图上如何表示 T 细胞活化被减弱？"),
      line("s1-scope", "范围：只做机制示意和文献综述草稿。"),
      line("s1-out", "不做：不下临床疗效结论，不使用真实患者数据。"),
      line("s1-bound", "可检验边界（优化补入）：只比较「结合」与「未结合」两种示意状态。", "added"),
      line("s1-exclude", "排除项（优化补入）：不建立肿瘤微环境的定量模型。", "added"),
    ],
    caption: null,
    hasFigure: false,
    figureVersion: 0,
  },
  2: {
    stageId: 1,
    version: 2,
    heading: "问题界定",
    lines: [
      line("s1-q", "课堂问题：PD-1 与 PD-L1 结合之后，示意图上如何表示 T 细胞活化被减弱？"),
      line("s1-scope", "范围：只做机制示意和文献综述草稿。"),
      line("s1-out", "不做：不下临床疗效结论，不使用真实患者数据。"),
      line("s1-bound", "可检验边界（优化补入）：只比较「结合」与「未结合」两种示意状态。", "added"),
      line("s1-exclude", "排除项（优化补入）：不建立肿瘤微环境的定量模型。", "added"),
      line("s1-cite", "引用边界（再次优化）：文中条目都是虚构占位，不能写成文献定论。", "added"),
    ],
    caption: null,
    hasFigure: false,
    figureVersion: 0,
  },
};

const stage2: Record<0 | 1 | 2, Snapshot> = {
  0: {
    stageId: 2,
    version: 0,
    heading: "证据与图示",
    lines: [
      line("s2-outline", "综述结构：问题复述 → 通路角色占位 → 示意图能支持的命题。"),
      line("s2-cite-a", "引用占位：虚构作者甲，2019，《PD-1 通路示意综述（虚构条目）》。"),
      line("s2-cite-b", "引用占位：虚构作者乙，2021，《PD-L1 与 T 细胞活化信号（虚构条目）》。"),
    ],
    caption: line("s2-cap", "图 1　PD-1／PD-L1 结合示意（占位图，演示／Mock）。"),
    hasFigure: true,
    figureVersion: 0,
  },
  1: {
    stageId: 2,
    version: 1,
    heading: "证据与图示",
    lines: [
      line("s2-outline", "综述结构：问题复述 → 通路角色占位 → 示意图能支持的命题。"),
      line("s2-cite-a", "引用占位：虚构作者甲，2019，《PD-1 通路示意综述（虚构条目）》。"),
      line("s2-cite-b", "引用占位：虚构作者乙，2021，《PD-L1 与 T 细胞活化信号（虚构条目）》。"),
      line(
        "s2-claim-1",
        "主张（优化补入）：示意图只支持「结合—信号减弱」这一课堂命题，依据是虚构条目甲，不得外推。",
        "added",
      ),
    ],
    caption: line(
      "s2-cap",
      "图 1　PD-1 与 PD-L1 结合后，T 细胞活化信号减弱的课堂示意（优化后图注，演示／Mock）。不表示临床效果。",
      "changed",
    ),
    hasFigure: true,
    figureVersion: 1,
  },
  2: {
    stageId: 2,
    version: 2,
    heading: "证据与图示",
    lines: [
      line("s2-outline", "综述结构：问题复述 → 通路角色占位 → 示意图能支持的命题。"),
      line("s2-cite-a", "引用占位：虚构作者甲，2019，《PD-1 通路示意综述（虚构条目）》。"),
      line("s2-cite-b", "引用占位：虚构作者乙，2021，《PD-L1 与 T 细胞活化信号（虚构条目）》。"),
      line(
        "s2-claim-1",
        "主张（优化补入）：示意图只支持「结合—信号减弱」这一课堂命题，依据是虚构条目甲，不得外推。",
        "added",
      ),
      line("s2-claim-2", "主张（再次优化）：图中不画剂量、有效率或生存差异。", "added"),
    ],
    caption: line(
      "s2-cap",
      "图 1　结合后活化信号减弱；图内不含临床结局（第 2 次优化图注，演示／Mock）。",
      "changed",
    ),
    hasFigure: true,
    figureVersion: 2,
  },
};

function stage3Snapshot(version: 0 | 1 | 2, carryOver: string): Snapshot {
  const shared = [
    line("s3-carry", carryOver),
    line("s3-draft", "修订稿在阶段 2 的大纲和图注上收束表述，仍只使用虚构引用。"),
    line("s3-handin", "本阶段准备把修订稿交回课内作业位，供老师抽检。"),
  ];
  switch (version) {
    case 0:
      return {
        stageId: 3,
        version: 0,
        heading: "迭代修订稿",
        lines: shared,
        caption: line("s3-cap", "图注初稿：沿用阶段 2 的结合示意，尚未按本阶段目标改写。"),
        hasFigure: true,
        figureVersion: 0,
      };
    case 1:
      return {
        stageId: 3,
        version: 1,
        heading: "迭代修订稿",
        lines: [
          ...shared,
          line(
            "s3-note-1",
            "修订说明（优化可见差异）：图注改为「结合后活化信号减弱；不含临床结局」。",
            "added",
          ),
        ],
        caption: line(
          "s3-cap",
          "图 1　结合后活化信号减弱；不含临床结局（优化后图注，演示／Mock）。",
          "changed",
        ),
        hasFigure: true,
        figureVersion: 1,
      };
    case 2:
      return {
        stageId: 3,
        version: 2,
        heading: "迭代修订稿",
        lines: [
          ...shared,
          line(
            "s3-note-1",
            "修订说明（优化可见差异）：图注改为「结合后活化信号减弱；不含临床结局」。",
            "added",
          ),
          line(
            "s3-note-2",
            "再修订：走完 3 个阶段只表示引导路径结束，不生成任何证明文书。",
            "added",
          ),
        ],
        caption: line(
          "s3-cap",
          "图 1　结合后活化信号减弱；不含临床结局；不延伸为证明文书（第 2 次优化图注，演示／Mock）。",
          "changed",
        ),
        hasFigure: true,
        figureVersion: 2,
      };
    default: {
      const exhaustive: never = version;
      return exhaustive;
    }
  }
}

export function stage3CarryOver(stage2: Snapshot | null): string {
  if (!stage2) {
    return "阶段 2 底稿缺失时的占位句（演示／Mock）。";
  }
  const caption = stage2.caption?.text ?? "（无图注）";
  return `承接阶段 2《${stage2.heading}》。当时图注为「${caption}」。`;
}

export function snapshotFor(stageId: StageId, version: 0 | 1 | 2, carryOver: string): Snapshot {
  switch (stageId) {
    case 1:
      return stage1[version];
    case 2:
      return stage2[version];
    case 3:
      return stage3Snapshot(version, carryOver);
    default: {
      const exhaustive: never = stageId;
      return exhaustive;
    }
  }
}

export function buildSuggestion(stageId: StageId, version: 0 | 1 | 2): Suggestion {
  const bound =
    stageId === 1
      ? "阶段 1 的问题界定短文已绑定本课题。"
      : stageId === 2
        ? "阶段 2 的大纲、引用占位和机制图已绑定本课题。"
        : "阶段 3 的修订稿已绑定本课题。";
  if (version === 0) {
    return {
      tendency: "redo",
      headline: "倾向：建议补做（演示／Mock，不是裁定，没有评分）",
      reasons: [
        bound,
        "回传稿上还没有提交前优化的可见差异。",
        "是否补做要由老师手点；本建议不会自动改状态。",
      ],
    };
  }
  return {
    tendency: "pass",
    headline: "倾向：建议通过（演示／Mock，不是裁定，没有评分）",
    reasons: [
      `${bound}产物已经出现在课内作业位。`,
      "优化前后的文字或图注差异可以在本页对照。",
      "主张停在课堂示意，没有写成临床结论；仍要老师手点。",
    ],
  };
}

export const STAGE_PACKS: Record<StageId, StagePack> = {
  1: {
    id: 1,
    name: "课题界定",
    goal: "在课内把课题收成一个可检验的问题，并写明范围。",
    lessons: [
      {
        title: "1.1 把现象收成可检验问题",
        body: "阅读占位：先写「结合之后，示意图上发生了什么」，再删掉不能在图上检验的句子。本段是教学材料（草案／Mock）。",
      },
      {
        title: "1.2 划定机制示意的边界",
        body: "阅读占位：本阶段不写临床疗效，不使用真实患者数据。读完本段不算履约。",
      },
    ],
    taskSteps: [
      "阅读本阶段材料。阅读本身不计成功。",
      "打开端砚（演示），生成本阶段的问题界定短文。",
      "可以先优化再回传，也可以生成后直接回传。优化不会自动回传。",
    ],
    promptTitle: "分步 prompt：把课题收成可检验问题",
    promptBody: [
      "写出一个可以用示意图检验的问题。",
      "写明纳入范围和排除范围。",
      "课题名保持为「示例课题：PD-1／PD-L1 机制示意与文献综述」。",
      "不要写成临床结论。",
    ],
    resources: [
      {
        name: "task-brief.md",
        format: "Markdown",
        source: "草案／Mock",
        note: "课内预置附件。不是端砚内的已有资产。",
        body: [
          "# task-brief.md（草案／Mock）",
          "",
          "课题：示例课题：PD-1／PD-L1 机制示意与文献综述",
          "",
          "本阶段只要求把课题收成一个可检验的课堂问题。",
          "不要写成临床结论。",
          "本文件是课内预置草案，不是端砚里的已有资产。",
        ].join("\n"),
      },
    ],
    skills: [],
  },
  2: {
    id: 2,
    name: "证据与图示",
    goal: "写出文献综述草稿，并挂上同一课题的机制示意占位图。",
    lessons: [
      {
        title: "2.1 综述结构与引用主张",
        body: "阅读占位：综述按「问题—证据占位—图示命题」三段写。引用只使用虚构条目。读完本段不算履约。",
      },
      {
        title: "2.2 机制示意图只说明什么",
        body: "阅读占位：图只表示结合与信号减弱，不表示剂量或临床结局。读完本段不算履约。",
      },
    ],
    taskSteps: [
      "阅读本阶段材料。阅读本身不计成功。",
      "打开端砚（演示），生成大纲、引用占位和机制示意占位图。",
      "回传前可以优化图注和主张。优化不会自动回传。",
    ],
    promptTitle: "prompt：综述结构、引用主张与图生约束",
    promptBody: [
      "综述按「问题—证据占位—图示命题」三段写。",
      "引用只使用 ref-list.mock.csv 里的虚构条目，不引用未授权全文。",
      "图只画 PD-1 与 PD-L1 的结合，以及活化信号减弱。",
      "图注里写明：这是课堂示意，不表示临床效果。",
    ],
    resources: [
      {
        name: "ref-list.mock.csv",
        format: "CSV",
        source: "Mock",
        note: "字段：作者／年份／标题。来源是 Mock，不是真实文献库。",
        body: [
          "作者,年份,标题",
          "虚构作者甲,2019,PD-1 通路示意综述（虚构条目）",
          "虚构作者乙,2021,PD-L1 与 T 细胞活化信号（虚构条目）",
          "虚构作者丙,2023,检查点示意图边界说明（虚构条目）",
        ].join("\n"),
      },
    ],
    skills: ["文献主张核对（草案）", "机制图生成约束（草案）"],
  },
  3: {
    id: 3,
    name: "迭代完善",
    goal: "对照阶段目标修订稿件与图注，并把修订稿交回抽检。",
    lessons: [
      {
        title: "3.1 对照阶段目标修订",
        body: "阅读占位：修订时保留阶段 2 的课题绑定，只改主张和图注里越界的句子。读完本段不算履约。",
      },
      {
        title: "3.2 把稿件交给抽检",
        body: "阅读占位：回传之后等待老师抽检。老师的建议不是最终结论。读完本段不算履约。",
      },
    ],
    taskSteps: [
      "阅读本阶段材料。阅读本身不计成功。",
      "打开端砚（演示），基于阶段 2 产物生成修订稿。",
      "引导路径是先做一次可见优化，再回传。直接回传也可以。优化不会自动回传。",
    ],
    promptTitle: "prompt：对照阶段目标修订稿件与图注",
    promptBody: [
      "对照本阶段目标，修订稿件和图注。",
      "保留同一课题名，不另开课题。",
      "可见差异要落在主张或图注上，方便老师抽检。",
      "不新增未标注的隐藏要求。",
    ],
    resources: [
      {
        name: "阶段 2 产物引用",
        format: "课内作业位",
        source: "演示／Mock",
        note: "不是外部文件。生成修订稿时会写明阶段 2 的标题和图注。",
        body: "本资源只指向本 Demo 里阶段 2 已回传的 Mock 产物。没有单独的生产文件。",
      },
      {
        name: "辅助评估要点（草案）",
        format: "老师抽检页",
        source: "草案／Mock",
        note: "给老师在抽检页展开。不是学生侧的隐藏 prompt。",
        body: REVIEW_RUBRIC.join("\n"),
      },
    ],
    skills: [],
  },
};

export function stagePack(stageId: StageId): StagePack {
  switch (stageId) {
    case 1:
      return STAGE_PACKS[1];
    case 2:
      return STAGE_PACKS[2];
    case 3:
      return STAGE_PACKS[3];
    default: {
      const exhaustive: never = stageId;
      return exhaustive;
    }
  }
}
