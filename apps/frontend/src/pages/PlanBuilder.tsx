import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, postJson } from "../lib/api";
import type { EcoGesto, Plan } from "../lib/types";
import { kg } from "../lib/format";
import { Icon } from "../components/Icon";

type Selection = {
  id: string;
  porcentajeAplicacion: number;
  prioridad: string;
  plazo: string;
  frecuencia: string;
};

export function PlanBuilder() {
  const navigate = useNavigate();
  const { data: ecogestos = [] } = useQuery({ queryKey: ["ecogestos", "plan"], queryFn: () => api<EcoGesto[]>("/ecogestos?limit=100") });
  const initial = useMemo(() => JSON.parse(localStorage.getItem("eg-selection") || "[]") as string[], []);
  const [nombre, setNombre] = useState("Mi plan EcoGestos");
  const [objetivo, setObjetivo] = useState("Reducir impactos cotidianos con acciones aplicables este trimestre.");
  const [selection, setSelection] = useState<Selection[]>(
    initial.map((id) => ({ id, porcentajeAplicacion: 100, prioridad: "Media", plazo: "Mes 1", frecuencia: "Semanal" }))
  );
  const selectedIds = new Set(selection.map((item) => item.id));
  const selectedGestures = selection
    .map((item) => ({ config: item, gesture: ecogestos.find((gesture) => gesture.id === item.id) }))
    .filter((item): item is { config: Selection; gesture: EcoGesto } => Boolean(item.gesture));
  const total = selectedGestures.reduce((sum, item) => sum + (item.gesture.impacto * item.config.porcentajeAplicacion) / 100, 0);
  const save = useMutation({
    mutationFn: () =>
      postJson<Plan>("/planes", {
        nombre,
        objetivo,
        items: selection.map((item) => ({
          ecogestureId: item.id,
          porcentajeAplicacion: Number(item.porcentajeAplicacion),
          prioridad: item.prioridad,
          plazo: item.plazo,
          frecuencia: item.frecuencia,
          estado: "pendiente"
        }))
      }),
    onSuccess: (plan) => {
      localStorage.removeItem("eg-selection");
      navigate(`/planes/${plan.id}`);
    }
  });

  const toggle = (id: string) => {
    setSelection((current) => {
      if (current.some((item) => item.id === id)) return current.filter((item) => item.id !== id);
      return [...current, { id, porcentajeAplicacion: 100, prioridad: "Media", plazo: "Mes 1", frecuencia: "Semanal" }];
    });
  };

  const update = (id: string, patch: Partial<Selection>) => {
    setSelection((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div>
          <h1>Mi plan de acción</h1>
          <p className="muted">Ajusta cada EcoGesto: cuánto aplicas, cuándo y con qué prioridad. Los totales se recalculan al instante.</p>
        </div>
        <button className="primary-button" disabled={!selection.length || save.isPending} onClick={() => save.mutate()}>
          Ver resumen e informe
          <Icon name="arrow_forward" />
        </button>
      </div>

      {save.error ? <div className="error">{save.error.message}. Entra con alias demo-ahc si aún no hay sesión.</div> : null}

      <div className="grid-2">
        <div className="panel">
          <h2>Datos del plan</h2>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              Nombre
              <input value={nombre} onChange={(event) => setNombre(event.target.value)} />
            </label>
            <label>
              Impacto estimado
              <input value={kg(total)} readOnly />
            </label>
            <label className="wide">
              Objetivo
              <textarea value={objetivo} onChange={(event) => setObjetivo(event.target.value)} />
            </label>
          </div>
        </div>
        <div className="panel">
          <h2>Selección actual</h2>
          <p>{selection.length} EcoGestos seleccionados. Cambia porcentaje, plazo, prioridad y frecuencia antes de guardar.</p>
          <div className="pill-row">
            {selectedGestures.map(({ gesture }) => (
              <span key={gesture.id}>{gesture.codigo}</span>
            ))}
          </div>
        </div>
      </div>

      {selectedGestures.length ? (
        <div className="plan-editor-layout">
          <div className="plan-card-list">
              {selectedGestures.map(({ config, gesture }) => (
                <article className="panel plan-edit-card" key={config.id}>
                  <div className="gesture-head">
                    <span className="gesture-icon" style={{ background: `${gesture.category.color}22`, color: "#223326" }}><Icon name={gesture.icono} /></span>
                    <div>
                      <h3>{gesture.nombre}</h3>
                      <span className="muted">{gesture.category.nombre} · {gesture.dificultad}</span>
                    </div>
                    <div className="plan-impact">
                      <strong>{kg((gesture.impacto * config.porcentajeAplicacion) / 100)}</strong>
                      <span>CO2/año aplicado</span>
                    </div>
                    <button className="text-link" onClick={() => toggle(config.id)} aria-label="Quitar del plan"><Icon name="close" /></button>
                  </div>
                  <div className="plan-controls-grid">
                    <label>
                      Aplicación · {config.porcentajeAplicacion}%
                      <input type="range" min={10} max={100} step={10} value={config.porcentajeAplicacion} onChange={(event) => update(config.id, { porcentajeAplicacion: Number(event.target.value) })} />
                    </label>
                    <label>
                      Plazo
                      <select value={config.plazo} onChange={(event) => update(config.id, { plazo: event.target.value })}>
                        {["Hoy", "Semana 1", "Mes 1", "Trimestre", "Año"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      Prioridad
                      <select value={config.prioridad} onChange={(event) => update(config.id, { prioridad: event.target.value })}>
                        {["Alta", "Media", "Baja"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      Frecuencia
                      <select value={config.frecuencia} onChange={(event) => update(config.id, { frecuencia: event.target.value })}>
                        {["Única", "Diaria", "Semanal", "Mensual"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
          </div>
          <aside className="panel quick-summary">
            <h2>Resumen rápido</h2>
            <MetricLine icon="cloud" label="CO2 evitado / año" value={kg(total)} />
            <MetricLine icon="water_drop" label="Agua ahorrada / año" value="0 l" />
            <MetricLine icon="payments" label="Inversión estimada" value="0 €" />
            <button className="primary-button" style={{ width: "100%", marginTop: 20 }} disabled={save.isPending} onClick={() => save.mutate()}>
              Ver gráficos e informe
            </button>
          </aside>
        </div>
      ) : null}

      <section className="section">
        <div className="section-heading">
          <h2>Catálogo para seleccionar</h2>
          <span className="muted">{ecogestos.length} disponibles</span>
        </div>
        <div className="gesture-grid">
          {ecogestos.map((item) => (
            <article className="gesture-card" key={item.id}>
              <div className="gesture-head">
                <span className="gesture-icon" style={{ background: `${item.category.color}22`, color: "#223326" }}><Icon name={item.icono} /></span>
                <div><span className="code">{item.codigo}</span><h3>{item.nombre}</h3></div>
              </div>
              <p>{item.resumen}</p>
              <div className="card-footer">
                <strong>{kg(item.impacto)}</strong>
                <button className={selectedIds.has(item.id) ? "danger-button compact" : "ghost-button compact"} onClick={() => toggle(item.id)}>
                  <Icon name={selectedIds.has(item.id) ? "remove" : "add"} />
                  {selectedIds.has(item.id) ? "Quitar" : "Añadir"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function MetricLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="metric-line">
      <span><Icon name={icon} /></span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
