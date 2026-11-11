import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { CourseProvider } from "./store";
import { Shell } from "./shell";
import { CLOSED_ID, COURSE_ID, paths } from "./domain/model";
import { CatalogPage } from "./pages/CatalogPage";
import { EnterPage } from "./pages/EnterPage";
import { CourseHomePage } from "./pages/CourseHomePage";
import { LessonPage } from "./pages/LessonPage";
import { QuizPage } from "./pages/QuizPage";
import { AssignmentPage } from "./pages/AssignmentPage";
import { StudioPage } from "./pages/StudioPage";
import { PeerPage } from "./pages/PeerPage";
import { TeacherView } from "./pages/TeacherView";
import { TeacherGate, WorkbenchLayout } from "./pages/teacher/WorkbenchLayout";
import { ConfigFormPage, ConfigListPage } from "./pages/teacher/ConfigPages";
import { AssignmentListPage, AssignmentReviewPage } from "./pages/teacher/AssignmentManagePage";
import { DatasetPage } from "./pages/teacher/DatasetPage";
import { RulesPage } from "./pages/teacher/RulesPage";

function CourseLayout() {
  const { courseId } = useParams();
  if (courseId === CLOSED_ID) {
    return (
      <p>
        这门课尚未开放，不能从这里上课。 <Link to={paths.catalog}>回课表</Link>
      </p>
    );
  }
  if (courseId !== COURSE_ID) return <p>没有这门课。</p>;
  return <Outlet />;
}

export function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
      <CourseProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<CatalogPage />} />
            <Route path="courses" element={<Navigate to="/" replace />} />
            <Route path="courses/:courseId" element={<CourseLayout />}>
              <Route index element={<CourseHomePage />} />
              <Route path="enter" element={<EnterPage />} />
              <Route path="lessons/1" element={<LessonPage />} />
              <Route path="quizzes/1" element={<QuizPage />} />
              <Route path="quizzes/1/feedback" element={<QuizPage />} />
              <Route path="assignments/:step" element={<AssignmentPage />} />
              <Route path="assignments/:step/feedback" element={<AssignmentPage />} />
              <Route path="studio" element={<StudioPage />} />
              <Route path="peer" element={<PeerPage />} />
              <Route path="teacher" element={<TeacherGate />}>
                <Route element={<WorkbenchLayout />}>
                  <Route index element={<TeacherView />} />
                  <Route path="config" element={<ConfigListPage />} />
                  <Route path="config/:key" element={<ConfigFormPage />} />
                  <Route path="assignments" element={<AssignmentListPage />} />
                  <Route path="assignments/:unitId" element={<AssignmentReviewPage />} />
                  <Route path="dataset" element={<DatasetPage />} />
                  <Route path="rules" element={<RulesPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CourseProvider>
    </BrowserRouter>
  );
}
