import { Link } from "react-router-dom";
import { COURSE_TITLE, paths } from "../domain/model";
import { useCourse } from "../store";

export function CourseHeader({ current }: { current?: string }) {
  const { state } = useCourse();
  return (
    <div className="course-head">
      <p className="crumb">
        <Link to={paths.catalog}>课程</Link>
        <span aria-hidden="true"> / </span>
        <Link to={paths.course}>{COURSE_TITLE}</Link>
        {current ? (
          <>
            <span aria-hidden="true"> / </span>
            <span>{current}</span>
          </>
        ) : null}
      </p>
      {state.role === "teacher" ? (
        <p className="teacher-jump">
          <Link to={paths.teacher} data-testid="teacher-view-link">
            教师工作台
          </Link>
          <Link to={paths.course}>返回课页</Link>
        </p>
      ) : null}
    </div>
  );
}
