import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, postJson } from "../lib/api";
import { kg } from "../lib/format";
import { Icon } from "../components/Icon";

type EcoRoute = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  perfilObjetivo: string;
  dificultadTotal: string;
  impactoEstimado: number;
  estado: string;
  items: Array<{
    id: string;
    orden: number;
    obligatorio: boolean;
    ecogesture: { codigo: string; nombre: string; impacto: number; category: { nombre: string } };
  }>;
};

type MoodlePilot = {
  ecogesto: { codigo: string; nombre: string; moodleLink?: { syncStatus: string } };
  estructura: string[];
};

export function AdminRoutes() {
  const routes = useQuery({ queryKey: ["ecoroutes"], queryFn: () => api<EcoRoute[]>("/ecorrecorridos") });
  const pilot = useQuery({ queryKey: ["moodle-pilot"], queryFn: () => api<MoodlePilot>("/moodle/piloto") });
  const sync = useMutation({ mutationFn: () => postJson("/moodle/sync", { mode: "courses" }) });

  if (routes.error) return <div className="error">No se pudieron cargar los EcoRecorridos.</div>;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div><span className="eyebrow">Administracion</span><h1>EcoRecorridos y Moodle piloto</h1></div>
        <Link className="ghost-button" to="/admin/ecogestos"><Icon name="table" /> EcoGestos</Link>
      </div>

      <div className="grid-2">
        {(routes.data || []).map((route) => (
          <article className="panel" key={route.id}>
            <div className="section-heading">
              <div><span className="code">{route.codigo}</span><h2>{route.nombre}</h2></div>
              <span className="status-pill">{route.estado}</span>
            </div>
            <p>{route.descripcion}</p>
            <div className="pill-row">
              <span>{route.perfilObjetivo}</span>
              <span>{route.dificultadTotal}</span>
              <span>{kg(route.impactoEstimado)}</span>
            </div>
            <ol className="steps">
              {route.items.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.ecogesture.codigo} {item.obligatorio ? "(obligatorio)" : ""}</strong>
                    <p>{item.ecogesture.nombre}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Moodle piloto</span>
            <h2>{pilot.data?.ecogesto?.codigo} {pilot.data?.ecogesto?.nombre}</h2>
          </div>
          <button className="primary-button" onClick={() => sync.mutate()}><Icon name="sync" /> Simular sync</button>
        </div>
        {sync.data ? <div className="notice">Sincronizacion preparada. Faltan credenciales reales de Moodle para ejecutar llamadas REST.</div> : null}
        <ol className="steps">
          {(pilot.data?.estructura || []).map((step) => (
            <li key={step}><div><strong>{step}</strong><p>Elemento incluido en el microcurso piloto de 5 a 15 minutos.</p></div></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
