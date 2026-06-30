export function number(value: number | null | undefined, digits = 0) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits }).format(value ?? 0);
}

export function kg(value: number | null | undefined) {
  return `${number(value, 1)} kg CO2e`;
}

export function eur(value: number | null | undefined) {
  return `${number(value, 0)} €`;
}
