export type Category = {
  id: string;
  nombre: string;
  color: string;
  icono: string;
};

export type EcoGesto = {
  id: string;
  codigo: string;
  nombre: string;
  resumen: string;
  descripcion?: string;
  dificultad: string;
  coste: string;
  impacto: number;
  unidad: string;
  periodo: string;
  estado: string;
  slug: string;
  subcategoria?: string;
  perfiles: string[];
  icono: string;
  fuente: string;
  confianza: string;
  impactoNivel: string;
  ambito: string;
  category: Category;
  steps?: Array<{ id: string; orden: number; titulo: string; descripcion: string; evidenciaRequerida?: string; tiempoEstimado?: string }>;
  impactFactors?: Array<{ formula: string; factor: number; unidad: string; fuente: string; confianza: string }>;
  mediaAssets?: Array<{ tipo: string; url: string; altText: string }>;
  moodleLink?: { syncStatus: string; enrolUrl?: string; badgeId?: string } | null;
};

export type PlanItem = {
  id: string;
  prioridad: string;
  porcentajeAplicacion: number;
  plazo: string;
  frecuencia: string;
  impactoEstimado: number;
  costeEstimado: number;
  estado: string;
  ecogesture: EcoGesto;
};

export type Plan = {
  id: string;
  nombre: string;
  objetivo?: string;
  fechaCreacion: string;
  totalCo2: number;
  totalAgua: number;
  totalPlastico: number;
  totalCoste: number;
  items: PlanItem[];
  user?: { alias: string };
};

export type User = {
  id: string;
  alias: string;
  tipoUsuario: string;
};

export type PointsBalance = {
  earned: number;
  spent: number;
  available: number;
  resultPoints: number;
  badgePoints: number;
};

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  criteria: string;
  imageUrl?: string | null;
  pointsAwarded: number;
};

export type BadgeAward = {
  id: string;
  badgeId: string;
  issuedOn: string;
  status: string;
  badge: Badge;
};

export type Reward = {
  id: string;
  code: string;
  name: string;
  description: string;
  provider: string;
  rewardType: string;
  pointsRequired: number;
  stock?: number | null;
  stockLeft?: number | null;
  terms?: string | null;
  alreadyRedeemed?: boolean;
  canRedeem?: boolean;
};

export type RewardRedemption = {
  id: string;
  rewardId: string;
  pointsSpent: number;
  status: string;
  requestedAt: string;
  reward?: Reward;
};
