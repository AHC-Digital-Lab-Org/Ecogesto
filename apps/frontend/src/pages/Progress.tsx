import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";
import { kg } from "../lib/format";
import { MetricCard } from "../components/MetricCard";
import { Icon } from "../components/Icon";

type Result = {
  id: string;
  valor: number;
  unidad: string;
  co2Real: number;
  validacionEstado: string;
  fechaFin?: string;
  ecogesture: { codigo: string; nombre: string; category: { nombre: string } };
};

export function Progress() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: () => api<Plan[]>("/planes") });
  const results = useQuery({ queryKey: ["results"], queryFn: () => api<Result[]>("/resultados") });
  const allPlans = plans.data || [];
  const allResults = results.data || [];
  const selected = allPlans.reduce((sum, plan) => sum + plan.items.length, 0);
  const real = allResults.reduce((sum, result) => sum + result.co2Real, 0);
  const estimated = allPlans.reduce((sum, plan) => sum + plan.totalCo2, 0);

  if (plans.error || results.error) {
    return <div className="error">Entra con alias para ver tu progreso personal.</div>;
  }

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div><span className="eyebrow">Mis EcoGestos</span><h1>Progreso personal</h1></div>
        <Link className="primary-button" to="/resultados/nuevo"><Icon name="edit_note" /> Registrar resultado</Link>
      </div>
      <div className="metric-grid">
        <MetricCard label="Planes creados" value={String(allPlans.length)} icon="assignment" />
        <MetricCard label="EcoGestos seleccionados" value={String(selected)} icon="playlist_add_check" />
        <MetricCard label="CO2 estimado" value={kg(estimated)} icon="co2" />
        <MetricCard label="CO2 registrado" value={kg(real)} icon="verified" />
      </div>

      <div className="grid-2">
        <div className="table-panel">
          <h2>Planes</h2>
          <table>
            <thead><tr><th>Plan</th><th>EcoGestos</th><th>Impacto</th><th></th></tr></thead>
            <tbody>
              {allPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.nombre}</td>
                  <td>{plan.items.length}</td>
                  <td>{kg(plan.totalCo2)}</td>
                  <td><Link className="text-link" to={`/planes/${plan.id}`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-panel">
          <h2>Resultados declarados</h2>
          <table>
            <thead><tr><th>EcoGesto</th><th>Valor</th><th>CO2</th><th>Estado</th></tr></thead>
            <tbody>
              {allResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.ecogesture.codigo}<br />{result.ecogesture.nombre}</td>
                  <td>{result.valor} {result.unidad}</td>
                  <td>{kg(result.co2Real)}</td>
                  <td>{result.validacionEstado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
