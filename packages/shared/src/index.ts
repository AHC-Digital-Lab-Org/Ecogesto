import { z } from "zod";
export * from "./calculations.js";

export const roles = [
  "visitante_publico",
  "usuario_registrado",
  "ciudadano_activista",
  "voluntario_ecogestos",
  "tutor_ecogestos",
  "ecogestor",
  "administrador_ahc",
  "entidad_colaboradora"
] as const;

export const editorialStates = [
  "Borrador",
  "En revisión",
  "Pendiente de cálculo",
  "Validado",
  "Publicado",
  "En revisión periódica",
  "Archivado"
] as const;

export const dificultadValues = ["muy fácil", "fácil", "moderada", "avanzada", "colectiva"] as const;
export const costeValues = ["sin coste", "bajo", "medio", "alto", "variable"] as const;
export const impactoValues = ["bajo", "moderado", "alto", "muy alto", "indirecto", "pendiente"] as const;
export const ambitoValues = ["hogar", "trabajo", "movilidad", "alimentacion", "comunidad"] as const;
export const tiempoImplantacionValues = ["corto", "medio", "largo"] as const;
export const duracionValues = ["menos_15_min", "15_30_min", "mas_30_min"] as const;
export const plazoValues = ["Hoy", "Semana 1", "Mes 1", "Trimestre", "Año"] as const;
export const prioridadValues = ["Alta", "Media", "Baja"] as const;
export const frecuenciaValues = ["Única", "Diaria", "Semanal", "Mensual"] as const;

export type Role = (typeof roles)[number];
export type EditorialState = (typeof editorialStates)[number];
export type Dificultad = (typeof dificultadValues)[number];
export type Coste = (typeof costeValues)[number];
export type ImpactoNivel = (typeof impactoValues)[number];

export const roleLabels: Record<Role, string> = {
  visitante_publico: "Visitante público",
  usuario_registrado: "Usuario registrado",
  ciudadano_activista: "Ciudadano activista",
  voluntario_ecogestos: "Voluntario EcoGestos",
  tutor_ecogestos: "Tutor EcoGestos",
  ecogestor: "EcoGestor",
  administrador_ahc: "Administrador AHC",
  entidad_colaboradora: "Entidad colaboradora"
};

export const ahcTheme = {
  primary: "#4F9447",
  title: "#537358",
  text: "#222A1A",
  link: "#A5C6A4",
  background: "#F4F1E9",
  card: "#FFFFFF",
  border: "#E1D7C0"
} as const;

export const ecogestureFilterSchema = z.object({
  q: z.string().optional(),
  categoria: z.string().optional(),
  subcategoria: z.string().optional(),
  perfil: z.string().optional(),
  coste: z.enum(costeValues).optional(),
  dificultad: z.enum(dificultadValues).optional(),
  impacto: z.enum(impactoValues).optional(),
  ambito: z.enum(ambitoValues).optional(),
  tiempoImplantacion: z.enum(tiempoImplantacionValues).optional(),
  duracion: z.enum(duracionValues).optional(),
  requiereMoodle: z.coerce.boolean().optional(),
  calculoValidado: z.coerce.boolean().optional(),
  conMultimedia: z.coerce.boolean().optional(),
  estado: z.enum(editorialStates).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const consentSchema = z.object({
  registro: z.boolean().default(true),
  medicion: z.boolean().default(true),
  comunicaciones: z.boolean().default(false),
  datosAgregados: z.boolean().default(true)
});

export const aliasLoginSchema = z.object({
  alias: z.string().min(2).max(60),
  email: z.string().email().optional().or(z.literal("")),
  nombre: z.string().max(100).optional(),
  ciudad: z.string().max(80).optional(),
  pais: z.string().max(80).default("España"),
  tipoUsuario: z.enum(roles).default("usuario_registrado"),
  consentimientos: consentSchema.default({})
});

export const planItemInputSchema = z.object({
  ecogestureId: z.string().min(1),
  prioridad: z.enum(prioridadValues).default("Media"),
  porcentajeAplicacion: z.number().min(0).max(100).default(100),
  plazo: z.enum(plazoValues).default("Mes 1"),
  frecuencia: z.enum(frecuenciaValues).default("Semanal"),
  estado: z.string().default("pendiente")
});

export const createPlanSchema = z.object({
  nombre: z.string().min(2).max(120),
  objetivo: z.string().max(500).optional(),
  items: z.array(planItemInputSchema).default([])
});

export const resultInputSchema = z.object({
  ecogestureId: z.string().min(1),
  planItemId: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  valor: z.number(),
  unidad: z.string().min(1).max(40),
  evidenciaUrl: z.string().url().optional().or(z.literal("")),
  comentario: z.string().max(1000).optional(),
  validacionEstado: z.string().default("declarado")
});

export const ecogestureInputSchema = z.object({
  codigo: z.string().min(3),
  nombre: z.string().min(3),
  resumen: z.string().min(10),
  descripcion: z.string().optional(),
  categoriaId: z.string().min(1),
  dificultad: z.enum(dificultadValues),
  coste: z.enum(costeValues),
  impacto: z.number().default(0),
  unidad: z.string().default("kg CO2e"),
  periodo: z.string().default("anual"),
  estado: z.enum(editorialStates).default("Borrador"),
  slug: z.string().optional(),
  aliasCorto: z.string().optional(),
  idioma: z.string().default("es"),
  licencia: z.string().default("CC BY-NC-SA 4.0"),
  autor: z.string().default("AHC"),
  validador: z.string().optional(),
  subcategoria: z.string().optional(),
  perfiles: z.array(z.string()).default([]),
  icono: z.string().default("eco"),
  fuente: z.string().default("pendiente"),
  confianza: z.string().default("pendiente")
});

export type EcogestureFilters = z.infer<typeof ecogestureFilterSchema>;
export type AliasLoginInput = z.infer<typeof aliasLoginSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type ResultInput = z.infer<typeof resultInputSchema>;
export type EcogestureInput = z.infer<typeof ecogestureInputSchema>;
