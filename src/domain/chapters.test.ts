import { describe, expect, it } from "vitest";
import { CHAPTERS, chapterReducer, emptyChapter } from "./chapters";
import { createInitialState, reducer } from "./logic";

describe("课程需求到端砚执行与 Prompt 重跑", () => {
  it("与课程大纲保持五章、23 个微课对应，每章都能独立准备并执行", () => {
    expect(CHAPTERS).toHaveLength(5); expect(CHAPTERS.reduce((count, chapter) => count + chapter.lessons.length, 0)).toBe(23);
    for (const chapter of CHAPTERS) {
      let state = chapterReducer(emptyChapter(), { type: "chapter_example", id: chapter.id });
      state = chapterReducer(state, { type: "chapter_prompt", id: chapter.id });
      expect(state.prompt).toContain(chapter.outcome);
      state = chapterReducer(state, { type: "chapter_execute", id: chapter.id });
      expect(state.runs).toHaveLength(1); expect(state.runs[0].result).toContain(chapter.example.need);
      expect(state.runs[0].returned).toBe(false);
    }
  });
  it("空需求或短任务不生成 Prompt，未准备完整 Prompt 不能执行", () => {
    expect(chapterReducer(emptyChapter(), { type: "chapter_prompt", id: "question" }).error).toContain("研究方向");
    expect(chapterReducer(emptyChapter(), { type: "chapter_execute", id: "question" }).runs).toHaveLength(0);
    const state = chapterReducer(emptyChapter(), { type: "chapter_brief", id: "question", brief: { topic: "材料合成", stage: "选题", need: "太短", materials: "", success: "形成可验证的科学问题" } });
    expect(chapterReducer(state, { type: "chapter_prompt", id: "question" }).error).toContain("至少 10");
  });
  it("自定义研究输入贯穿 Prompt 与结果，不被 PD-1 样例覆盖", () => {
    let state = chapterReducer(emptyChapter(), { type: "chapter_brief", id: "question", brief: { topic: "可降解高分子材料", stage: "开题与选题", need: "比较不同湿度条件对降解速率的影响，先定义可检验问题。", materials: "尚无实验数据", success: "说明变量、控制条件和验证方法" } });
    state = chapterReducer(state, { type: "chapter_prompt", id: "question" });
    state = chapterReducer(state, { type: "chapter_execute", id: "question" });
    expect(state.runs[0].prompt).toContain("可降解高分子材料"); expect(state.runs[0].result).not.toContain("PD-1");
    expect(state.runs[0].result).toContain("尚无实验数据");
  });
  it("返回结果后重跑带入完整旧任务、上一版结果及修改要求，保留旧版", () => {
    let state = chapterReducer(emptyChapter(), { type: "chapter_example", id: "evidence" });
    for (const type of ["chapter_prompt", "chapter_execute", "chapter_return"] as const) state = chapterReducer(state, { type, id: "evidence" });
    const original = structuredClone(state.runs[0]);
    state = chapterReducer(state, { type: "chapter_rerun", id: "evidence", instruction: "请收窄到一个主张，明确列出待核实来源。" });
    expect(state.prompt).toContain(original.result); expect(state.prompt).toContain(original.prompt);
    state = chapterReducer(state, { type: "chapter_execute", id: "evidence" });
    expect(state.runs[1].previousRunId).toBe(original.id); expect(state.runs[1].version).toBe(2);
    expect(state.runs[1].result).toContain("请收窄到一个主张"); expect(state.runs[0]).toEqual(original);
  });
  it("修改原始输入即废弃旧 Prompt，执行失败保留旧结果且可以重试", () => {
    let state = chapterReducer(emptyChapter(), { type: "chapter_example", id: "analysis" });
    state = chapterReducer(state, { type: "chapter_prompt", id: "analysis" });
    state = chapterReducer(state, { type: "chapter_fail", id: "analysis" });
    state = chapterReducer(state, { type: "chapter_execute", id: "analysis" }); expect(state.error).toContain("失败"); expect(state.runs).toHaveLength(0);
    state = chapterReducer(state, { type: "chapter_execute", id: "analysis" }); expect(state.runs).toHaveLength(1);
    state = chapterReducer(state, { type: "chapter_brief", id: "analysis", brief: { ...state.brief, need: "改变了本次分析的任务目标" } });
    expect(state.prompt).toBe(""); expect(state.generatedBrief).toBeNull(); expect(state.runs).toHaveLength(1);
  });
  it("多轮只带根任务与紧邻上一版结果，避免递归叠加所有旧 Prompt", () => {
    let state = chapterReducer(emptyChapter(), { type: "chapter_example", id: "question" });
    for (const type of ["chapter_prompt", "chapter_execute", "chapter_return"] as const) state = chapterReducer(state, { type, id: "question" });
    const root = state.runs[0].prompt;
    for (let i = 0; i < 3; i++) {
      state = chapterReducer(state, { type: "chapter_rerun", id: "question", instruction: "请补充研究的验证条件与失败边界。" });
      expect(state.prompt.split("【上一版结果｜")).toHaveLength(2);
      state = chapterReducer(state, { type: "chapter_execute", id: "question" }); state = chapterReducer(state, { type: "chapter_return", id: "question" });
      expect(state.runs.at(-1)?.rootPrompt).toBe(root);
    }
  });
  it("刷新只读取已有 run，不重复执行；保存必须先取回；教师不能代学生执行", () => {
    let state = reducer(createInitialState(), { type: "chapter_example", id: "skill" });
    state = reducer(state, { type: "chapter_prompt", id: "skill" }); state = reducer(state, { type: "chapter_execute", id: "skill" });
    expect(JSON.parse(JSON.stringify(state)).chapters.skill.runs).toHaveLength(1);
    expect(reducer(state, { type: "chapter_save", id: "skill" }).chapters.skill.runs[0].saved).toBe(false);
    const teacher = reducer(state, { type: "role", role: "teacher" }); expect(reducer(teacher, { type: "chapter_execute", id: "skill" }).chapters.skill.runs).toHaveLength(1);
  });
});
