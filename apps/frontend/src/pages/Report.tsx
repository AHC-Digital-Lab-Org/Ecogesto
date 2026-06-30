import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";
import { eur, kg, number } from "../lib/format";
import { Bars, Donut, ImpactDifficultyScatter, LineArea } from "../components/Charts";
import { Logo } from "../components/Logo";

type PlanSummaryResponse = {
  plan: Plan;
  charts: {
    co2ByCategory: Array<{ name: string; value: number }>;
    actionsByDifficulty: Array<{ name: string; value: number }>;
    impactByDeadline: Array<{ name: string; value: number }>;
    impactDifficulty: Array<{
      codigo: string;
      nombre: string;
      dificultad: string;
      dificultadScore: number;
      impacto: number;
      coste: string;
      costeScore: number;
    }>;
    top10: Array<{ codigo: string; nombre: string; value: number }>;
  };
};

export function Report() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["report", id], queryFn: () => api<PlanSummaryResponse>(`/planes/${id}/resumen`) });
  if (isLoading || !data) {
    return (
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Informe EcoGestos AHC</h1>
        <div className="panel">Preparando informe...</div>
      </section>
    );
  }
  const { plan, charts } = data;

  return (
    <article className="report section" style={{ marginTop: 0 }}>
      <section className="report-cover">
        <Logo />
        <span className="eyebrow">Informe imprimible EcoGestos AHC</span>
        <h1>{plan.nombre}</h1>
        <p>{plan.objetivo}</p>
        <div className="pill-row">
          <span>Alias: {plan.user?.alias || "demo"}</span>
          <span>{new Date(plan.fechaCreacion).toLocaleDateString("es-ES")}</span>
          <span>{plan.items.length} EcoGestos</span>
        </div>
      </section>

      <section className="section">
        <h2>Resumen ejecutivo</h2>
        <div className="metric-grid">
          <div className="metric-card"><strong>{kg(plan.totalCo2)}</strong><span>CO2 estimado</span></div>
          <div className="metric-card"><strong>{number(plan.totalAgua)} l</strong><span>Agua estimada</span></div>
          <div className="metric-card"><strong>{number(plan.totalPlastico, 1)} kg</strong><span>Plástico estimado</span></div>
          <div className="metric-card"><strong>{eur(plan.totalCoste)}</strong><span>Coste inicial</span></div>
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-panel"><h2>CO2 por categoría</h2><Bars data={charts.co2ByCategory} /></div>
        <div className="chart-panel"><h2>Distribución por dificultad</h2><Donut data={charts.actionsByDifficulty} /></div>
        <div className="chart-panel"><h2>Impacto acumulado por plazo</h2><LineArea data={charts.impactByDeadline} /></div>
        <div className="chart-panel"><h2>Matriz impacto/dificultad</h2><ImpactDifficultyScatter data={charts.impactDifficulty} /></div>
      </section>

      <section className="section">
        <h2>Plan priorizado y calendario</h2>
        <div className="table-panel">
          <table>
            <thead><tr><th>EcoGesto</th><th>Pasos</th><th>Plazo</th><th>Evidencia</th><th>Moodle</th></tr></thead>
            <tbody>
              {plan.items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.ecogesture.codigo}</strong><br />{item.ecogesture.nombre}<br />{kg(item.impactoEstimado)}</td>
                  <td>{item.ecogesture.steps?.slice(0, 2).map((step) => step.descripcion).join(" ") || item.ecogesture.resumen}</td>
                  <td>{item.plazo}</td>
                  <td>Registrar evidencia en app o Moodle</td>
                  <td>{item.ecogesture.moodleLink?.syncStatus || "pendiente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="notice">
        <strong>Disclaimer metodológico.</strong> Los impactos son estimaciones orientativas basadas en fuentes y supuestos indicados en cada ficha.
        Los indicadores de CO2, agua, plástico y euros se muestran por separado y no deben interpretarse como equivalentes directos.
      </section>
    </article>
  );
}
