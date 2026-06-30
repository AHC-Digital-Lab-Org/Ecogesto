export type MetricTotals = {
  co2: number;
  agua: number;
  plastico: number;
  coste: number;
};

export type ImpactSource = {
  codigo: string;
  nombre: string;
  categoria: string;
  impacto_estimado?: string;
  fuente?: string;
  co2?: number;
  agua?: number;
  plastico?: number;
  costeEur?: number;
  dificultad?: string;
  coste?: string;
};

export type PlanInput = {
  porcentajeAplicacion?: number;
  frecuencia?: string;
};

export type CalculationBreakdown = {
  totals: MetricTotals;
  base: MetricTotals;
  multiplier: number;
  porcentaje: number;
  formulaVisible: string;
  confianza: "alta" | "media" | "baja" | "pendiente";
  tipo: "co2" | "agua" | "plastico" | "mixto" | "indirecto" | "pendiente";
};

export const categoryMeta: Record<string, { id: string; color: string; icon: string; ambito: string }> = {
  "Movilidad y transporte": { id: "movilidad", color: "#4F9447", icon: "directions_car", ambito: "movilidad" },
  "Energía y vivienda": { id: "energia", color: "#C9893F", icon: "home", ambito: "hogar" },
  "Alimentación": { id: "alimentacion", color: "#9B4D39", icon: "restaurant", ambito: "alimentacion" },
  "Consumo y compras": { id: "consumo", color: "#6B6A44", icon: "shopping_bag", ambito: "hogar" },
  "Residuos y plásticos": { id: "residuos", color: "#8A6D3B", icon: "recycling", ambito: "hogar" },
  "Agua": { id: "agua", color: "#3D8FA6", icon: "water_drop", ambito: "hogar" },
  "Finanzas sostenibles": { id: "finanzas", color: "#5C7CA6", icon: "savings", ambito: "hogar" },
  "Ocio, cuidados y comunidad": { id: "comunidad", color: "#537358", icon: "groups", ambito: "comunidad" }
};

export const frequencyMultipliers: Record<string, number> = {
  "Única": 0.25,
  "Diaria": 1.25,
  "Semanal": 1,
  "Mensual": 0.5
};

export const dificultadScore: Record<string, number> = {
  "muy fácil": 1,
  "fácil": 2,
  "moderada": 3,
  "avanzada": 4,
  "colectiva": 4
};

export const costeScore: Record<string, number> = {
  "sin coste": 0,
  "bajo": 1,
  "medio": 2,
  "alto": 3,
  "variable": 2
};

export function roundMetric(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function midpointFromText(text = ""): number {
  const normalized = text.replace(/\./g, "").replace(/,/g, ".");
  const numbers = [...normalized.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0])).filter(Number.isFinite);
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
}

export function inferBaseMetrics(source: ImpactSource): MetricTotals {
  const text = source.impacto_estimado ?? "";
  const parsed = midpointFromText(text);
  const costeLabel = source.coste ?? "";
  const fallbackCost =
    costeLabel === "bajo" ? 20 : costeLabel === "medio" ? 80 : costeLabel === "alto" ? 250 : costeLabel === "variable" ? 60 : 0;
  return {
    co2: roundMetric(source.co2 ?? (/(kg|tonelada|t\s*)\s*co2|co2e|co2eq/i.test(text) ? parsed : 0)),
    agua: roundMetric(source.agua ?? (/litro|agua/i.test(text) ? parsed : 0)),
    plastico: roundMetric(source.plastico ?? (/pl[aá]stico/i.test(text) ? parsed : 0)),
    coste: roundMetric(source.costeEur ?? (/€|eur|euro/i.test(text) ? parsed : fallbackCost))
  };
}

export function classifyImpact(metrics: MetricTotals, text = ""): CalculationBreakdown["tipo"] {
  if (/indirecto|incalculable/i.test(text)) return "indirecto";
  const active = [metrics.co2 > 0, metrics.agua > 0, metrics.plastico > 0, metrics.coste > 0].filter(Boolean).length;
  if (active > 1) return "mixto";
  if (metrics.co2 > 0) return "co2";
  if (metrics.agua > 0) return "agua";
  if (metrics.plastico > 0) return "plastico";
  return "pendiente";
}

export function confidenceFromSource(source = "", text = ""): CalculationBreakdown["confianza"] {
  if (/pendiente/i.test(source) || /pendiente/i.test(text)) return "pendiente";
  if (/estimaci[oó]n AHC/i.test(source) && !/MITECO|IDAE|REE|FAO|GHG|ICAO|Oxford|WRAP|AEMET|ACA|OCU|Ecoembes/i.test(source)) {
    return "media";
  }
  if (/MITECO|IDAE|REE|FAO|GHG|ICAO|Oxford|WRAP|AEMET|ACA|OCU|Ecoembes|Ag[eè]ncia|Ministerio|Energy Saving Trust/i.test(source)) {
    return "alta";
  }
  if (/indirecto/i.test(text)) return "baja";
  return "media";
}

export function impactLevel(co2: number, tipo: CalculationBreakdown["tipo"]): "bajo" | "moderado" | "alto" | "muy alto" | "indirecto" | "pendiente" {
  if (tipo === "indirecto") return "indirecto";
  if (tipo === "pendiente") return "pendiente";
  if (co2 <= 0) return "moderado";
  if (co2 <= 30) return "bajo";
  if (co2 <= 100) return "moderado";
  if (co2 <= 300) return "alto";
  return "muy alto";
}

export function calculateImpact(source: ImpactSource, input: PlanInput = {}): CalculationBreakdown {
  const base = inferBaseMetrics(source);
  const porcentaje = Math.min(Math.max(input.porcentajeAplicacion ?? 100, 0), 100);
  const multiplier = frequencyMultipliers[input.frecuencia ?? "Semanal"] ?? 1;
  const scale = (porcentaje / 100) * multiplier;
  const totals = {
    co2: roundMetric(base.co2 * scale),
    agua: roundMetric(base.agua * scale),
    plastico: roundMetric(base.plastico * scale),
    coste: roundMetric(base.coste * scale)
  };
  const tipo = classifyImpact(base, source.impacto_estimado);

  return {
    totals,
    base,
    multiplier,
    porcentaje,
    formulaVisible: "impacto_anual = impacto_base_anual x porcentaje_aplicacion x multiplicador_frecuencia",
    confianza: confidenceFromSource(source.fuente, source.impacto_estimado),
    tipo
  };
}

export function aggregateTotals(items: Array<MetricTotals>): MetricTotals {
  return items.reduce<MetricTotals>(
    (acc, item) => ({
      co2: roundMetric(acc.co2 + item.co2),
      agua: roundMetric(acc.agua + item.agua),
      plastico: roundMetric(acc.plastico + item.plastico),
      coste: roundMetric(acc.coste + item.coste)
    }),
    { co2: 0, agua: 0, plastico: 0, coste: 0 }
  );
}
