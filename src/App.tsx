import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { DemoProvider } from "./store";
import { Shell } from "./shell";
import { CatalogPage, CoursePage, EnterPage, LessonPage, UnitPage } from "./pages/student";
import { StudioPage } from "./pages/studio";
import { TeacherPage, ReviewPage } from "./pages/teacher";
import { MetricsPage } from "./pages/metrics";
export function App() {
  return <HashRouter><DemoProvider><Routes><Route element={<Shell />}>
    <Route path="/" element={<Navigate to="/course" replace />} />
    <Route path="/courses" element={<CatalogPage />} />
    <Route path="/enter" element={<EnterPage />} />
    <Route path="/course" element={<CoursePage />} />
    <Route path="/course/unit/lesson" element={<LessonPage />} />
    <Route path="/course/unit/:unit" element={<UnitPage />} />
    <Route path="/course/studio/:unit" element={<StudioPage />} />
    <Route path="/course/teacher" element={<TeacherPage />} />
    <Route path="/course/review/:unit" element={<ReviewPage />} />
    <Route path="/course/evidence" element={<MetricsPage />} />
    <Route path="*" element={<Navigate to="/course" replace />} />
  </Route></Routes></DemoProvider></HashRouter>;
}
