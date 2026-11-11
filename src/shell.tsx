import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { isPracticeId } from "./domain/content";
import { latestSubmission, type Role } from "./domain/logic";
import { useDemo } from "./store";
import { Icon, InkLogo } from "./components/icons";
export function Shell() {
  const { state, dispatch } = useDemo();
  const location = useLocation(), navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    if (!state.notice) return;
    const timer = setTimeout(() => dispatch({ type: "clear_notice" }), state.notice.tone === "error" ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [state.notice, dispatch]);
  function switchRole(role: Role) {
    dispatch({ type: "role", role });
    const match = location.pathname.match(/\/(?:unit|studio|review)\/(q1|a1|a2|a3)/);
    const unit = match?.[1];
    if (role === "teacher") navigate(unit && isPracticeId(unit) && latestSubmission(state, unit) ? "/course/review/" + unit : "/course/teacher");
    else navigate(unit && isPracticeId(unit) ? "/course/unit/" + unit : "/course");
  }
  const teacher = state.role === "teacher";
  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); }}>跳到主要内容</a>
    <header className="site-header"><div className="header-inner">
      <Link to="/course" className="brand" aria-label="端砚学院，课程首页"><InkLogo /><span>端砚学院<span className="brand-en">DUANYAN ACADEMY</span></span></Link>
      <nav className="primary-navigation" aria-label="主导航"><NavLink to="/courses">课程</NavLink><NavLink to="/course" end>当前课程</NavLink></nav>
      <div className="header-account"><button type="button" className="view-switch" data-testid={teacher ? "role-student" : "role-teacher"} onClick={() => switchRole(teacher ? "student" : "teacher")}><Icon name={teacher ? "book" : "users"} size={16} />{teacher ? "以学员查看" : "教师视图"}</button><span className="account-divider" /><span className="avatar avatar-small">{teacher ? "周" : "林"}</span><span className="account-name">{teacher ? "周衡" : "林可"}</span></div>
    </div></header>
    <main id="main-content" ref={mainRef} tabIndex={-1}><Outlet /></main>
    <footer className="site-footer"><div className="footer-inner"><div className="footer-brand"><InkLogo /><span>让研究，从实践开始。</span></div><p>前端演示 · 课程、产物与轨迹为 Mock；未连接真实模型或端砚服务。</p><div className="footer-actions"><Link to="/enter">校验入课</Link><button type="button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()}><Icon name="fullscreen" size={14} />全屏</button><details className="demo-settings"><summary>演示设置<Icon name="down" size={12} /></summary><div className="settings-popover"><strong>演示数据</strong><p>进度仅保存在当前浏览器。</p><button type="button" onClick={() => dispatch({ type: "load_sample" })}>补齐完整提交样例</button><button data-testid="reset-demo" type="button" onClick={() => { if (window.confirm("重置当前浏览器中的课程演示进度？")) { dispatch({ type: "reset" }); navigate("/course"); } }}>重置课程进度</button><button type="button" onClick={() => switchRole(teacher ? "student" : "teacher")}>{teacher ? "切回学员" : "切换教师视图"}</button></div></details></div></div></footer>
    {state.notice && <div className={"toast toast-" + state.notice.tone} role={state.notice.tone === "error" ? "alert" : "status"} data-testid="notice"><Icon name={state.notice.tone === "error" ? "info" : state.notice.tone === "success" ? "check" : "info"} size={19} /><span>{state.notice.message}</span><button aria-label="关闭提示" onClick={() => dispatch({ type: "clear_notice" })}><Icon name="close" size={16} /></button></div>}
  </div>;
}
