import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { EcoGesto } from "../lib/types";
import { kg } from "../lib/format";
import { MetricCard } from "../components/MetricCard";
import { Icon } from "../components/Icon";

export function Detail() {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ["ecogesto", id], queryFn: () => api<EcoGesto>(`/ecogestos/${id}`) });

  if (isLoading) return <div className="panel">Cargando ficha...</div>;
  if (error || !data) return <div className="error">No se pudo cargar la ficha.</div>;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{data.codigo}</span>
          <h1>{data.nombre}</h1>
        </div>
        <div className="action-row no-print">
          <button className="ghost-button" onClick={() => window.print()}><Icon name="print" /> Imprimir ficha</button>
          <Link className="primary-button" to="/plan"><Icon name="playlist_add" /> Usar en plan</Link>
        </div>
      </div>

      <div className="detail-layout">
        <div className="panel">
          <p>{data.resumen}</p>
          <div className="metric-grid">
            <MetricCard label="Impacto estimado" value={data.impacto > 0 ? kg(data.impacto) : data.unidad} icon="co2" />
            <MetricCard label="Dificultad" value={data.dificultad} icon="speed" tone="blue" />
            <MetricCard label="Coste" value={data.coste} icon="payments" tone="ochre" />
            <MetricCard label="Confianza" value={data.confianza} icon="verified" />
          </div>
          <section className="section">
            <h2>Guia paso a paso</h2>
            <ol className="steps">
              {(data.steps || []).map((step) => (
                <li key={step.id}>
                  <div>
                    <strong>{step.titulo}</strong>
                    <p>{step.descripcion}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="panel">
          <h2>Ficha tecnica</h2>
          <p><strong>Categoria:</strong> {data.category.nombre}</p>
          <p><strong>Subcategoría:</strong> {data.subcategoria}</p>
          <p><strong>Ambito:</strong> {data.ambito}</p>
          <p><strong>Estado:</strong> {data.estado}</p>
          <p><strong>Fuente:</strong> {data.fuente}</p>
          <p><strong>Moodle:</strong> {data.moodleLink?.syncStatus || "pendiente"}</p>
          <div className="notice">
            {(data.impactFactors || [])[0]?.formula || "Formula pendiente de completar en ficha tecnica."}
          </div>
        </aside>
      </div>
    </section>
  );
}
