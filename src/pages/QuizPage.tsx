import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfiguredCopy } from "../components/ConfiguredCopy";
import { CourseHeader } from "../components/CourseHeader";
import { Feedback, ReturnedWork } from "../components/Feedback";
import { TOPIC_TITLE, paths } from "../domain/model";
import { useCourse } from "../store";

const QUESTIONS = [
  {
    id: "signal",
    prompt: "PD-1 与 PD-L1 结合后，示意图上的活化信号应画成？",
    options: ["增强", "减弱", "保持不变"],
  },
  {
    id: "bound",
    prompt: "这张图可以支持哪一种说法？",
    options: ["只比较结合与未结合", "可以写出临床有效率", "可以替代患者记录"],
  },
] as const;

export function QuizPage() {
  const { state } = useCourse();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const locked = state.units.q1.status === "passed";

  return (
    <article>
      <CourseHeader current="测验 Q1" />
      <p className="kicker">课内测验</p>
      <h1 data-testid="configured-title">{state.configs.q1.title}</h1>
      <p>课题：{TOPIC_TITLE}</p>
      <ConfiguredCopy configKey="q1" />
      <p>下面两题帮助你回忆讲义。它们不计回流，也不代替后面的作业。</p>
      {QUESTIONS.map((question, index) => (
        <fieldset key={question.id} className="question">
          <legend>
            {index + 1}. {question.prompt}
          </legend>
          {question.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={picked[question.id] === option}
                onChange={() => setPicked((current) => ({ ...current, [question.id]: option }))}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ))}
      <section className="practice">
        <h2>短实训</h2>
        <ReturnedWork unitId="q1" />
        {locked ? null : (
          <Link className="go" to={paths.studio("q1")} data-testid="open-duanyan">
            在端砚中完成（演示）
          </Link>
        )}
      </section>
      {state.role === "teacher" ? <Feedback unitId="q1" /> : null}
      <p className="actions">
        <Link to={paths.assignment(2)}>下一节：作业 ②</Link>
      </p>
    </article>
  );
}
