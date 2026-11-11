import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { FailureKind, Role } from "./domain/model";
import { paths } from "./domain/model";
import { useCourse } from "./store";

const ROLES: { id: Role; label: string }[] = [
  { id: "student", label: "学员" },
  { id: "teacher", label: "老师" },
  { id: "reviewer", label: "评审" },
];

const ARMS: { id: FailureKind; label: string }[] = [
  { id: "generate", label: "下一次生成按失败" },
  { id: "optimize", label: "下一次优化按失败" },
  { id: "evaluate", label: "下一次评估按失败" },
];

export function Shell() {
  const { state, dispatch } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const onTeacherRoute = location.pathname.includes("/teacher");

  function chooseRole(role: Role) {
    dispatch({ type: "set_role", role: role });
    if (role === "student") {
      if (onTeacherRoute) navigate(paths.course);
      return;
    }
    navigate(paths.teacher);
  }

  return (
    <div className="app">
      <header className="mast">
        <Link to={paths.catalog} className="brand">
          端砚学院
        </Link>
        <span>课程</span>
      </header>
      <div className={onTeacherRoute ? "wrap wrap-wide" : "wrap"}>
        {state.notice ? (
          <p className="note" role="status" data-testid="notice">
            {state.notice}
          </p>
        ) : null}
        <main>
          <Outlet />
        </main>
      </div>
      <footer>
        <p data-testid="mock-footer">演示／Mock。前端预览，不是生产环境，轨迹只留在这次预览里。</p>
        <div className="roles" role="group" aria-label="切换身份">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              data-testid={`role-${role.id}`}
              aria-pressed={state.role === role.id}
              onClick={() => chooseRole(role.id)}
            >
              {role.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-testid="reset-demo"
          onClick={() => {
            dispatch({ type: "reset" });
            navigate(paths.catalog);
          }}
        >
          重置本课进度
        </button>
        <details>
          <summary>异常情况</summary>
          <div className="actions">
            {ARMS.map((arm) => (
              <button
                key={arm.id}
                type="button"
                data-testid={`arm-${arm.id}`}
                onClick={() => dispatch({ type: "arm_failure", kind: arm.id })}
              >
                {arm.label}
              </button>
            ))}
          </div>
        </details>
      </footer>
    </div>
  );
}
