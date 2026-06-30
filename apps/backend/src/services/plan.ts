import { calculateImpact, aggregateTotals, type MetricTotals } from "@ecogestos/shared";

export type PlanLikeItem = {
  porcentajeAplicacion: number;
  frecuencia: string;
  ecogesture: {
    codigo: string;
    nombre: string;
    category?: { nombre: string } | null;
    impacto: number;
    fuente: string;
    dificultad: string;
    coste: string;
  };
};

export function totalsForPlanItems(items: PlanLikeItem[]) {
  const calculated = items.map((item) => {
    const breakdown = calculateImpact(
      {
        codigo: item.ecogesture.codigo,
        nombre: item.ecogesture.nombre,
        categoria: item.ecogesture.category?.nombre ?? "",
        co2: item.ecogesture.impacto,
        fuente: item.ecogesture.fuente,
        dificultad: item.ecogesture.dificultad,
        coste: item.ecogesture.coste
      },
      {
        porcentajeAplicacion: item.porcentajeAplicacion,
        frecuencia: item.frecuencia
      }
    );
    return breakdown.totals;
  });

  return aggregateTotals(calculated);
}

export function emptyTotals(): MetricTotals {
  return { co2: 0, agua: 0, plastico: 0, coste: 0 };
}
