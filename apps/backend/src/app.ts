import { Hono } from "hono";
import { cors } from "hono/cors";
import { deleteCookie } from "hono/cookie";
import { z } from "zod";
import {
  aliasLoginSchema,
  createPlanSchema,
  costeScore,
  dificultadScore,
  ecogestureFilterSchema,
  ecogestureInputSchema,
  planItemInputSchema,
  resultInputSchema,
  calculateImpact
} from "@ecogestos/shared";
import type { Prisma } from "@prisma/client";
import { auditLog } from "./lib/audit.js";
import { prisma } from "./lib/prisma.js";
import { slugify } from "./lib/slug.js";
import { requireRole, requireUser, sessionMiddleware, writeSession, type AppVariables } from "./middlewares/session.js";
import { totalsForPlanItems } from "./services/plan.js";

export const app = new Hono<{ Variables: AppVariables }>();

app.use(
  "*",
  cors({
    origin: (origin) => origin || process.env.APP_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use("*", sessionMiddleware);

app.onError((error, c) => {
  if (error.message === "AUTH_REQUIRED") {
    return c.json({ error: { code: "AUTH_REQUIRED", message: "Inicia sesión con alias para continuar" } }, 401);
  }
  if (error.message === "FORBIDDEN") {
    return c.json({ error: { code: "FORBIDDEN", message: "No tienes permisos para esta acción" } }, 403);
  }
  console.error(error);
  return c.json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } }, 500);
});

function parseJson<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

function planInclude() {
  return {
    user: true,
    items: {
      include: {
        ecogesture: { include: { category: true, impactFactors: true, moodleLink: true, steps: { orderBy: { orden: "asc" as const } } } },
        results: true
      },
      orderBy: [{ prioridad: "asc" as const }, { plazo: "asc" as const }]
    },
    results: true
  };
}

async function recalculatePlan(planId: string) {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { items: { include: { ecogesture: { include: { category: true, impactFactors: true } } } } }
  });
  if (!plan) return null;
  await Promise.all(
    plan.items.map((item) => {
      const breakdown = calculateImpact(
        {
          codigo: item.ecogesture.codigo,
          nombre: item.ecogesture.nombre,
          categoria: item.ecogesture.category.nombre,
          co2: item.ecogesture.impacto,
          fuente: item.ecogesture.fuente,
          dificultad: item.ecogesture.dificultad,
          coste: item.ecogesture.coste
        },
        { porcentajeAplicacion: item.porcentajeAplicacion, frecuencia: item.frecuencia }
      );
      return prisma.planItem.update({
        where: { id: item.id },
        data: {
          impactoEstimado: breakdown.totals.co2,
          costeEstimado: breakdown.totals.coste,
          factorSnapshot: item.ecogesture.impactFactors[0] ?? { formula: breakdown.formulaVisible, confianza: breakdown.confianza }
        }
      });
    })
  );
  const refreshed = await prisma.plan.findUnique({
    where: { id: planId },
    include: { items: { include: { ecogesture: { include: { category: true } } } } }
  });
  const totals = refreshed ? totalsForPlanItems(refreshed.items) : { co2: 0, agua: 0, plastico: 0, coste: 0 };
  return prisma.plan.update({
    where: { id: planId },
    data: {
      totalCo2: totals.co2,
      totalAgua: totals.agua,
      totalPlastico: totals.plastico,
      totalCoste: totals.coste,
      snapshot: { generatedAt: new Date().toISOString(), totals }
    },
    include: planInclude()
  });
}

type CatalogFilterItem = {
  dificultad: string;
  icono: string;
  mediaAssets: Array<unknown>;
  steps: Array<{ tiempoEstimado: string | null }>;
};

function minutesFromStep(value?: string | null) {
  const numbers = [...(value ?? "").matchAll(/\d+(?:[,.]\d+)?/g)].map((match) => Number(match[0].replace(",", "."))).filter(Number.isFinite);
  if (numbers.length === 0) return 7.5;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
}

function implementationBucket(item: Pick<CatalogFilterItem, "dificultad" | "steps">): "corto" | "medio" | "largo" {
  const stepCount = item.steps.length || 3;
  if (["avanzada", "colectiva"].includes(item.dificultad) || stepCount >= 5) return "largo";
  if (item.dificultad === "moderada" || stepCount >= 4) return "medio";
  return "corto";
}

function durationBucket(item: Pick<CatalogFilterItem, "steps">): "menos_15_min" | "15_30_min" | "mas_30_min" {
  const minutes = item.steps.reduce((sum, step) => sum + minutesFromStep(step.tiempoEstimado), 0);
  if (minutes < 15) return "menos_15_min";
  if (minutes <= 30) return "15_30_min";
  return "mas_30_min";
}

function hasCatalogMedia(item: CatalogFilterItem) {
  return item.mediaAssets.length > 0 || item.icono !== "eco" || item.steps.length > 0;
}

async function cohortForUser(userId: string) {
  const profile = await prisma.profile.findFirst({ where: { userId }, select: { cohortId: true } });
  return profile?.cohortId ?? null;
}

function publicBaseUrl(c: { req: { url: string } }) {
  return process.env.PUBLIC_BASE_URL || new URL(c.req.url).origin;
}

const officialSourcePattern = /MITECO|IDAE|REE|FAO|GHG|ICAO|WRAP|AEMET|ACA|Ag[eè]ncia|Ministerio|BOE|Ley 7\/2022/i;
const technicalSourcePattern = /Oxford|Poore|Nemecek|Ellen MacArthur|Energy Saving Trust|Ecoembes|OCU|AENOR|European Environment Agency|Ecolabel|NOVA|MSCI|Morningstar|Right to Repair|iFixit/i;

function sourceTier(source = "") {
  if (officialSourcePattern.test(source)) return "A - oficial/técnica";
  if (technicalSourcePattern.test(source)) return "B - literatura/sector";
  if (/estimaci[oó]n AHC/i.test(source)) return "C - supuesto AHC";
  return "C - pendiente/mixta";
}

function factorAction(factor: { unidad: string; confianza: string; fuente: string }) {
  if (/indirecto/i.test(factor.unidad)) return "No sumar al total; mantener como indicador indirecto.";
  if (/litros|plastico|plástico/i.test(factor.unidad)) return "Mantener unidad separada y validar factor específico.";
  if (factor.confianza === "alta" && officialSourcePattern.test(factor.fuente)) return "Cerrable con fuente oficial y fórmula visible.";
  if (factor.confianza === "alta") return "Validar rango contra fuente primaria antes de publicar como definitivo.";
  if (factor.confianza === "media") return "Mostrar como estimación con supuestos documentados.";
  return "Dejar como pendiente hasta revisión profesional.";
}

type BadgeRule = {
  type?: string;
  count?: number;
  category?: string;
  ecogestureCode?: string;
};

async function badgeEligibilitySnapshot(userId: string) {
  const results = await prisma.result.findMany({
    where: { userId },
    include: { ecogesture: { include: { category: true } } }
  });
  const registered = results.filter((result) => result.validacionEstado !== "descartado");
  const validated = results.filter((result) => result.validacionEstado === "validado_tutor");
  return {
    registeredResults: registered.length,
    validatedResults: validated.length,
    categories: registered.reduce<Record<string, number>>((acc, result) => {
      acc[result.ecogesture.category.nombre] = (acc[result.ecogesture.category.nombre] ?? 0) + 1;
      return acc;
    }, {}),
    ecogestures: registered.reduce<Record<string, number>>((acc, result) => {
      acc[result.ecogesture.codigo] = (acc[result.ecogesture.codigo] ?? 0) + 1;
      return acc;
    }, {}),
    kgCo2: registered.reduce((sum, result) => sum + result.co2Real, 0)
  };
}

function badgeRuleMatches(rule: BadgeRule | null, snapshot: Awaited<ReturnType<typeof badgeEligibilitySnapshot>>) {
  const count = rule?.count ?? 1;
  if (!rule?.type) return false;
  if (rule.type === "registered_results") return snapshot.registeredResults >= count;
  if (rule.type === "validated_results") return snapshot.validatedResults >= count;
  if (rule.type === "category_results" && rule.category) return (snapshot.categories[rule.category] ?? 0) >= count;
  if (rule.type === "ecogesture_result" && rule.ecogestureCode) return (snapshot.ecogestures[rule.ecogestureCode] ?? 0) >= count;
  return false;
}

async function issueEligibleBadgesForUser(userId: string) {
  const [badges, existing, snapshot] = await Promise.all([
    prisma.badge.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.badgeAward.findMany({ where: { userId }, select: { badgeId: true } }),
    badgeEligibilitySnapshot(userId)
  ]);
  const issuedIds = new Set(existing.map((award) => award.badgeId));
  const toIssue = badges.filter((badge) => !issuedIds.has(badge.id) && badgeRuleMatches((badge.rule ?? null) as BadgeRule | null, snapshot));
  const awards = [];
  for (const badge of toIssue) {
    awards.push(
      await prisma.badgeAward.create({
        data: {
          badgeId: badge.id,
          userId,
          snapshot: {
            issuedBy: "eligibility_engine",
            rule: badge.rule,
            evidence: snapshot
          }
        },
        include: { badge: true }
      })
    );
  }
  return awards;
}

async function userPointsBalance(userId: string) {
  const [results, badgeAwards, redemptions] = await Promise.all([
    prisma.result.findMany({ where: { userId, validacionEstado: { not: "descartado" } } }),
    prisma.badgeAward.findMany({ where: { userId, status: "issued" }, include: { badge: true } }),
    prisma.rewardRedemption.findMany({ where: { userId, status: { notIn: ["cancelado", "rechazado"] } } })
  ]);
  const resultPoints = results.reduce((sum, result) => sum + 10 + Math.min(50, Math.max(0, Math.floor(result.co2Real / 10))), 0);
  const badgePoints = badgeAwards.reduce((sum, award) => sum + award.badge.pointsAwarded, 0);
  const spent = redemptions.reduce((sum, redemption) => sum + redemption.pointsSpent, 0);
  const earned = resultPoints + badgePoints;
  return { earned, spent, available: Math.max(0, earned - spent), resultPoints, badgePoints };
}

function openBadgeImageSvg(name: string, color = "#4F9447") {
  const safe = name.replace(/[<>&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${safe}">
  <rect width="512" height="512" rx="96" fill="#F4F1E9"/>
  <circle cx="256" cy="220" r="128" fill="${color}"/>
  <path d="M180 238l46 46 106-126" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M194 330l-28 108 90-48 90 48-28-108" fill="#537358"/>
  <text x="256" y="82" text-anchor="middle" fill="#222A1A" font-family="Arial, sans-serif" font-size="30" font-weight="700">EcoGestos AHC</text>
  <text x="256" y="480" text-anchor="middle" fill="#222A1A" font-family="Arial, sans-serif" font-size="24" font-weight="700">${safe.slice(0, 28)}</text>
</svg>`;
}

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    name: "EcoGestos AHC API",
    version: "0.1.0",
    time: new Date().toISOString()
  })
);

app.post("/api/auth/alias", async (c) => {
  const input = parseJson(aliasLoginSchema, await c.req.json());
  const consentimientos = (input.consentimientos ?? {
    registro: true,
    medicion: true,
    comunicaciones: false,
    datosAgregados: true
  }) as Prisma.InputJsonValue;
  const user = await prisma.user.upsert({
    where: { alias: input.alias },
    update: {
      email: input.email || null,
      nombre: input.nombre || null,
      ciudad: input.ciudad || null,
      pais: input.pais,
      tipoUsuario: input.tipoUsuario,
      consentimientos
    },
    create: {
      alias: input.alias,
      email: input.email || null,
      nombre: input.nombre || null,
      ciudad: input.ciudad || null,
      pais: input.pais,
      tipoUsuario: input.tipoUsuario,
      consentimientos
    }
  });
  writeSession(c, user.id);
  await auditLog({ c, usuario: user.alias, entidad: "users", entidadId: user.id, accion: "login_alias" });
  return c.json({ data: user });
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, "eg_session", { path: "/" });
  return c.json({ data: { ok: true } });
});

app.get("/api/me", (c) => c.json({ data: c.get("user") }));

app.get("/api/users/me/export", async (c) => {
  const user = requireUser(c);
  const [plans, results] = await Promise.all([
    prisma.plan.findMany({ where: { userId: user.id }, include: planInclude() }),
    prisma.result.findMany({ where: { userId: user.id }, include: { ecogesture: true } })
  ]);
  return c.json({ data: { user, plans, results } });
});

app.post("/api/users/me/anonymize", async (c) => {
  const user = requireUser(c);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      alias: `anon-${user.id.slice(0, 8)}`,
      email: null,
      nombre: null,
      ciudad: null,
      estado: "anonimizado",
      consentimientos: { registro: false, medicion: false, comunicaciones: false, datosAgregados: true }
    }
  });
  await auditLog({ c, usuario: user.alias, entidad: "users", entidadId: user.id, accion: "anonymize", despues: updated });
  return c.json({ data: updated });
});

app.get("/api/categorias", async (c) => {
  const categories = await prisma.category.findMany({ where: { activa: true }, orderBy: { orden: "asc" } });
  return c.json({ data: categories });
});

app.get("/api/ecogestos", async (c) => {
  const query = ecogestureFilterSchema.parse(Object.fromEntries(new URL(c.req.url).searchParams));
  const where: Record<string, unknown> = {};
  if (query.estado) where.estado = query.estado;
  if (query.categoria) where.categoriaId = query.categoria;
  if (query.coste) where.coste = query.coste;
  if (query.dificultad) where.dificultad = query.dificultad;
  if (query.impacto) where.impactoNivel = query.impacto;
  if (query.ambito) where.ambito = query.ambito;
  if (query.calculoValidado !== undefined) where.confianza = query.calculoValidado ? "alta" : { not: "alta" };
  if (query.q) {
    where.OR = [
      { nombre: { contains: query.q } },
      { resumen: { contains: query.q } },
      { codigo: { contains: query.q } },
      { subcategoria: { contains: query.q } }
    ];
  }

  const all = await prisma.ecogesture.findMany({
    where,
    include: { category: true, impactFactors: true, moodleLink: true, mediaAssets: true, steps: { orderBy: { orden: "asc" } } },
    orderBy: [{ estado: "asc" }, { codigo: "asc" }]
  });

  const filtered = all.filter((item) => {
    const perfiles = Array.isArray(item.perfiles) ? item.perfiles.map(String) : [];
    if (query.perfil && !perfiles.includes(query.perfil)) return false;
    if (query.requiereMoodle !== undefined && Boolean(item.moodleLink) !== query.requiereMoodle) return false;
    if (query.conMultimedia !== undefined && hasCatalogMedia(item) !== query.conMultimedia) return false;
    if (query.tiempoImplantacion && implementationBucket(item) !== query.tiempoImplantacion) return false;
    if (query.duracion && durationBucket(item) !== query.duracion) return false;
    if (query.subcategoria && item.subcategoria !== query.subcategoria) return false;
    return true;
  });

  const start = (query.page - 1) * query.limit;
  const page = filtered.slice(start, start + query.limit);
  return c.json({
    data: page,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: filtered.length,
      pages: Math.ceil(filtered.length / query.limit)
    }
  });
});

app.get("/api/ecogestos/:id", async (c) => {
  const id = c.req.param("id");
  const item = await prisma.ecogesture.findFirst({
    where: { OR: [{ id }, { codigo: id }, { slug: id }] },
    include: { category: true, steps: { orderBy: { orden: "asc" } }, impactFactors: true, moodleLink: true, mediaAssets: true }
  });
  if (!item) return c.json({ error: { code: "NOT_FOUND", message: "EcoGesto no encontrado" } }, 404);
  return c.json({ data: item });
});

app.post("/api/ecogestos", async (c) => {
  const user = requireRole(c, ["ecogestor", "administrador_ahc", "voluntario_ecogestos"]);
  const input = parseJson(ecogestureInputSchema, await c.req.json());
  const perfiles = (input.perfiles ?? []) as Prisma.InputJsonValue;
  const created = await prisma.ecogesture.create({
    data: {
      ...input,
      perfiles,
      slug: input.slug || slugify(`${input.codigo}-${input.nombre}`),
      categoriaId: input.categoriaId
    }
  });
  await auditLog({ c, usuario: user.alias, entidad: "ecogestures", entidadId: created.id, accion: "create", despues: created });
  return c.json({ data: created }, 201);
});

app.put("/api/ecogestos/:id", async (c) => {
  const user = requireRole(c, ["ecogestor", "administrador_ahc"]);
  const id = c.req.param("id");
  const before = await prisma.ecogesture.findFirst({ where: { OR: [{ id }, { codigo: id }] } });
  if (!before) return c.json({ error: { code: "NOT_FOUND", message: "EcoGesto no encontrado" } }, 404);
  const input = parseJson(ecogestureInputSchema.partial(), await c.req.json());
  const data: Prisma.EcogestureUpdateInput = {
    ...input,
    ...(input.perfiles ? { perfiles: input.perfiles as Prisma.InputJsonValue } : {}),
    fechaRevision: new Date()
  };
  const updated = await prisma.ecogesture.update({
    where: { id: before.id },
    data
  });
  await auditLog({ c, usuario: user.alias, entidad: "ecogestures", entidadId: updated.id, accion: "update", antes: before, despues: updated });
  return c.json({ data: updated });
});

app.patch("/api/ecogestos/:id/estado", async (c) => {
  const user = requireRole(c, ["ecogestor", "administrador_ahc"]);
  const input = z.object({ estado: z.string() }).parse(await c.req.json());
  const id = c.req.param("id");
  const before = await prisma.ecogesture.findFirst({ where: { OR: [{ id }, { codigo: id }] } });
  if (!before) return c.json({ error: { code: "NOT_FOUND", message: "EcoGesto no encontrado" } }, 404);
  const updated = await prisma.ecogesture.update({ where: { id: before.id }, data: { estado: input.estado, fechaRevision: new Date() } });
  await auditLog({ c, usuario: user.alias, entidad: "ecogestures", entidadId: updated.id, accion: "change_estado", antes: before, despues: updated });
  return c.json({ data: updated });
});

app.post("/api/planes", async (c) => {
  const user = requireUser(c);
  const input = parseJson(createPlanSchema, await c.req.json());
  const items = input.items ?? [];
  const plan = await prisma.plan.create({
    data: {
      userId: user.id,
      nombre: input.nombre,
      objetivo: input.objetivo,
      items: {
        create: items.map((item) => ({
          ecogesture: { connect: { id: item.ecogestureId } },
          prioridad: item.prioridad ?? "Media",
          porcentajeAplicacion: item.porcentajeAplicacion ?? 100,
          plazo: item.plazo ?? "Mes 1",
          frecuencia: item.frecuencia ?? "Semanal",
          estado: item.estado ?? "pendiente"
        }))
      }
    },
    include: planInclude()
  });
  const updated = await recalculatePlan(plan.id);
  await auditLog({ c, usuario: user.alias, entidad: "plans", entidadId: plan.id, accion: "create_plan", despues: updated });
  return c.json({ data: updated }, 201);
});

app.get("/api/planes", async (c) => {
  const user = requireUser(c);
  const plans = await prisma.plan.findMany({ where: { userId: user.id }, include: planInclude(), orderBy: { fechaCreacion: "desc" } });
  return c.json({ data: plans });
});

app.get("/api/planes/:id", async (c) => {
  const user = requireUser(c);
  const plan = await prisma.plan.findFirst({ where: { id: c.req.param("id"), userId: user.id }, include: planInclude() });
  if (!plan) return c.json({ error: { code: "NOT_FOUND", message: "Plan no encontrado" } }, 404);
  return c.json({ data: plan });
});

app.post("/api/planes/:id/items", async (c) => {
  const user = requireUser(c);
  const plan = await prisma.plan.findFirst({ where: { id: c.req.param("id"), userId: user.id } });
  if (!plan) return c.json({ error: { code: "NOT_FOUND", message: "Plan no encontrado" } }, 404);
  const item = planItemInputSchema.parse(await c.req.json());
  await prisma.planItem.upsert({
    where: { planId_ecogestureId: { planId: plan.id, ecogestureId: item.ecogestureId } },
    update: {
      prioridad: item.prioridad ?? "Media",
      porcentajeAplicacion: item.porcentajeAplicacion ?? 100,
      plazo: item.plazo ?? "Mes 1",
      frecuencia: item.frecuencia ?? "Semanal",
      estado: item.estado ?? "pendiente"
    },
    create: {
      planId: plan.id,
      ecogestureId: item.ecogestureId,
      prioridad: item.prioridad ?? "Media",
      porcentajeAplicacion: item.porcentajeAplicacion ?? 100,
      plazo: item.plazo ?? "Mes 1",
      frecuencia: item.frecuencia ?? "Semanal",
      estado: item.estado ?? "pendiente"
    }
  });
  const updated = await recalculatePlan(plan.id);
  await auditLog({ c, usuario: user.alias, entidad: "plans", entidadId: plan.id, accion: "upsert_plan_item", despues: updated });
  return c.json({ data: updated });
});

app.delete("/api/planes/:planId/items/:itemId", async (c) => {
  const user = requireUser(c);
  const plan = await prisma.plan.findFirst({ where: { id: c.req.param("planId"), userId: user.id } });
  if (!plan) return c.json({ error: { code: "NOT_FOUND", message: "Plan no encontrado" } }, 404);
  await prisma.planItem.delete({ where: { id: c.req.param("itemId") } });
  const updated = await recalculatePlan(plan.id);
  return c.json({ data: updated });
});

app.get("/api/planes/:id/resumen", async (c) => {
  const user = requireUser(c);
  const plan = await prisma.plan.findFirst({ where: { id: c.req.param("id"), userId: user.id }, include: planInclude() });
  if (!plan) return c.json({ error: { code: "NOT_FOUND", message: "Plan no encontrado" } }, 404);
  const byCategory = new Map<string, number>();
  const byDifficulty = new Map<string, number>();
  const calendar = new Map<string, number>();
  for (const item of plan.items) {
    byCategory.set(item.ecogesture.category.nombre, (byCategory.get(item.ecogesture.category.nombre) ?? 0) + item.impactoEstimado);
    byDifficulty.set(item.ecogesture.dificultad, (byDifficulty.get(item.ecogesture.dificultad) ?? 0) + 1);
    calendar.set(item.plazo, (calendar.get(item.plazo) ?? 0) + item.impactoEstimado);
  }
  return c.json({
    data: {
      plan,
      charts: {
        co2ByCategory: [...byCategory.entries()].map(([name, value]) => ({ name, value })),
        actionsByDifficulty: [...byDifficulty.entries()].map(([name, value]) => ({ name, value })),
        impactByDeadline: [...calendar.entries()].map(([name, value]) => ({ name, value })),
        impactDifficulty: plan.items.map((item) => ({
          codigo: item.ecogesture.codigo,
          nombre: item.ecogesture.nombre,
          dificultad: item.ecogesture.dificultad,
          dificultadScore: dificultadScore[item.ecogesture.dificultad] ?? 2,
          impacto: item.impactoEstimado,
          coste: item.ecogesture.coste,
          costeScore: (costeScore[item.ecogesture.coste] ?? 1) + 1
        })),
        top10: plan.items
          .map((item) => ({ codigo: item.ecogesture.codigo, nombre: item.ecogesture.nombre, value: item.impactoEstimado }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
      }
    }
  });
});

app.post("/api/resultados", async (c) => {
  const user = requireUser(c);
  const input = parseJson(resultInputSchema, await c.req.json());
  const ecogesture = await prisma.ecogesture.findUnique({ where: { id: input.ecogestureId }, include: { category: true, impactFactors: true } });
  if (!ecogesture) return c.json({ error: { code: "NOT_FOUND", message: "EcoGesto no encontrado" } }, 404);
  const calculated = calculateImpact(
    {
      codigo: ecogesture.codigo,
      nombre: ecogesture.nombre,
      categoria: ecogesture.category.nombre,
      co2: ecogesture.impacto,
      fuente: ecogesture.fuente
    },
    { porcentajeAplicacion: input.unidad.toLowerCase().includes("porcentaje") ? input.valor : 100 }
  );
  const co2Real = input.unidad.toLowerCase().includes("kg") ? input.valor : calculated.totals.co2;
  const result = await prisma.result.create({
    data: {
      userId: user.id,
      ecogestureId: input.ecogestureId,
      planItemId: input.planItemId || null,
      planId: input.planItemId
        ? (await prisma.planItem.findUnique({ where: { id: input.planItemId } }))?.planId
        : null,
      fechaInicio: input.fechaInicio ? new Date(input.fechaInicio) : null,
      fechaFin: input.fechaFin ? new Date(input.fechaFin) : null,
      valor: input.valor,
      unidad: input.unidad,
      co2Real,
      evidenciaUrl: input.evidenciaUrl || null,
      comentario: input.comentario || null,
      validacionEstado: input.validacionEstado,
      factorSnapshot: ecogesture.impactFactors[0] ?? null
    },
    include: { ecogesture: true, planItem: true }
  });
  await auditLog({ c, usuario: user.alias, entidad: "results", entidadId: result.id, accion: "register_result", despues: result });
  await issueEligibleBadgesForUser(user.id);
  return c.json({ data: result }, 201);
});

app.get("/api/resultados", async (c) => {
  const user = requireUser(c);
  const results = await prisma.result.findMany({
    where: { userId: user.id },
    include: { ecogesture: { include: { category: true } }, planItem: true },
    orderBy: { fechaFin: "desc" }
  });
  return c.json({ data: results });
});

app.get("/api/tutoria/registros", async (c) => {
  const user = requireRole(c, ["tutor_ecogestos", "ecogestor", "administrador_ahc"]);
  const requestedCohort = new URL(c.req.url).searchParams.get("cohorte") || undefined;
  const ownCohort = await cohortForUser(user.id);
  const isTutor = user.tipoUsuario === "tutor_ecogestos";
  const cohortId = isTutor ? ownCohort : requestedCohort || ownCohort || undefined;
  const where: Prisma.ResultWhereInput = cohortId ? { user: { profiles: { some: { cohortId } } } } : {};

  const results = await prisma.result.findMany({
    where,
    include: {
      user: { include: { profiles: true } },
      ecogesture: { include: { category: true } },
      plan: true
    },
    orderBy: [{ fechaFin: "desc" }, { fechaInicio: "desc" }],
    take: 100
  });

  const byUser = new Map<string, { alias: string; cohortId: string | null; registros: number; co2Real: number; pendientes: number; validados: number }>();
  const byCategory = new Map<string, number>();

  for (const result of results) {
    const profileCohort = result.user.profiles.find((profile) => profile.cohortId)?.cohortId ?? null;
    const current = byUser.get(result.userId) ?? {
      alias: result.user.alias,
      cohortId: profileCohort,
      registros: 0,
      co2Real: 0,
      pendientes: 0,
      validados: 0
    };
    current.registros += 1;
    current.co2Real += result.co2Real;
    if (result.validacionEstado === "validado_tutor") current.validados += 1;
    if (["declarado", "requiere_revision"].includes(result.validacionEstado)) current.pendientes += 1;
    byUser.set(result.userId, current);
    byCategory.set(result.ecogesture.category.nombre, (byCategory.get(result.ecogesture.category.nombre) ?? 0) + result.co2Real);
  }

  return c.json({
    data: {
      cohortId: cohortId ?? "todas",
      kpis: {
        registros: results.length,
        participantes: byUser.size,
        kgCo2Registrados: results.reduce((sum, result) => sum + result.co2Real, 0),
        pendientesValidacion: results.filter((result) => ["declarado", "requiere_revision"].includes(result.validacionEstado)).length,
        validadosTutor: results.filter((result) => result.validacionEstado === "validado_tutor").length
      },
      byUser: [...byUser.values()].sort((a, b) => b.co2Real - a.co2Real),
      byCategory: [...byCategory.entries()].map(([name, value]) => ({ name, value })),
      recent: results.map((result) => ({
        id: result.id,
        userAlias: result.user.alias,
        cohortId: result.user.profiles.find((profile) => profile.cohortId)?.cohortId ?? null,
        ecogestureCodigo: result.ecogesture.codigo,
        ecogestureNombre: result.ecogesture.nombre,
        categoria: result.ecogesture.category.nombre,
        planNombre: result.plan?.nombre ?? null,
        valor: result.valor,
        unidad: result.unidad,
        co2Real: result.co2Real,
        validacionEstado: result.validacionEstado,
        fechaFin: result.fechaFin
      }))
    }
  });
});

app.patch("/api/tutoria/registros/:id/validacion", async (c) => {
  const user = requireRole(c, ["tutor_ecogestos", "ecogestor", "administrador_ahc"]);
  const input = z.object({
    estado: z.enum(["declarado", "validado_tutor", "requiere_revision", "descartado"]).default("validado_tutor"),
    comentario: z.string().max(1000).optional()
  }).parse(await c.req.json());
  const result = await prisma.result.findUnique({
    where: { id: c.req.param("id") },
    include: { user: { include: { profiles: true } } }
  });
  if (!result) return c.json({ error: { code: "NOT_FOUND", message: "Registro no encontrado" } }, 404);

  if (user.tipoUsuario === "tutor_ecogestos") {
    const ownCohort = await cohortForUser(user.id);
    const resultCohorts = result.user.profiles.map((profile) => profile.cohortId).filter(Boolean);
    if (!ownCohort || !resultCohorts.includes(ownCohort)) throw new Error("FORBIDDEN");
  }

  const comentario = input.comentario
    ? [result.comentario, `[Tutoría] ${input.comentario}`].filter(Boolean).join("\n")
    : result.comentario;
  const updated = await prisma.result.update({
    where: { id: result.id },
    data: { validacionEstado: input.estado, comentario }
  });
  if (input.estado === "validado_tutor") {
    await issueEligibleBadgesForUser(result.userId);
  }
  await auditLog({ c, usuario: user.alias, entidad: "results", entidadId: result.id, accion: "tutor_validate_result", antes: result, despues: updated });
  return c.json({ data: updated });
});

app.get("/api/insignias", async (c) => {
  const user = requireUser(c);
  await issueEligibleBadgesForUser(user.id);
  const [badges, awards, points] = await Promise.all([
    prisma.badge.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.badgeAward.findMany({ where: { userId: user.id }, include: { badge: true }, orderBy: { issuedOn: "desc" } }),
    userPointsBalance(user.id)
  ]);
  const earnedIds = new Set(awards.map((award) => award.badgeId));
  return c.json({
    data: {
      points,
      earned: awards,
      available: badges.filter((badge) => !earnedIds.has(badge.id))
    }
  });
});

app.post("/api/insignias/recalcular", async (c) => {
  const user = requireUser(c);
  const issued = await issueEligibleBadgesForUser(user.id);
  await auditLog({ c, usuario: user.alias, entidad: "badges", entidadId: user.id, accion: "recalculate_badges", despues: { issued: issued.length } });
  return c.json({ data: { issued } });
});

app.get("/api/openbadges/issuer", (c) => {
  const base = publicBaseUrl(c);
  return c.json({
    "@context": "https://w3id.org/openbadges/v2",
    type: "Issuer",
    id: `${base}/api/openbadges/issuer`,
    name: "EcoGestos AHC",
    url: base,
    description: "Insignias educativas del MVP EcoGestos AHC"
  });
});

app.get("/api/openbadges/badges/:id/image.svg", async (c) => {
  const badge = await prisma.badge.findFirst({ where: { OR: [{ id: c.req.param("id") }, { code: c.req.param("id") }] } });
  if (!badge) return c.json({ error: { code: "NOT_FOUND", message: "Insignia no encontrada" } }, 404);
  return new Response(openBadgeImageSvg(badge.name), { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
});

app.get("/api/openbadges/badges/:id", async (c) => {
  const badge = await prisma.badge.findFirst({ where: { OR: [{ id: c.req.param("id") }, { code: c.req.param("id") }] } });
  if (!badge) return c.json({ error: { code: "NOT_FOUND", message: "Insignia no encontrada" } }, 404);
  const base = publicBaseUrl(c);
  return c.json({
    "@context": "https://w3id.org/openbadges/v2",
    type: "BadgeClass",
    id: `${base}/api/openbadges/badges/${badge.id}`,
    name: badge.name,
    description: badge.description,
    image: badge.imageUrl || `${base}/api/openbadges/badges/${badge.id}/image.svg`,
    criteria: { narrative: badge.criteria },
    issuer: `${base}/api/openbadges/issuer`
  });
});

app.get("/api/openbadges/assertions/:id", async (c) => {
  const award = await prisma.badgeAward.findUnique({
    where: { id: c.req.param("id") },
    include: { badge: true, user: true }
  });
  if (!award) return c.json({ error: { code: "NOT_FOUND", message: "Insignia emitida no encontrada" } }, 404);
  const base = publicBaseUrl(c);
  return c.json({
    "@context": "https://w3id.org/openbadges/v2",
    type: "Assertion",
    id: `${base}/api/openbadges/assertions/${award.id}`,
    recipient: {
      type: "id",
      hashed: false,
      identity: `ecogestos:${award.user.alias}`
    },
    issuedOn: award.issuedOn.toISOString(),
    badge: `${base}/api/openbadges/badges/${award.badge.id}`,
    verification: { type: "HostedBadge" },
    evidence: award.evidenceUrl || `${base}/progreso`,
    narrative: `Insignia emitida por EcoGestos AHC para ${award.user.alias}.`
  });
});

app.get("/api/recompensas", async (c) => {
  const user = requireUser(c);
  const [rewards, redemptions, points] = await Promise.all([
    prisma.reward.findMany({ where: { active: true }, orderBy: [{ pointsRequired: "asc" }, { name: "asc" }] }),
    prisma.rewardRedemption.findMany({ where: { userId: user.id, status: { notIn: ["cancelado", "rechazado"] } } }),
    userPointsBalance(user.id)
  ]);
  const redemptionCounts = await prisma.rewardRedemption.groupBy({
    by: ["rewardId"],
    where: { status: { notIn: ["cancelado", "rechazado"] } },
    _count: { rewardId: true }
  });
  const counts = new Map(redemptionCounts.map((item) => [item.rewardId, item._count.rewardId]));
  return c.json({
    data: {
      points,
      redemptions,
      rewards: rewards.map((reward) => {
        const usedStock = counts.get(reward.id) ?? 0;
        const stockLeft = reward.stock === null ? null : Math.max(0, reward.stock - usedStock);
        return {
          ...reward,
          stockLeft,
          alreadyRedeemed: redemptions.some((redemption) => redemption.rewardId === reward.id),
          canRedeem: points.available >= reward.pointsRequired && stockLeft !== 0
        };
      })
    }
  });
});

app.get("/api/recompensas/canjes", async (c) => {
  const user = requireUser(c);
  const redemptions = await prisma.rewardRedemption.findMany({
    where: { userId: user.id },
    include: { reward: true },
    orderBy: { requestedAt: "desc" }
  });
  return c.json({ data: redemptions });
});

app.post("/api/recompensas/:id/canjear", async (c) => {
  const user = requireUser(c);
  const reward = await prisma.reward.findFirst({ where: { OR: [{ id: c.req.param("id") }, { code: c.req.param("id") }], active: true } });
  if (!reward) return c.json({ error: { code: "NOT_FOUND", message: "Recompensa no encontrada" } }, 404);
  const points = await userPointsBalance(user.id);
  if (points.available < reward.pointsRequired) {
    return c.json({ error: { code: "INSUFFICIENT_POINTS", message: "No tienes puntos suficientes para canjear esta recompensa" } }, 409);
  }
  if (reward.stock !== null) {
    const used = await prisma.rewardRedemption.count({ where: { rewardId: reward.id, status: { notIn: ["cancelado", "rechazado"] } } });
    if (used >= reward.stock) return c.json({ error: { code: "OUT_OF_STOCK", message: "Esta recompensa ya no tiene stock disponible" } }, 409);
  }
  const redemption = await prisma.rewardRedemption.create({
    data: {
      rewardId: reward.id,
      userId: user.id,
      pointsSpent: reward.pointsRequired,
      snapshot: { reward, pointsBefore: points }
    },
    include: { reward: true }
  });
  await auditLog({ c, usuario: user.alias, entidad: "reward_redemptions", entidadId: redemption.id, accion: "redeem_reward", despues: redemption });
  return c.json({ data: redemption }, 201);
});

app.get("/api/ecorrecorridos", async (c) => {
  const routes = await prisma.ecoroute.findMany({
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: { ecogesture: { include: { category: true } }, prerequisite: true }
      }
    },
    orderBy: { codigo: "asc" }
  });
  return c.json({ data: routes });
});

app.post("/api/moodle/sync", async (c) => {
  const user = requireRole(c, ["ecogestor", "administrador_ahc"]);
  const input = z.object({ ecogestureId: z.string().optional(), mode: z.enum(["courses", "completions", "badges"]).default("courses") }).parse(await c.req.json());
  await auditLog({ c, usuario: user.alias, entidad: "moodle", entidadId: input.ecogestureId ?? "all", accion: `sync_${input.mode}` });
  return c.json({
    data: {
      status: "prepared",
      mode: input.mode,
      message: "Conector Moodle listo. Requiere MOODLE_BASE_URL y MOODLE_TOKEN para llamadas reales."
    }
  });
});

app.get("/api/moodle/piloto", async (c) => {
  const pilot = await prisma.ecogesture.findUnique({
    where: { codigo: "ECO-AGU-002" },
    include: { moodleLink: true, steps: { orderBy: { orden: "asc" } } }
  });
  return c.json({
    data: {
      ecogesto: pilot,
      estructura: [
        "Introduccion al EcoGesto",
        "Que necesito antes de empezar",
        "Guia paso a paso",
        "Como medir el resultado",
        "Actividad practica",
        "Registro de evidencia",
        "Reflexion final",
        "Insignia EcoGesto AHC"
      ]
    }
  });
});

app.get("/api/admin/calculos", async (c) => {
  requireRole(c, ["ecogestor", "administrador_ahc", "tutor_ecogestos"]);
  const factors = await prisma.impactFactor.findMany({
    include: { ecogesture: { include: { category: true } } },
    orderBy: [{ confianza: "asc" }, { ecogesture: { codigo: "asc" } }]
  });
  const byConfidence = factors.reduce<Record<string, number>>((acc, factor) => {
    acc[factor.confianza] = (acc[factor.confianza] ?? 0) + 1;
    return acc;
  }, {});
  const byTier = factors.reduce<Record<string, number>>((acc, factor) => {
    const tier = sourceTier(factor.fuente);
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});
  const byCategory = factors.reduce<Record<string, { total: number; alta: number; pendiente: number }>>((acc, factor) => {
    const category = factor.ecogesture.category.nombre;
    const current = acc[category] ?? { total: 0, alta: 0, pendiente: 0 };
    current.total += 1;
    if (factor.confianza === "alta") current.alta += 1;
    if (factor.confianza === "pendiente") current.pendiente += 1;
    acc[category] = current;
    return acc;
  }, {});

  return c.json({
    data: {
      summary: {
        totalFactors: factors.length,
        highConfidence: factors.filter((factor) => factor.confianza === "alta").length,
        mediumConfidence: factors.filter((factor) => factor.confianza === "media").length,
        lowOrPending: factors.filter((factor) => ["baja", "pendiente"].includes(factor.confianza)).length,
        byConfidence,
        byTier,
        byCategory
      },
      methodology: {
        formula: "impacto_anual = impacto_base_anual x porcentaje_aplicacion x multiplicador_frecuencia",
        aggregationRule: "Solo se suma lo que comparte unidad, periodo y calidad metodológica suficiente.",
        confidenceLevels: [
          { nivel: "alta", criterio: "Fuente oficial o técnica reconocida y fórmula simple revisable." },
          { nivel: "media", criterio: "Supuesto razonable o fuente reconocible pendiente de cierre profesional." },
          { nivel: "baja", criterio: "Impacto indirecto o variabilidad demasiado alta para sumar." },
          { nivel: "pendiente", criterio: "Falta factor, fórmula o fuente suficiente." }
        ]
      },
      factors: factors.map((factor) => ({
        id: factor.id,
        ecogestureId: factor.ecogestureId,
        codigo: factor.ecogesture.codigo,
        nombre: factor.ecogesture.nombre,
        categoria: factor.ecogesture.category.nombre,
        variable: factor.variable,
        formula: factor.formula,
        factor: factor.factor,
        unidad: factor.unidad,
        fuente: factor.fuente,
        confianza: factor.confianza,
        fechaRevision: factor.fechaRevision,
        tier: sourceTier(factor.fuente),
        action: factorAction(factor)
      }))
    }
  });
});

app.patch("/api/admin/factores/:id", async (c) => {
  const user = requireRole(c, ["ecogestor", "administrador_ahc"]);
  const input = z.object({
    variable: z.string().min(2).optional(),
    formula: z.string().min(6).optional(),
    factor: z.number().nonnegative().optional(),
    unidad: z.string().min(2).optional(),
    fuente: z.string().min(2).optional(),
    confianza: z.enum(["alta", "media", "baja", "pendiente"]).optional()
  }).parse(await c.req.json());
  const before = await prisma.impactFactor.findUnique({ where: { id: c.req.param("id") }, include: { ecogesture: true } });
  if (!before) return c.json({ error: { code: "NOT_FOUND", message: "Factor no encontrado" } }, 404);
  const updated = await prisma.impactFactor.update({
    where: { id: before.id },
    data: { ...input, fechaRevision: new Date() },
    include: { ecogesture: true }
  });
  const ecogestureUpdate: Prisma.EcogestureUpdateInput = {
    fuente: updated.fuente,
    confianza: updated.confianza,
    fechaRevision: new Date()
  };
  if (/co2/i.test(updated.unidad)) {
    ecogestureUpdate.impacto = updated.factor;
    ecogestureUpdate.unidad = updated.unidad;
  }
  await prisma.ecogesture.update({ where: { id: updated.ecogestureId }, data: ecogestureUpdate });
  await auditLog({ c, usuario: user.alias, entidad: "impact_factors", entidadId: updated.id, accion: "update_factor", antes: before, despues: updated });
  return c.json({ data: updated });
});

app.patch("/api/admin/canjes/:id", async (c) => {
  const user = requireRole(c, ["administrador_ahc", "ecogestor", "entidad_colaboradora"]);
  const input = z.object({
    status: z.enum(["solicitado", "aprobado", "entregado", "rechazado", "cancelado"]),
    notes: z.string().max(1000).optional()
  }).parse(await c.req.json());
  const before = await prisma.rewardRedemption.findUnique({ where: { id: c.req.param("id") } });
  if (!before) return c.json({ error: { code: "NOT_FOUND", message: "Canje no encontrado" } }, 404);
  const updated = await prisma.rewardRedemption.update({
    where: { id: before.id },
    data: input,
    include: { reward: true, user: true }
  });
  await auditLog({ c, usuario: user.alias, entidad: "reward_redemptions", entidadId: updated.id, accion: "update_redemption_status", antes: before, despues: updated });
  return c.json({ data: updated });
});

app.get("/api/admin/dashboard", async (c) => {
  requireRole(c, ["ecogestor", "administrador_ahc", "tutor_ecogestos", "entidad_colaboradora"]);
  const [published, selected, plans, estimated, real, totalGestures, validated, topCategories, badgeAwards, rewardRedemptions] = await Promise.all([
    prisma.ecogesture.count({ where: { estado: { in: ["Publicado", "Validado"] } } }),
    prisma.planItem.count(),
    prisma.plan.count(),
    prisma.plan.aggregate({ _sum: { totalCo2: true } }),
    prisma.result.aggregate({ _sum: { co2Real: true } }),
    prisma.ecogesture.count(),
    prisma.ecogesture.count({ where: { confianza: "alta" } }),
    prisma.category.findMany({ include: { ecogestures: { include: { planItems: true } } }, orderBy: { orden: "asc" } }),
    prisma.badgeAward.count(),
    prisma.rewardRedemption.count({ where: { status: { notIn: ["cancelado", "rechazado"] } } })
  ]);
  const categories = topCategories
    .map((category) => ({
      name: category.nombre,
      value: category.ecogestures.reduce((sum, gesture) => sum + gesture.planItems.length, 0),
      impact: category.ecogestures.reduce((sum, gesture) => sum + gesture.impacto, 0)
    }))
    .sort((a, b) => b.value - a.value);
  return c.json({
    data: {
      kpis: {
        ecogestosPublicados: published,
        ecogestosSeleccionados: selected,
        planesCreados: plans,
        kgCo2Estimados: estimated._sum.totalCo2 ?? 0,
        kgCo2Registrados: real._sum.co2Real ?? 0,
        tasaFinalizacionMoodle: 0,
        insigniasEmitidas: badgeAwards,
        canjesSolicitados: rewardRedemptions,
        topCategorias: categories.slice(0, 5),
        calidadDatos: totalGestures ? Math.round((validated / totalGestures) * 100) : 0
      },
      charts: { topCategories: categories }
    }
  });
});

app.get("/api/admin/audit", async (c) => {
  requireRole(c, ["administrador_ahc", "ecogestor"]);
  const logs = await prisma.auditLog.findMany({ orderBy: { fecha: "desc" }, take: 100 });
  return c.json({ data: logs });
});
