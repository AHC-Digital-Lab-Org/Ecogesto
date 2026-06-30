import { describe, expect, it } from "vitest";
import { calculateImpact, aggregateTotals } from "@ecogestos/shared";

describe("impact calculator", () => {
  it("calculates annual impact with percentage and frequency multiplier", () => {
    const result = calculateImpact(
      {
        codigo: "ECO-MOV-002",
        nombre: "Usar transporte publico",
        categoria: "Movilidad y transporte",
        co2: 550,
        fuente: "MITECO - Factor emision coche convencional 0,17 kg CO2/km",
        coste: "sin coste"
      },
      { porcentajeAplicacion: 50, frecuencia: "Semanal" }
    );

    expect(result.totals.co2).toBe(275);
    expect(result.confianza).toBe("alta");
    expect(result.tipo).toBe("co2");
  });

  it("keeps water and CO2 as separate indicators", () => {
    const totals = aggregateTotals([
      { co2: 100, agua: 0, plastico: 0, coste: 0 },
      { co2: 0, agua: 20000, plastico: 0, coste: 0 }
    ]);

    expect(totals.co2).toBe(100);
    expect(totals.agua).toBe(20000);
  });
});
