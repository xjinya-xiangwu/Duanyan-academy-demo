import { Link, NavLink, Outlet } from "react-router-dom";
import { COURSE_TITLE, paths } from "../../domain/model";
import { useCourse } from "../../store";

export function TeacherGate() {
  const { state } = useCourse();
  if (state.role === "student") {
    return (
      <article>
        <h1>教师工作台</h1>
        <p>当前是学员。学员从课程大纲上课。要看配置、批改和数据集，请在页脚换成老师。</p>
        <p>
          <Link to={paths.course}>回这门课</Link>
        </p>
      </article>
    );
  }
  return <Outlet />;
}

export function WorkbenchLayout() {
  return (
    <div className="workbench" data-testid="workbench">
      <aside className="workbench-nav">
        <p className="kicker">本课</p>
        <p className="workbench-course">{COURSE_TITLE}</p>
        <nav aria-label="教师工作台">
          <NavLink to={paths.teacher} end data-testid="teacher-view-link">
            概览
          </NavLink>
          <NavLink to={paths.teacherConfig}>环节配置</NavLink>
          <NavLink to={paths.teacherAssignments}>作业管理</NavLink>
          <NavLink to={paths.teacherDataset}>回流数据集</NavLink>
          <Link to={`${paths.teacher}#publish`}>布置与发布</Link>
          <Link to={`${paths.teacher}#progress`}>班级进度</Link>
        </nav>
        <p className="side-link">
          <NavLink to={paths.teacherRules} data-testid="reflux-rules-link">
            回流说明
          </NavLink>
        </p>
      </aside>
      <div className="workbench-main">
        <Outlet />
      </div>
    </div>
  );
}
