import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { EcoGesto } from "../lib/types";
import { kg, number } from "../lib/format";
import { MetricCard } from "../components/MetricCard";
import { EcoGestoCard } from "../components/EcoGestoCard";
import { Icon } from "../components/Icon";

export function Landing() {
  const { data = [] } = useQuery({ queryKey: ["ecogestos", "landing"], queryFn: () => api<EcoGesto[]>("/ecogestos?limit=100") });
  const published = data.filter((item) => ["Publicado", "Validado"].includes(item.estado)).length;
  const totalCo2 = data.reduce((sum, item) => sum + (item.impacto || 0), 0);
  const top = [...data].sort((a, b) => b.impacto - a.impacto).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">EcoGestos AHC MVP</span>
          <h1>Elige acciones medibles, crea tu plan y registra resultados reales.</h1>
          <p>
            Catálogo completo de EcoGestos, cálculo de impacto, EcoRecorridos, informe imprimible,
            microcurso Moodle piloto y panel de gobierno del dato para AHC.
          </p>
          <div className="action-row">
            <Link className="primary-button" to="/catalogo">
              <Icon name="search" />
              Explorar catálogo
            </Link>
            <Link className="ghost-button" to="/plan">
              <Icon name="playlist_add_check" />
              Crear plan
            </Link>
          </div>
        </div>
        <aside className="hero-panel" aria-label="Resumen del MVP">
          <MetricCard label="EcoGestos importados" value={number(data.length)} icon="eco" />
          <MetricCard label="Fichas publicables" value={number(published)} icon="verified" tone="blue" />
          <MetricCard label="Impacto base catálogo" value={kg(totalCo2)} icon="co2" tone="ochre" />
          <MetricCard label="Moodle piloto" value="1 curso" icon="school" tone="green" />
        </aside>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Acciones de alto impacto</span>
            <h2>Prioridad para la demo</h2>
          </div>
          <Link className="text-link" to="/dashboard">Ver dashboard</Link>
        </div>
        <div className="gesture-grid">
          {top.map((item) => (
            <EcoGestoCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
