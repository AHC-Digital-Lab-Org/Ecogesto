import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { kg, number } from "../lib/format";
import { Bars, Donut } from "../components/Charts";
import { MetricCard } from "../components/MetricCard";
import { Icon } from "../components/Icon";

type DashboardData = {
  kpis: {
    ecogestosPublicados: number;
    ecogestosSeleccionados: number;
    planesCreados: number;
    kgCo2Estimados: number;
    kgCo2Registrados: number;
    tasaFinalizacionMoodle: number;
    insigniasEmitidas: number;
    canjesSolicitados: number;
    calidadDatos: number;
    topCategorias: Array<{ name: string; value: number; impact: number }>;
  };
  charts: { topCategories: Array<{ name: string; value: number; impact: number }> };
};

export function Dashboard() {
  const { data, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/admin/dashboard") });
  if (error) return <div className="error">Entra como demo-ahc para ver el dashboard interno.</div>;
  if (!data) return <div className="panel">Cargando dashboard...</div>;
  const k = data.kpis;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div><span className="eyebrow">Cuadro de mando</span><h1>Impacto y gobierno del dato</h1></div>
        <Link className="ghost-button" to="/admin/calculos"><Icon name="functions" /> Cálculos</Link>
      </div>
      <div className="metric-grid">
        <MetricCard label="EcoGestos publicados" value={number(k.ecogestosPublicados)} icon="published_with_changes" />
        <MetricCard label="Seleccionados en planes" value={number(k.ecogestosSeleccionados)} icon="playlist_add_check" />
        <MetricCard label="Planes creados" value={number(k.planesCreados)} icon="assignment" />
        <MetricCard label="CO2 estimado" value={kg(k.kgCo2Estimados)} icon="co2" />
        <MetricCard label="CO2 registrado" value={kg(k.kgCo2Registrados)} icon="verified" />
        <MetricCard label="Finalización Moodle" value={`${k.tasaFinalizacionMoodle}%`} icon="school" />
        <MetricCard label="Insignias emitidas" value={number(k.insigniasEmitidas)} icon="workspace_premium" />
        <MetricCard label="Canjes solicitados" value={number(k.canjesSolicitados)} icon="redeem" />
        <MetricCard label="Calidad de datos" value={`${k.calidadDatos}%`} icon="fact_check" />
      </div>
      <div className="chart-grid">
        <div className="chart-panel"><h2>Top categorías por adopción</h2><Bars data={data.charts.topCategories.map((item) => ({ name: item.name, value: item.value }))} /></div>
        <div className="chart-panel"><h2>Impacto base por categoría</h2><Donut data={data.charts.topCategories.map((item) => ({ name: item.name, value: Math.round(item.impact) }))} /></div>
      </div>
    </section>
  );
}
