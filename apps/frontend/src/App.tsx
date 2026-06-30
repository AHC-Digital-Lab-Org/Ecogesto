import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminEcoGestos } from "./pages/AdminEcoGestos";
import { AdminCalculations } from "./pages/AdminCalculations";
import { AdminRoutes } from "./pages/AdminRoutes";
import { Catalog } from "./pages/Catalog";
import { Dashboard } from "./pages/Dashboard";
import { Detail } from "./pages/Detail";
import { Landing } from "./pages/Landing";
import { PlanBuilder } from "./pages/PlanBuilder";
import { PlanSummary } from "./pages/PlanSummary";
import { Progress } from "./pages/Progress";
import { Recognition } from "./pages/Recognition";
import { Report } from "./pages/Report";
import { ResultForm } from "./pages/ResultForm";
import { Tutoring } from "./pages/Tutoring";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="ecogestos/:id" element={<Detail />} />
        <Route path="plan" element={<PlanBuilder />} />
        <Route path="planes/:id" element={<PlanSummary />} />
        <Route path="planes/:id/informe" element={<Report />} />
        <Route path="progreso" element={<Progress />} />
        <Route path="reconocimientos" element={<Recognition />} />
        <Route path="resultados/nuevo" element={<ResultForm />} />
        <Route path="tutoria" element={<Tutoring />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin/calculos" element={<AdminCalculations />} />
        <Route path="admin/ecogestos" element={<AdminEcoGestos />} />
        <Route path="admin/ecorrecorridos" element={<AdminRoutes />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
