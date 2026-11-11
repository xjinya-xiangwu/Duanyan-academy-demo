import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { failureLabel, metricTotal } from "../domain/labels";
import type { FailureKind } from "../domain/types";
import { useStore } from "../store";
import { MockTag } from "./MockTag";

const STUDENT_LINKS = [
  { to: "/course", label: "课程内容" },
  { to: "/task", label: "课堂任务实训" },
  { to: "/duanyan", label: "端砚执行" },
  { to: "/assignment", label: "课内作业位" },
];

function roleOf(pathname: string): "student" | "teacher" | "board" {
  if (pathname.startsWith("/review")) return "teacher";
  if (pathname.startsWith("/metrics")) return "board";
  return "student";
}

export function Shell() {
  const { state, dispatch } = useStore();
  const { pathname } = useLocation();
  const role = roleOf(pathname);
  const [confirmReset, setConfirmReset] = useState(false);
  const total = metricTotal(state.metrics);

  function arm(kind: FailureKind) {
    dispatch({ type: "arm_failure", kind });
  }

  return (
    <div className="app">
      <p className="demo-banner">
        演示／Mock · 前端预览 · 未接入端砚客户端、后端或轨迹入库
      </p>
      <header className="topbar">
        <div>
          <p className="eyebrow">课＋实训 MVP</p>
          <strong>同一生医课题的 3 阶段引导</strong>
        </div>
        <nav className="roles" aria-label="视图切换">
          <NavLink
            to="/course"
            className={role === "student" ? "active" : undefined}
            aria-current={role === "student" ? "page" : undefined}
          >
            学生
          </NavLink>
          <NavLink
            to="/review"
            className={role === "teacher" ? "active" : undefined}
            aria-current={role === "teacher" ? "page" : undefined}
          >
            老师
          </NavLink>
          <NavLink
            to="/metrics"
            className={role === "board" ? "active" : undefined}
            aria-current={role === "board" ? "page" : undefined}
          >
            看板
          </NavLink>
        </nav>
        <NavLink to="/metrics" className="metric-pill" data-testid="metric-pill" aria-live="polite">
          回流 {total}
          <MockTag />
        </NavLink>
      </header>
      {role === "student" ? (
        <nav className="subnav" aria-label="学生页面">
          {STUDENT_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {link.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
      {state.notice ? (
        <p className={`notice notice-${state.notice.tone}`} role="status" data-testid="notice">
          <span>{state.notice.text}</span>
          <button type="button" onClick={() => dispatch({ type: "dismiss_notice" })}>
            关闭
          </button>
        </p>
      ) : null}
      <main>
        <Outlet />
      </main>
      <footer className="demo-controls">
        <div>
          <strong>异常演示</strong>
          <MockTag />
          <p>武装后，下一次对应操作会失败。重试前会自动取消这次武装。</p>
          {state.armedFailure ? (
            <p data-testid="armed-failure">已武装：下一次{failureLabel(state.armedFailure)}失败</p>
          ) : (
            <p data-testid="armed-failure">当前没有武装失败</p>
          )}
        </div>
        <div className="control-row">
          <button type="button" data-testid="arm-generate" onClick={() => arm("generate")}>
            模拟下一次生成失败
          </button>
          <button type="button" data-testid="arm-optimize" onClick={() => arm("optimize")}>
            模拟下一次优化失败
          </button>
          <button type="button" data-testid="arm-evaluate" onClick={() => arm("evaluate")}>
            模拟下一次评估失败
          </button>
          {confirmReset ? (
            <>
              <button
                type="button"
                className="danger"
                data-testid="confirm-reset"
                onClick={() => {
                  dispatch({ type: "reset" });
                  setConfirmReset(false);
                }}
              >
                确认清空演示数据
              </button>
              <button type="button" onClick={() => setConfirmReset(false)}>
                取消
              </button>
            </>
          ) : (
            <button type="button" data-testid="reset-demo" onClick={() => setConfirmReset(true)}>
              重置演示数据
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
