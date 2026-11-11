import { describe, expect, it } from "vitest";
import { STUDENT_NAME, TEMPLATE_STEPS } from "./content";
import {
  datasetRows,
  filterDataset,
  initialState,
  metricsOf,
  reducer,
  type Action,
  type DemoState,
} from "./model";

function run(actions: Action[], start: DemoState = initialState): DemoState {
  return actions.reduce(reducer, start);
}

const q1Done: Action[] = [
  { type: "open_studio", unitId: "q1" },
  { type: "generate", unitId: "q1", outcome: "success" },
  { type: "optimize", unitId: "q1", outcome: "success" },
  { type: "return_unit", unitId: "q1" },
];

describe("教师工作台增量", () => {
  it("默认仍是学员，6 步骨架固定", () => {
    expect(initialState.role).toBe("student");
    expect(initialState.version).toBe(5);
    expect(TEMPLATE_STEPS.map((step) => step.id)).toEqual(["lesson", "q1", "a2", "a3", "a4", "peer"]);
    expect(TEMPLATE_STEPS.filter((step) => step.required).map((step) => step.id)).toEqual(["a2", "a3", "a4"]);
  });

  it("保存课时、测验和作业说明后，学员文案变化，回流不加", () => {
    const before = metricsOf(initialState);
    const saved = reducer(initialState, {
      type: "save_unit_config",
      key: "lesson",
      config: {
        ...initialState.configs.lesson,
        notes: "课时说明已改：活化箭头只表示减弱。",
      },
    });
    expect(saved.configs.lesson.notes).toBe("课时说明已改：活化箭头只表示减弱。");
    expect(saved.configs.q1).toEqual(initialState.configs.q1);
    expect(saved.events).toEqual([]);
    expect(metricsOf(saved)).toEqual(before);
    expect(saved.notice).toContain("不计回流");
    expect(saved.draft.requiredAttached).toBe(true);

    const quiz = reducer(saved, {
      type: "save_unit_config",
      key: "q1",
      config: {
        ...saved.configs.q1,
        requirement: "测验要求已改：只比较结合与未结合。",
        duanyanRequired: false,
      },
    });
    expect(quiz.configs.q1.requirement).toBe("测验要求已改：只比较结合与未结合。");
    expect(quiz.configs.q1.duanyanRequired).toBe(false);
    expect(metricsOf(quiz).total).toBe(0);

    const assignment = reducer(quiz, {
      type: "save_unit_config",
      key: "a2",
      config: {
        ...quiz.configs.a2,
        title: "作业二标题已改",
      },
    });
    expect(assignment.configs.a2.title).toBe("作业二标题已改");
    expect(assignment.configs.a3.title).toBe(initialState.configs.a3.title);
    expect(assignment.configs.a4.title).toBe(initialState.configs.a4.title);
    expect(metricsOf(assignment).total).toBe(0);
  });

  it("空的配置不会写上，也不能靠配置关掉发布强制项", () => {
    const blank = reducer(initialState, {
      type: "save_unit_config",
      key: "a3",
      config: { ...initialState.configs.a3, title: "  " },
    });
    expect(blank.configs.a3.title).toBe(initialState.configs.a3.title);
    expect(blank.notice).toContain("填写");
    expect(blank.draft.requiredAttached).toBe(true);

    const draft = reducer(initialState, { type: "create_template" });
    const stripped = reducer(draft, { type: "strip_required" });
    const blocked = reducer(stripped, { type: "publish" });
    expect(blocked.notice).toContain("阻断");
    expect(blocked.draft.phase).not.toBe("published");
    expect(blocked.draft.requiredAttached).toBe(false);
    expect(metricsOf(blocked).total).toBe(0);
  });

  it("作业管理可以写评论并请修改，再通过；评论不计回流，也没有分数", () => {
    let state = run(q1Done);
    expect(state.units.q1.status).toBe("awaiting_feedback");
    const counted = metricsOf(state);

    state = reducer(state, {
      type: "redo_unit",
      unitId: "q1",
      comment: "请把结合和未结合写清楚。",
    });
    expect(state.units.q1.status).toBe("needs_revision");
    expect(state.units.q1.comment).toBe("请把结合和未结合写清楚。");
    expect(metricsOf(state)).toEqual(counted);
    expect(JSON.stringify(state.units.q1)).not.toMatch(/score|grade|分数/);

    const held = reducer(state, { type: "pass_unit", unitId: "q1", comment: "先不要过" });
    expect(held.units.q1.status).toBe("needs_revision");
    expect(held.units.q1.comment).toBe("请把结合和未结合写清楚。");

    state = run(
      [
        { type: "generate", unitId: "q1", outcome: "success" },
        { type: "return_unit", unitId: "q1" },
      ],
      state,
    );
    expect(state.units.q1.status).toBe("awaiting_feedback");
    expect(metricsOf(state)).toEqual(counted);

    state = reducer(state, {
      type: "pass_unit",
      unitId: "q1",
      comment: "边界清楚，可以通过。",
    });
    expect(state.units.q1.status).toBe("passed");
    expect(state.units.q1.comment).toBe("边界清楚，可以通过。");
    expect(state.notice).toContain("不是证书");
    expect(metricsOf(state)).toEqual(counted);
  });

  it("数据集按学员、单元、类型筛选，计数与 2.3 一致，且只读口径不因评论或配置变化", () => {
    let state = run(q1Done);
    state = reducer(state, {
      type: "save_unit_config",
      key: "q1",
      config: { ...state.configs.q1, notes: "配置不算一条轨迹。" },
    });
    state = reducer(state, { type: "redo_unit", unitId: "q1", comment: "评论不算回流。" });

    const metrics = metricsOf(state);
    expect(metrics).toMatchObject({ total: 2, returnExec: 1, optimize: 1, evaluate: 0, returnFollow: 0 });

    const rows = datasetRows(state);
    const countedRows = rows.filter((row) => row.counted);
    expect(countedRows).toHaveLength(metrics.total);
    expect(countedRows.map((row) => row.countType).sort()).toEqual(["optimize", "return_exec"]);
    expect(rows.some((row) => row.summary.includes("评论不算回流"))).toBe(false);
    expect(rows.some((row) => row.summary.includes("配置不算一条轨迹"))).toBe(false);
    expect(rows.some((row) => row.kind === "artifact" && row.artifact?.includes("活化信号"))).toBe(true);

    expect(filterDataset(rows, { student: "all", unitId: "all", countType: "optimize" }).map((row) => row.countType)).toEqual([
      "optimize",
    ]);
    expect(filterDataset(rows, { student: STUDENT_NAME, unitId: "q1", countType: "all" }).length).toBeGreaterThan(0);
    expect(filterDataset(rows, { student: "学员甲", unitId: "all", countType: "all" })).toEqual([]);
    expect(filterDataset(rows, { student: "all", unitId: "a2", countType: "all" })).toEqual([]);

    const read = reducer(initialState, { type: "read_lesson" });
    const checked = reducer(read, { type: "checkoff" });
    expect(datasetRows(checked)).toEqual([]);
    expect(metricsOf(checked).total).toBe(0);
  });
});
