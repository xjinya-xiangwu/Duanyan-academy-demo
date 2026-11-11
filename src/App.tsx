import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AssignmentPage } from "./pages/AssignmentPage";
import { CoursePage } from "./pages/CoursePage";
import { DuanyanPage } from "./pages/DuanyanPage";
import { MetricsPage } from "./pages/MetricsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { TaskPage } from "./pages/TaskPage";

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Navigate to="/course" replace />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/duanyan" element={<DuanyanPage />} />
        <Route path="/assignment" element={<AssignmentPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="*" element={<Navigate to="/course" replace />} />
      </Route>
    </Routes>
  );
}
