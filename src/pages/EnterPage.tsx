import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
import { INVITE_CODE, ROSTER, paths } from "../domain/model";
import { useCourse } from "../store";

export function EnterPage() {
  const { dispatch } = useCourse();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    return () => {
      dispatch({ type: "clear_notice" });
    };
  }, [dispatch]);

  return (
    <article className="sheet">
      <CourseHeader current="邀请码" />
      <h1>进入这门课</h1>
      <p>这门课已经可以上。这里用来试一次邀请码或名单：有效就进入，无效会停在这一页。</p>
      <p className="fine">
        本课邀请码：<span data-testid="invite-code">{INVITE_CODE}</span>
      </p>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "try_invite", code });
          if (code.trim() === INVITE_CODE) navigate(paths.course);
        }}
      >
        <label htmlFor="invite-code-input">邀请码</label>
        <input
          id="invite-code-input"
          data-testid="invite-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <button type="submit" data-testid="invite-submit">
          用邀请码进入
        </button>
      </form>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "try_roster", name });
          if ((ROSTER as readonly string[]).includes(name.trim())) navigate(paths.course);
        }}
      >
        <label htmlFor="roster-name">名单中的姓名</label>
        <input
          id="roster-name"
          data-testid="roster-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" data-testid="roster-submit">
          用姓名进入
        </button>
      </form>
    </article>
  );
}
