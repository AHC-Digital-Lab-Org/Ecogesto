import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category, EcoGesto } from "../lib/types";
import { EcoGestoCard } from "../components/EcoGestoCard";
import { Icon } from "../components/Icon";

const emptyFilters = {
  q: "",
  categoria: "",
  perfil: "",
  coste: "",
  dificultad: "",
  impacto: "",
  ambito: "",
  tiempoImplantacion: "",
  duracion: "",
  requiereMoodle: "",
  calculoValidado: "",
  conMultimedia: ""
};

export function Catalog() {
  const [filters, setFilters] = useState(emptyFilters);
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("limit", "100");
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["ecogestos", filters],
    queryFn: () => api<EcoGesto[]>(`/ecogestos?${params.toString()}`)
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categorias"], queryFn: () => api<Category[]>("/categorias") });
  const subcategories = useMemo(() => [...new Set(data.map((item) => item.subcategoria).filter(Boolean))], [data]);

  const addToPlan = (item: EcoGesto) => {
    const current = JSON.parse(localStorage.getItem("eg-selection") || "[]") as string[];
    localStorage.setItem("eg-selection", JSON.stringify([...new Set([...current, item.id])]));
  };

  return (
    <section className="section" style={{ marginTop: 0 }}>
      <div className="section-heading" style={{ marginBottom: 6 }}>
        <div>
          <h1>Catálogo de EcoGestos</h1>
          <p className="muted">Los filtros se combinan y actualizan los resultados sin perder tu selección.</p>
        </div>
      </div>

      <div className="catalog-layout">
        <div className="panel filter-sidebar" aria-label="Filtros de catálogo">
          <div className="filter-title">
            <h2><Icon name="tune" /> Filtros</h2>
            <button className="text-link" onClick={() => setFilters(emptyFilters)}>Limpiar</button>
          </div>
          <label>
            Categoría
            <select value={filters.categoria} onChange={(event) => setFilters({ ...filters, categoria: event.target.value })}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Perfil
            <select value={filters.perfil} onChange={(event) => setFilters({ ...filters, perfil: event.target.value })}>
              <option value="">Todos</option>
              {["ciudadano", "familia", "empleado", "comunidad", "entidad"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Coste
            <select value={filters.coste} onChange={(event) => setFilters({ ...filters, coste: event.target.value })}>
              <option value="">Todos</option>
              {["sin coste", "bajo", "medio", "alto", "variable"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Dificultad
            <select value={filters.dificultad} onChange={(event) => setFilters({ ...filters, dificultad: event.target.value })}>
              <option value="">Todas</option>
              {["muy fácil", "fácil", "moderada", "avanzada", "colectiva"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Impacto
            <select value={filters.impacto} onChange={(event) => setFilters({ ...filters, impacto: event.target.value })}>
              <option value="">Todos</option>
              {["bajo", "moderado", "alto", "muy alto", "indirecto", "pendiente"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Ámbito
            <select value={filters.ambito} onChange={(event) => setFilters({ ...filters, ambito: event.target.value })}>
              <option value="">Todos</option>
              {["hogar", "trabajo", "movilidad", "alimentacion", "comunidad"].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Implantación
            <select value={filters.tiempoImplantacion} onChange={(event) => setFilters({ ...filters, tiempoImplantacion: event.target.value })}>
              <option value="">Cualquiera</option>
              <option value="corto">Corta</option>
              <option value="medio">Media</option>
              <option value="largo">Larga</option>
            </select>
          </label>
          <label>
            Duración de guía
            <select value={filters.duracion} onChange={(event) => setFilters({ ...filters, duracion: event.target.value })}>
              <option value="">Cualquiera</option>
              <option value="menos_15_min">Menos de 15 min</option>
              <option value="15_30_min">15-30 min</option>
              <option value="mas_30_min">Más de 30 min</option>
            </select>
          </label>
          <label>
            Moodle
            <select value={filters.requiereMoodle} onChange={(event) => setFilters({ ...filters, requiereMoodle: event.target.value })}>
              <option value="">Cualquiera</option>
              <option value="true">Con Moodle</option>
              <option value="false">Sin Moodle</option>
            </select>
          </label>
          <label>
            Cálculo
            <select value={filters.calculoValidado} onChange={(event) => setFilters({ ...filters, calculoValidado: event.target.value })}>
              <option value="">Cualquiera</option>
              <option value="true">Validado</option>
              <option value="false">Estimado</option>
            </select>
          </label>
          <label>
            Multimedia
            <select value={filters.conMultimedia} onChange={(event) => setFilters({ ...filters, conMultimedia: event.target.value })}>
              <option value="">Cualquiera</option>
              <option value="true">Con icono o guía</option>
              <option value="false">Sin material</option>
            </select>
          </label>
        </div>

        <div>
          <div className="search-row">
            <div className="search-box">
              <Icon name="search" />
              <input placeholder="Buscar EcoGestos por nombre o tema" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
            </div>
            <div className="muted">{data.length} resultados</div>
          </div>
          {subcategories.length ? <p className="muted">Subcategorías visibles: {subcategories.slice(0, 8).join(", ")}</p> : null}
          {error ? <div className="error">{String(error.message)}</div> : null}
          {isLoading ? <div className="panel">Cargando catálogo...</div> : null}
          <div className="gesture-grid two-col">
            {data.map((item) => (
              <EcoGestoCard key={item.id} item={item} onAdd={addToPlan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
