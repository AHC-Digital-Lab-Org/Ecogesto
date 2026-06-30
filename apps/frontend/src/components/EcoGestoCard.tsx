import { Link } from "react-router-dom";
import type { EcoGesto } from "../lib/types";
import { kg } from "../lib/format";
import { Icon } from "./Icon";

export function EcoGestoCard({ item, onAdd }: { item: EcoGesto; onAdd?: (item: EcoGesto) => void }) {
  const color = item.category?.color || "#4F9447";
  return (
    <article className="gesture-card">
      <div className="gesture-head">
        <span className="gesture-icon" style={{ background: `${color}22`, color: "#223326" }}>
          <Icon name={item.icono || "eco"} />
        </span>
        <div>
          <span className="code">{item.codigo}</span>
          <h3>{item.nombre}</h3>
        </div>
      </div>
      <p>{item.resumen}</p>
      <div className="pill-row">
        <span>{item.category?.nombre}</span>
        <span>{item.dificultad}</span>
        <span>{item.coste}</span>
        <span>{item.confianza}</span>
      </div>
      <div className="card-footer">
        <strong>{item.impacto > 0 ? kg(item.impacto) : item.unidad}</strong>
        <div className="inline-actions">
          {onAdd ? (
            <button className="ghost-button compact" onClick={() => onAdd(item)}>
              <Icon name="add" />
              Plan
            </button>
          ) : null}
          <Link className="text-link" to={`/ecogestos/${item.codigo}`}>
            Ficha
          </Link>
        </div>
      </div>
    </article>
  );
}
