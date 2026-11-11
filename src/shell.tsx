import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { copy, type Role } from "./domain/logic";
import { useDemo } from "./store";

const ROLES: { id: Role; label: string }[] = [
  { id: "student", label: "学生" },
  { id: "teacher", label: "老师" },
  { id: "reviewer", label: "评审" },
];

export function MockTag() {
  return <span className="tag">演示／Mock</span>;
}

export function Shell() {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();

  function choose(role: Role) {
    dispatch({ type: "set_role", role });
    navigate(role === "student" ? "/catalog" : "/teacher/courses");
  }

  function reset() {
    dispatch({ type: "reset" });
    navigate("/catalog");
  }

  const student = state.role === "student";
  const reviewer = state.role === "reviewer";

  return (
    <div className="app">
      <p className="banner">{copy.banner}</p>
      <header className="top">
        <div>
          <p className="eyebrow">课壳 ＋ 轻量 LMS ＋ 端砚薄入口</p>
          <strong className="brand">生医示例课 Demo</strong>
        </div>
        <div className="roles" role="group" aria-label="角色切换">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              data-testid={`role-${role.id}`}
              aria-pressed={state.role === role.id}
              onClick={() => choose(role.id)}
            >
              {role.label}
            </button>
          ))}
        </div>
      </header>
      <nav className="nav" aria-label="页面">
        {(student || reviewer) && (
          <NavLink to="/catalog" data-testid="nav-catalog">
            课表
          </NavLink>
        )}
        {student && (
          <NavLink to="/course" data-testid="nav-course">
            课首页
          </NavLink>
        )}
        {!student && (
          <>
            <NavLink to="/teacher/courses">我的课</NavLink>
            <NavLink to="/teacher/template">选用模板</NavLink>
            <NavLink to="/teacher/assign">布置与发布</NavLink>
            <NavLink to="/teacher/progress">班级进度</NavLink>
            <NavLink to="/teacher/review/lin-ke">抽检</NavLink>
            <NavLink to="/metrics" data-testid="nav-metrics">
              看板
            </NavLink>
          </>
        )}
      </nav>
      <p className="notice" role="status" data-testid="notice">
        {state.notice ?? ""}
      </p>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>「打开端砚（演示）」只在本站切到薄执行页。没有登录，没有后端，没有真实客户端跳转。</p>
        <button type="button" data-testid="reset-demo" onClick={reset}>
          重置演示数据
        </button>
      </footer>
    </div>
  );
}
