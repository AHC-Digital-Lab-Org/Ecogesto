import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, patchJson } from "../lib/api";
import { kg, number } from "../lib/format";
import { Bars } from "../components/Charts";
import { Icon } from "../components/Icon";
import { MetricCard } from "../components/MetricCard";

type TutoringData = {
  cohortId: string;
  kpis: {
    registros: number;
    participantes: number;
    kgCo2Registrados: number;
    pendientesValidacion: number;
    validadosTutor: number;
  };
  byUser: Array<{
    alias: string;
    cohortId: string | null;
    registros: number;
    co2Real: number;
    pendientes: number;
    validados: number;
  }>;
  byCategory: Array<{ name: string; value: number }>;
  recent: Array<{
    id: string;
    userAlias: string;
    cohortId: string | null;
    ecogestureCodigo: string;
    ecogestureNombre: string;
    categoria: string;
    planNombre: string | null;
    valor: number;
    unidad: string;
    co2Real: number;
    validacionEstado: string;
    fechaFin: string | null;
  }>;
};

export function Tutoring() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["tutoria"],
    queryFn: () => api<TutoringData>("/tutoria/registros")
  });
  const validate = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "validado_tutor" | "requiere_revision" }) =>
      patchJson(`/tutoria/registros/${id}/validacion`, { estado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tutoria"] })
  });

  if (isLoading) return <div className="panel">Cargando tutoría...</div>;
  if (error || !data) return <div className="error">Entra como tutor, ecogestor o demo-ahc para ver la tutoría de cohorte.</div>;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Tutoría EcoGestos</span>
          <h1>Seguimiento y validación de cohorte</h1>
          <p className="muted">Cohorte activa: {data.cohortId}</p>
        </div>
      </div>

      <div className="summary-grid-5">
        <MetricCard label="Participantes" value={number(data.kpis.participantes)} icon="groups" />
        <MetricCard label="Registros" value={number(data.kpis.registros)} icon="edit_note" />
        <MetricCard label="CO2 registrado" value={kg(data.kpis.kgCo2Registrados)} icon="co2" />
        <MetricCard label="Pendientes" value={number(data.kpis.pendientesValidacion)} icon="pending_actions" tone="ochre" />
        <MetricCard label="Validados" value={number(data.kpis.validadosTutor)} icon="verified" tone="green" />
      </div>

      <div className="chart-grid">
        <div className="chart-panel">
          <h2>Impacto registrado por categoría</h2>
          {data.byCategory.length ? <Bars data={data.byCategory} valueLabel="kg CO2e" /> : <p className="muted">Aún no hay registros en esta cohorte.</p>}
        </div>
        <div className="table-panel" tabIndex={0} aria-label="Participantes de cohorte">
          <h2>Participantes</h2>
          <table>
            <thead><tr><th>Alias</th><th>Registros</th><th>CO2</th><th>Pendientes</th><th>Validados</th></tr></thead>
            <tbody>
              {data.byUser.map((user) => (
                <tr key={user.alias}>
                  <td>{user.alias}<br /><span className="muted">{user.cohortId || "sin cohorte"}</span></td>
                  <td>{number(user.registros)}</td>
                  <td>{kg(user.co2Real)}</td>
                  <td>{number(user.pendientes)}</td>
                  <td>{number(user.validados)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-panel" tabIndex={0} aria-label="Registros recientes de tutoría">
        <div className="section-heading" style={{ marginBottom: 10 }}>
          <h2>Registros recientes</h2>
          <span className="muted">{data.recent.length} últimos registros</span>
        </div>
        <table>
          <thead><tr><th>Participante</th><th>EcoGesto</th><th>Valor</th><th>CO2</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            {data.recent.map((result) => (
              <tr key={result.id}>
                <td>{result.userAlias}<br /><span className="muted">{result.planNombre || result.cohortId || "sin plan"}</span></td>
                <td><strong>{result.ecogestureCodigo}</strong><br />{result.ecogestureNombre}</td>
                <td>{result.valor} {result.unidad}</td>
                <td>{kg(result.co2Real)}</td>
                <td><span className="status-pill">{result.validacionEstado}</span></td>
                <td>
                  <div className="table-actions">
                    <button
                      className="ghost-button compact"
                      disabled={validate.isPending}
                      onClick={() => validate.mutate({ id: result.id, estado: "requiere_revision" })}
                    >
                      <Icon name="rate_review" /> Revisar
                    </button>
                    <button
                      className="primary-button compact"
                      disabled={validate.isPending || result.validacionEstado === "validado_tutor"}
                      onClick={() => validate.mutate({ id: result.id, estado: "validado_tutor" })}
                    >
                      <Icon name="verified" /> Validar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
