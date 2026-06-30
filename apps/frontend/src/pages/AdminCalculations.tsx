import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { number } from "../lib/format";
import { MetricCard } from "../components/MetricCard";
import { Icon } from "../components/Icon";

type CalculationFactor = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  variable: string;
  formula: string;
  factor: number;
  unidad: string;
  fuente: string;
  confianza: string;
  tier: string;
  action: string;
};

type CalculationAdminData = {
  summary: {
    totalFactors: number;
    highConfidence: number;
    mediumConfidence: number;
    lowOrPending: number;
    byTier: Record<string, number>;
    byCategory: Record<string, { total: number; alta: number; pendiente: number }>;
  };
  methodology: {
    formula: string;
    aggregationRule: string;
    confidenceLevels: Array<{ nivel: string; criterio: string }>;
  };
  factors: CalculationFactor[];
};

export function AdminCalculations() {
  const { data, error } = useQuery({ queryKey: ["admin-calculos"], queryFn: () => api<CalculationAdminData>("/admin/calculos") });

  if (error) {
    return (
      <section className="section">
        <h1>Cálculos, factores y trazabilidad</h1>
        <div className="error">Entra como demo-ahc, ecogestor o tutor-ahc para revisar cálculos.</div>
      </section>
    );
  }
  if (!data) return <div className="panel">Cargando validación metodológica...</div>;

  const sourceTiers = Object.entries(data.summary.byTier);
  const categories = Object.entries(data.summary.byCategory);

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Validación profesional</span>
          <h1>Cálculos, factores y trazabilidad</h1>
        </div>
        <Link className="ghost-button" to="/dashboard">
          <Icon name="monitoring" /> Dashboard
        </Link>
      </div>

      <div className="metric-grid">
        <MetricCard label="Factores auditables" value={number(data.summary.totalFactors)} icon="functions" />
        <MetricCard label="Confianza alta" value={number(data.summary.highConfidence)} icon="verified" />
        <MetricCard label="Confianza media" value={number(data.summary.mediumConfidence)} icon="rule" />
        <MetricCard label="Baja o pendiente" value={number(data.summary.lowOrPending)} icon="priority_high" tone="orange" />
      </div>

      <div className="grid-2">
        <div className="panel method-panel">
          <span className="eyebrow">Fórmula base</span>
          <h2>{data.methodology.formula}</h2>
          <p>{data.methodology.aggregationRule}</p>
          <div className="pill-row">
            {sourceTiers.map(([tier, value]) => (
              <span key={tier}>{tier}: {value}</span>
            ))}
          </div>
        </div>
        <div className="panel">
          <span className="eyebrow">Confianza</span>
          <div className="quality-list">
            {data.methodology.confidenceLevels.map((item) => (
              <div key={item.nivel}>
                <strong>{item.nivel}</strong>
                <span>{item.criterio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-panel" tabIndex={0}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Cobertura por categoría</span>
            <h2>Estado de revisión</h2>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Factores</th>
              <th>Alta</th>
              <th>Pendiente</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(([name, item]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{item.total}</td>
                <td>{item.alta}</td>
                <td>{item.pendiente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-panel" tabIndex={0}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Matriz técnica</span>
            <h2>Factores por EcoGesto</h2>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>EcoGesto</th>
              <th>Factor</th>
              <th>Fuente</th>
              <th>Conf.</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.factors.map((factor) => (
              <tr key={factor.id}>
                <td>
                  <strong>{factor.codigo}</strong>
                  <br />
                  {factor.nombre}
                  <br />
                  <span className="muted">{factor.categoria}</span>
                </td>
                <td>
                  <strong>{number(factor.factor, 2)}</strong> {factor.unidad}
                  <br />
                  <span className="muted">{factor.variable}</span>
                </td>
                <td>
                  {factor.tier}
                  <br />
                  <span className="muted">{factor.fuente}</span>
                </td>
                <td><span className="status-pill">{factor.confianza}</span></td>
                <td>{factor.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
