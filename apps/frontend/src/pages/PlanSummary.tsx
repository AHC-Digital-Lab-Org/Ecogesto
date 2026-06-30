import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";
import { eur, kg, number } from "../lib/format";
import { Bars, Donut, ImpactDifficultyScatter, LineArea } from "../components/Charts";
import { MetricCard } from "../components/MetricCard";
import { Icon } from "../components/Icon";

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

export function PlanSummary() {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ["plan-summary", id], queryFn: () => api<PlanSummaryResponse>(`/planes/${id}/resumen`) });

  if (isLoading) {
    return (
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Resumen de impacto</h1>
        <div className="panel">Cargando resumen...</div>
      </section>
    );
  }
  if (error || !data) {
    return (
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Resumen de impacto</h1>
        <div className="error">No se pudo cargar el plan. Comprueba la sesión.</div>
      </section>
    );
  }
  const { plan, charts } = data;
  const difficultyAverage = plan.items.length
    ? Math.round(plan.items.reduce((sum, item) => {
        const score = item.ecogesture.dificultad === "muy fácil" ? 1 : item.ecogesture.dificultad === "fácil" ? 2 : item.ecogesture.dificultad === "moderada" ? 3 : 4;
        return sum + score;
      }, 0) / plan.items.length)
    : 0;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div>
          <h1>Resumen de impacto</h1>
          <p className="muted">Visualiza el impacto potencial de tu plan. Todo se recalcula con tu selección.</p>
        </div>
        <div className="action-row">
          <Link className="primary-button" to={`/planes/${plan.id}/informe`}><Icon name="description" /> Informe imprimible</Link>
          <Link className="ghost-button" to="/resultados/nuevo"><Icon name="edit_note" /> Registrar resultado</Link>
        </div>
      </div>

      <div className="summary-grid-5">
        <MetricCard label="EcoGestos" value={number(plan.items.length)} icon="eco" />
        <MetricCard label="CO2 / año" value={kg(plan.totalCo2)} icon="co2" />
        <MetricCard label="Agua / año" value={`${number(plan.totalAgua)} l`} icon="water_drop" tone="blue" />
        <MetricCard label="Inversión" value={eur(plan.totalCoste)} icon="payments" tone="ochre" />
        <MetricCard label="Dificultad media" value={difficultyAverage ? `${difficultyAverage}/4` : "0"} icon="speed" />
      </div>

      <div className="chart-grid">
        <div className="chart-panel"><h2>CO2 por categoría</h2><Bars data={charts.co2ByCategory} valueLabel="kg CO2e" /></div>
        <div className="chart-panel"><h2>Acciones por dificultad</h2><Donut data={charts.actionsByDifficulty} /></div>
        <div className="chart-panel"><h2>Impacto por plazo</h2><LineArea data={charts.impactByDeadline} /></div>
        <div className="chart-panel"><h2>Matriz impacto/dificultad</h2><ImpactDifficultyScatter data={charts.impactDifficulty} /></div>
        <div className="chart-panel">
          <h2>Ranking Top 10</h2>
          <table>
            <tbody>
              {charts.top10.map((item) => (
                <tr key={item.codigo}><td>{item.codigo}</td><td>{item.nombre}</td><td>{kg(item.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-panel">
        <table>
          <thead><tr><th>EcoGesto</th><th>Plazo</th><th>Prioridad</th><th>Frecuencia</th><th>Impacto</th><th>Estado</th></tr></thead>
          <tbody>
            {plan.items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.ecogesture.codigo}</strong><br />{item.ecogesture.nombre}</td>
                <td>{item.plazo}</td>
                <td>{item.prioridad}</td>
                <td>{item.frecuencia}</td>
                <td>{kg(item.impactoEstimado)}</td>
                <td>{item.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
