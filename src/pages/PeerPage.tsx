import { Link } from "react-router-dom";
import { CourseHeader } from "../components/CourseHeader";
import { paths } from "../domain/model";

export function PeerPage() {
  return (
    <article className="reading">
      <CourseHeader current="可选互评" />
      <p className="kicker">⑤ 可选</p>
      <h1>同学互看</h1>
      <p>如果作业都交了，可以请同学看一眼问题界定和图注是否还停在同一课题上。</p>
      <p>这一轮只把安排放在大纲里。没有互评操作，也不计完成。</p>
      <p>
        <Link to={paths.course}>回课程大纲</Link>
      </p>
    </article>
  );
}
