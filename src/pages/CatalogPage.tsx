import { useState } from "react";
import { Link } from "react-router-dom";
import { CLOSED_TITLE, COURSE_TITLE, TEACHER_NAME, paths } from "../domain/model";
import { useCourse } from "../store";

export function CatalogPage() {
  const { state } = useCourse();
  const [closedNote, setClosedNote] = useState("");
  const teacher = state.role === "teacher";

  return (
    <section className="catalog">
      <p className="kicker">端砚学院</p>
      <h1>课程</h1>
      <p className="lede">本学期可以进入的课。先选课，再按大纲学完。</p>
      <div className="catalog-grid">
        <article className="course-card">
          <div className="cover" aria-hidden="true">
            <span>生医</span>
            <strong>开课中</strong>
          </div>
          <p className="meta">状态：开课中</p>
          <h2>{COURSE_TITLE}</h2>
          <p>教师：{TEACHER_NAME}</p>
          <p>从受体结合这一张图出发，写成问题、一段论文和同一课题的示意图。</p>
          <Link to={paths.course} data-testid="catalog-course">
            进入课程
          </Link>
          <Link to={paths.enter} className="text-link" data-testid="catalog-enter">
            用邀请码进入
          </Link>
        </article>
        <article className="course-card is-closed">
          <div className="cover cover-closed" aria-hidden="true">
            <span>生医</span>
            <strong>未开放</strong>
          </div>
          <p className="meta">状态：未开放</p>
          <h2>{CLOSED_TITLE}</h2>
          <p>教师：{TEACHER_NAME}</p>
          <p>这门课还没有开放，不能从这里上课。</p>
          <button type="button" data-testid="catalog-locked" onClick={() => setClosedNote("这门课尚未开放，不能从这里上课。")}>
            尚未开放
          </button>
          {closedNote ? <p data-testid="catalog-block">{closedNote}</p> : null}
        </article>
      </div>
      {teacher ? <p className="quiet">教师视图在课程里面，不在这张课表上。</p> : null}
    </section>
  );
}
