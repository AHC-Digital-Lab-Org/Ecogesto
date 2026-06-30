import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, patchJson } from "../lib/api";
import type { EcoGesto } from "../lib/types";
import { kg } from "../lib/format";
import { Icon } from "../components/Icon";

type AuditLog = {
  id: string;
  usuario: string;
  entidad: string;
  entidadId: string;
  accion: string;
  fecha: string;
};

export function AdminEcoGestos() {
  const queryClient = useQueryClient();
  const ecogestos = useQuery({ queryKey: ["admin-ecogestos"], queryFn: () => api<EcoGesto[]>("/ecogestos?limit=100") });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => api<AuditLog[]>("/admin/audit") });
  const changeState = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => patchJson(`/ecogestos/${id}/estado`, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ecogestos"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
    }
  });

  if (ecogestos.error) return <div className="error">Entra como demo-ahc para gestionar EcoGestos.</div>;

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div><span className="eyebrow">Administracion</span><h1>Gobierno editorial de EcoGestos</h1></div>
        <Link className="ghost-button" to="/admin/ecorrecorridos"><Icon name="route" /> EcoRecorridos</Link>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Impacto</th>
              <th>Fuente</th>
              <th>Confianza</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(ecogestos.data || []).map((item) => (
              <tr key={item.id}>
                <td><Link className="text-link" to={`/ecogestos/${item.codigo}`}>{item.codigo}</Link></td>
                <td>{item.nombre}</td>
                <td>{item.category.nombre}</td>
                <td>{kg(item.impacto)}</td>
                <td>{item.fuente}</td>
                <td><span className="status-pill">{item.confianza}</span></td>
                <td>
                  <select value={item.estado} onChange={(event) => changeState.mutate({ id: item.id, estado: event.target.value })}>
                    {["Borrador", "En revisión", "Pendiente de cálculo", "Validado", "Publicado", "En revisión periódica", "Archivado"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-panel">
        <h2>Auditoría reciente</h2>
        {audit.error ? <div className="notice">La auditoria requiere rol administrador o EcoGestor.</div> : null}
        <table>
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Entidad</th><th>Accion</th></tr></thead>
          <tbody>
            {(audit.data || []).slice(0, 20).map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.fecha).toLocaleString("es-ES")}</td>
                <td>{log.usuario}</td>
                <td>{log.entidad}</td>
                <td>{log.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
