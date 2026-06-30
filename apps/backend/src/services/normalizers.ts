import {
  calculateImpact,
  categoryMeta,
  costeScore,
  dificultadScore,
  impactLevel,
  type ImpactSource
} from "@ecogestos/shared";
import { slugify } from "../lib/slug.js";

export type RawEcogesto = ImpactSource & {
  resumen: string;
  subcategoria: string;
  perfiles: string[];
  dificultad: string;
  coste: string;
  periodo: string;
  guia_pasos: string[];
  evidencia: string;
  moodle: string;
  icono: string;
};

export function normalizeEcogesto(raw: RawEcogesto) {
  const calculation = calculateImpact(raw);
  const meta = categoryMeta[raw.categoria] ?? categoryMeta["Ocio, cuidados y comunidad"];
  const tipo = calculation.tipo;

  return {
    codigo: raw.codigo,
    nombre: raw.nombre,
    resumen: raw.resumen,
    descripcion: raw.resumen,
    slug: slugify(`${raw.codigo}-${raw.nombre}`),
    categoriaId: meta.id,
    dificultad: raw.dificultad,
    coste: raw.coste,
    impacto: calculation.base.co2,
    unidad: tipo === "agua" ? "litros/año" : tipo === "plastico" ? "kg plastico/año" : "kg CO2e/año",
    periodo: raw.periodo,
    estado: calculation.confianza === "alta" ? "Publicado" : "En revisión",
    subcategoria: raw.subcategoria,
    perfiles: raw.perfiles,
    icono: raw.icono,
    fuente: raw.fuente,
    confianza: calculation.confianza,
    impactoNivel: impactLevel(calculation.base.co2, tipo),
    ambito: meta.ambito,
    costeEur: raw.coste === "sin coste" ? 0 : raw.coste === "bajo" ? 20 : raw.coste === "medio" ? 80 : raw.coste === "alto" ? 250 : 60,
    dificultadNum: dificultadScore[raw.dificultad] ?? 2,
    costeNum: costeScore[raw.coste] ?? 0,
    calculation
  };
}

export function impactFactorFromRaw(raw: RawEcogesto) {
  const normalized = normalizeEcogesto(raw);
  const metric = normalized.calculation.base;
  const primary =
    metric.co2 > 0
      ? { variable: "impacto_base_anual", factor: metric.co2, unidad: "kg CO2e/año" }
      : metric.agua > 0
        ? { variable: "agua_base_anual", factor: metric.agua, unidad: "litros/año" }
        : metric.plastico > 0
          ? { variable: "plastico_base_anual", factor: metric.plastico, unidad: "kg plastico/año" }
          : { variable: "impacto_indirecto", factor: 0, unidad: "indicador indirecto" };

  return {
    variable: primary.variable,
    formula: normalized.calculation.formulaVisible,
    factor: primary.factor,
    unidad: primary.unidad,
    fuente: raw.fuente || "estimacion AHC",
    confianza: normalized.calculation.confianza,
    fechaRevision: new Date()
  };
}
