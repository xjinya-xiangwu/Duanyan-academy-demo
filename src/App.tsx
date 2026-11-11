import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDemo, DemoProvider } from "./store";
import { Shell } from "./shell";
import { CatalogPage, CoursePage, DuanyanPage, EnterPage, PracticePage, TeachPage } from "./pages/student";
import { AssignPage, ProgressPage, ReviewPage, TeacherCoursesPage, TemplatePage } from "./pages/teacher";
import { MetricsPage } from "./pages/metrics";

function Home() {
  const { state } = useDemo();
  if (state.role === "student") return <Navigate to="/catalog" replace />;
  return <Navigate to="/teacher/courses" replace />;
}

export function App() {
  return (
    <BrowserRouter basename="/Duanyan-academy-demo">
      <DemoProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/enter" element={<EnterPage />} />
            <Route path="/course" element={<CoursePage />} />
            <Route path="/lesson/teach/:step" element={<TeachPage />} />
            <Route path="/lesson/practice/:step" element={<PracticePage />} />
            <Route path="/duanyan" element={<DuanyanPage />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
            <Route path="/teacher/template" element={<TemplatePage />} />
            <Route path="/teacher/assign" element={<AssignPage />} />
            <Route path="/teacher/progress" element={<ProgressPage />} />
            <Route path="/teacher/review/:id" element={<ReviewPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  );
}
