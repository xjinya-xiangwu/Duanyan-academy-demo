import { Link } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
import { LECTURE } from "../domain/content";
import { paths } from "../domain/model";
import { useCourse } from "../store";

export function LessonPage() {
  const { state, dispatch } = useCourse();
  return (
    <article className="reading">
      <CourseHeader current="教学课时" />
      <p className="kicker">① 教学课时</p>
      <h1>结合之后，活化信号怎么画</h1>
      <div className="lecture">
        {LECTURE.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="quiet">{state.lessonRead ? "这一课已标成读过。" : "读完可以做个记号。记号只表示你看过。"}</p>
      <div className="actions">
        <button type="button" data-testid="lesson-read" onClick={() => dispatch({ type: "read_lesson" })}>
          我读完了这一课
        </button>
        <Link to={paths.quiz}>下一节：测验 Q1</Link>
      </div>
    </article>
  );
}
