import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api, postJson } from "../lib/api";
import type { EcoGesto } from "../lib/types";
import { Icon } from "../components/Icon";

export function ResultForm() {
  const navigate = useNavigate();
  const { data: ecogestos = [] } = useQuery({ queryKey: ["ecogestos", "result"], queryFn: () => api<EcoGesto[]>("/ecogestos?limit=100") });
  const [form, setForm] = useState({
    ecogestureId: "",
    valor: 100,
    unidad: "porcentaje",
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: new Date().toISOString().slice(0, 10),
    evidenciaUrl: "",
    comentario: ""
  });
  const save = useMutation({
    mutationFn: () =>
      postJson("/resultados", {
        ...form,
        valor: Number(form.valor),
        validacionEstado: "declarado"
      }),
    onSuccess: () => navigate("/progreso")
  });

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading">
        <div><span className="eyebrow">Registro de resultados</span><h1>Declarar ejecución y evidencia</h1></div>
        <Link className="ghost-button" to="/progreso"><Icon name="arrow_back" /> Volver</Link>
      </div>
      {save.error ? <div className="error">{save.error.message}. Entra con alias para guardar resultados.</div> : null}
      <form
        className="panel"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="form-grid">
          <label className="wide">
            EcoGesto
            <select required value={form.ecogestureId} onChange={(event) => setForm({ ...form, ecogestureId: event.target.value })}>
              <option value="">Selecciona EcoGesto</option>
              {ecogestos.map((item) => (
                <option key={item.id} value={item.id}>{item.codigo} - {item.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Valor
            <input type="number" value={form.valor} onChange={(event) => setForm({ ...form, valor: Number(event.target.value) })} />
          </label>
          <label>
            Unidad
            <select value={form.unidad} onChange={(event) => setForm({ ...form, unidad: event.target.value })}>
              <option value="porcentaje">porcentaje</option>
              <option value="kg CO2e">kg CO2e</option>
              <option value="litros">litros</option>
              <option value="kg plastico">kg plástico</option>
            </select>
          </label>
          <label>
            Fecha inicio
            <input type="date" value={form.fechaInicio} onChange={(event) => setForm({ ...form, fechaInicio: event.target.value })} />
          </label>
          <label>
            Fecha fin
            <input type="date" value={form.fechaFin} onChange={(event) => setForm({ ...form, fechaFin: event.target.value })} />
          </label>
          <label className="wide">
            Evidencia URL
            <input value={form.evidenciaUrl} onChange={(event) => setForm({ ...form, evidenciaUrl: event.target.value })} placeholder="https://..." />
          </label>
          <label className="wide">
            Comentario
            <textarea value={form.comentario} onChange={(event) => setForm({ ...form, comentario: event.target.value })} />
          </label>
        </div>
        <div className="action-row" style={{ marginTop: 16 }}>
          <button className="primary-button" type="submit" disabled={save.isPending}><Icon name="save" /> Guardar resultado</button>
        </div>
      </form>
    </section>
  );
}
