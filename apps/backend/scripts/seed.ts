import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categoryMeta } from "@ecogestos/shared";
import { PrismaClient } from "@prisma/client";
import { seedEcoroutes } from "../src/data/ecoroutes.js";
import { impactFactorFromRaw, normalizeEcogesto, type RawEcogesto } from "../src/services/normalizers.js";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

async function upsertProfile(userId: string, cohortId: string, nivelCompromiso = "medio") {
  const existing = await prisma.profile.findFirst({ where: { userId } });
  const data = {
    cohortId,
    nivelCompromiso,
    motivaciones: ["reducir huella", "aprender hábitos medibles"],
    barreras: ["tiempo", "seguimiento"]
  };
  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data });
  }
  return prisma.profile.create({ data: { userId, ...data } });
}

async function seedBadgesAndRewards() {
  const badges = [
    {
      code: "primer-ecogesto",
      name: "Primer EcoGesto registrado",
      description: "Reconoce a la persona que registra su primer resultado en EcoGestos AHC.",
      criteria: "Registrar al menos un resultado no descartado en el MVP EcoGestos AHC.",
      pointsAwarded: 20,
      rule: { type: "registered_results", count: 1 }
    },
    {
      code: "validacion-tutoria",
      name: "Resultado validado por tutoría",
      description: "Reconoce un resultado revisado y validado por tutor, EcoGestor o equipo técnico.",
      criteria: "Tener al menos un resultado con estado validado_tutor.",
      pointsAwarded: 40,
      rule: { type: "validated_results", count: 1 }
    },
    {
      code: "agua-eficiente",
      name: "Agua eficiente",
      description: "Reconoce la práctica de reducción de consumo de agua en hábitos cotidianos.",
      criteria: "Registrar el EcoGesto ECO-AGU-002 o completar una acción equivalente de ahorro de agua.",
      pointsAwarded: 30,
      rule: { type: "ecogesture_result", ecogestureCode: "ECO-AGU-002", count: 1 }
    }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge
    });
  }

  const rewards = [
    {
      code: "mentoria-ahc-20",
      name: "Mentoría AHC de 20 minutos",
      description: "Sesión breve para revisar un plan personal o preparar una presentación de impacto.",
      provider: "AHC",
      rewardType: "servicio",
      pointsRequired: 90,
      stock: 12,
      terms: "Sujeto a disponibilidad del equipo AHC. No implica pago ni envío físico."
    },
    {
      code: "kit-aula-ecogestos",
      name: "Kit imprimible para aula o entidad",
      description: "Plantillas PDF para dinamizar EcoGestos en un taller, clase o cohorte local.",
      provider: "EcoGestos AHC",
      rewardType: "digital",
      pointsRequired: 50,
      stock: null,
      terms: "Entrega digital dentro del propio ecosistema EcoGestos."
    },
    {
      code: "revision-factor-prioritario",
      name: "Voto de revisión metodológica",
      description: "Permite priorizar un EcoGesto para revisión de fuente, fórmula y factor ambiental.",
      provider: "Equipo EcoGestor",
      rewardType: "participacion",
      pointsRequired: 35,
      stock: null,
      terms: "No garantiza certificación externa; prioriza el trabajo editorial del equipo."
    }
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { code: reward.code },
      update: reward,
      create: reward
    });
  }
}

async function main() {
  const file = await readFile(path.join(root, "material/ecogestos.json"), "utf8");
  const raw = JSON.parse(file) as RawEcogesto[];

  for (const [nombre, meta] of Object.entries(categoryMeta)) {
    await prisma.category.upsert({
      where: { id: meta.id },
      update: { nombre, color: meta.color, icono: meta.icon, activa: true },
      create: {
        id: meta.id,
        nombre,
        descripcion: `Categoria ${nombre} del catalogo EcoGestos AHC`,
        icono: meta.icon,
        color: meta.color,
        orden: Object.keys(categoryMeta).indexOf(nombre),
        activa: true
      }
    });
  }

  for (const item of raw) {
    const normalized = normalizeEcogesto(item);
    const factor = impactFactorFromRaw(item);
    const ecogesture = await prisma.ecogesture.upsert({
      where: { codigo: item.codigo },
      update: {
        nombre: normalized.nombre,
        resumen: normalized.resumen,
        descripcion: normalized.descripcion,
        categoriaId: normalized.categoriaId,
        dificultad: normalized.dificultad,
        coste: normalized.coste,
        impacto: normalized.impacto,
        unidad: normalized.unidad,
        periodo: normalized.periodo,
        estado: normalized.estado,
        subcategoria: normalized.subcategoria,
        perfiles: normalized.perfiles,
        icono: normalized.icono,
        fuente: normalized.fuente,
        confianza: normalized.confianza,
        impactoNivel: normalized.impactoNivel,
        ambito: normalized.ambito,
        fechaRevision: new Date()
      },
      create: {
        codigo: normalized.codigo,
        nombre: normalized.nombre,
        resumen: normalized.resumen,
        descripcion: normalized.descripcion,
        slug: normalized.slug,
        categoriaId: normalized.categoriaId,
        dificultad: normalized.dificultad,
        coste: normalized.coste,
        impacto: normalized.impacto,
        unidad: normalized.unidad,
        periodo: normalized.periodo,
        estado: normalized.estado,
        subcategoria: normalized.subcategoria,
        perfiles: normalized.perfiles,
        icono: normalized.icono,
        fuente: normalized.fuente,
        confianza: normalized.confianza,
        impactoNivel: normalized.impactoNivel,
        ambito: normalized.ambito,
        fechaRevision: new Date()
      }
    });

    await prisma.ecogestureStep.deleteMany({ where: { ecogestureId: ecogesture.id } });
    await prisma.ecogestureStep.createMany({
      data: item.guia_pasos.map((paso, index) => ({
        ecogestureId: ecogesture.id,
        orden: index + 1,
        titulo: `Paso ${index + 1}`,
        descripcion: paso.replace(/^\d+\.\s*/, ""),
        evidenciaRequerida: index === item.guia_pasos.length - 1 ? item.evidencia : null,
        tiempoEstimado: "5-10 min"
      }))
    });

    await prisma.impactFactor.deleteMany({ where: { ecogestureId: ecogesture.id } });
    await prisma.impactFactor.create({ data: { ...factor, ecogestureId: ecogesture.id } });

    await prisma.moodleLink.upsert({
      where: { ecogestureId: ecogesture.id },
      update: {
        syncStatus: item.codigo === "ECO-AGU-002" ? "piloto_preparado" : "pendiente"
      },
      create: {
        ecogestureId: ecogesture.id,
        courseId: item.codigo === "ECO-AGU-002" ? "AHC-ECO-AGU-002" : null,
        activityId: item.codigo === "ECO-AGU-002" ? "registro-ducha-5-min" : null,
        badgeId: item.codigo === "ECO-AGU-002" ? "insignia-ducha-eficiente" : null,
        enrolUrl: item.codigo === "ECO-AGU-002" ? "/moodle/course/AHC-ECO-AGU-002" : null,
        certificateTemplateId: item.codigo === "ECO-AGU-002" ? "cert-ecogesto-ahc" : null,
        syncStatus: item.codigo === "ECO-AGU-002" ? "piloto_preparado" : "pendiente"
      }
    });
  }

  for (const route of seedEcoroutes) {
    const gestures = await prisma.ecogesture.findMany({ where: { codigo: { in: route.items } } });
    const impact = gestures.reduce((sum, item) => sum + item.impacto, 0);
    const ecoroute = await prisma.ecoroute.upsert({
      where: { codigo: route.codigo },
      update: {
        nombre: route.nombre,
        descripcion: route.descripcion,
        perfilObjetivo: route.perfilObjetivo,
        dificultadTotal: route.dificultadTotal,
        impactoEstimado: impact,
        estado: route.estado
      },
      create: {
        codigo: route.codigo,
        nombre: route.nombre,
        descripcion: route.descripcion,
        perfilObjetivo: route.perfilObjetivo,
        dificultadTotal: route.dificultadTotal,
        impactoEstimado: impact,
        estado: route.estado
      }
    });
    await prisma.ecorouteItem.deleteMany({ where: { ecorouteId: ecoroute.id } });
    for (const [index, codigo] of route.items.entries()) {
      const gesture = gestures.find((item) => item.codigo === codigo);
      if (!gesture) continue;
      await prisma.ecorouteItem.create({
        data: {
          ecorouteId: ecoroute.id,
          ecogestureId: gesture.id,
          orden: index + 1,
          obligatorio: index < 2
        }
      });
    }
  }

  await seedBadgesAndRewards();

  const demoUser = await prisma.user.upsert({
    where: { alias: "demo-ahc" },
    update: {
      tipoUsuario: "administrador_ahc",
      twoFactorOn: true
    },
    create: {
      alias: "demo-ahc",
      email: "demo@huelladecarbono.org",
      nombre: "Demo AHC",
      tipoUsuario: "administrador_ahc",
      ciudad: "Gava",
      consentimientos: {
        registro: true,
        medicion: true,
        comunicaciones: false,
        datosAgregados: true
      },
      twoFactorOn: true
    }
  });

  const tutorUser = await prisma.user.upsert({
    where: { alias: "tutor-ahc" },
    update: {
      tipoUsuario: "tutor_ecogestos"
    },
    create: {
      alias: "tutor-ahc",
      email: "tutor@huelladecarbono.org",
      nombre: "Tutor EcoGestos",
      tipoUsuario: "tutor_ecogestos",
      ciudad: "Gava",
      consentimientos: {
        registro: true,
        medicion: true,
        comunicaciones: false,
        datosAgregados: true
      }
    }
  });

  await upsertProfile(demoUser.id, "cohorte-demo-2026", "alto");
  await upsertProfile(tutorUser.id, "cohorte-demo-2026", "alto");

  const demoGestures = await prisma.ecogesture.findMany({
    where: { codigo: { in: ["ECO-MOV-002", "ECO-AGU-002", "ECO-ENE-002"] } },
    include: { impactFactors: true },
    orderBy: { codigo: "asc" }
  });
  let demoPlan = await prisma.plan.findFirst({ where: { userId: demoUser.id, nombre: "Plan cohorte demo" } });
  if (!demoPlan) {
    demoPlan = await prisma.plan.create({
      data: {
        userId: demoUser.id,
        nombre: "Plan cohorte demo",
        objetivo: "Plan de ejemplo para tutoría y validación de registros."
      }
    });
  }
  for (const gesture of demoGestures) {
    await prisma.planItem.upsert({
      where: { planId_ecogestureId: { planId: demoPlan.id, ecogestureId: gesture.id } },
      update: {
        impactoEstimado: gesture.impacto,
        costeEstimado: gesture.coste === "bajo" ? 20 : 0,
        factorSnapshot: gesture.impactFactors[0] ?? null
      },
      create: {
        planId: demoPlan.id,
        ecogestureId: gesture.id,
        prioridad: gesture.codigo === "ECO-AGU-002" ? "Alta" : "Media",
        porcentajeAplicacion: 100,
        plazo: "Mes 1",
        frecuencia: "Semanal",
        impactoEstimado: gesture.impacto,
        costeEstimado: gesture.coste === "bajo" ? 20 : 0,
        estado: "en seguimiento",
        factorSnapshot: gesture.impactFactors[0] ?? null
      }
    });
  }
  await prisma.plan.update({
    where: { id: demoPlan.id },
    data: {
      totalCo2: demoGestures.reduce((sum, gesture) => sum + gesture.impacto, 0),
      totalCoste: demoGestures.reduce((sum, gesture) => sum + (gesture.coste === "bajo" ? 20 : 0), 0),
      snapshot: { seed: true, cohortId: "cohorte-demo-2026" }
    }
  });
  await prisma.result.deleteMany({ where: { userId: demoUser.id, comentario: { contains: "Seed tutoría" } } });
  for (const gesture of demoGestures.slice(0, 2)) {
    const item = await prisma.planItem.findUnique({ where: { planId_ecogestureId: { planId: demoPlan.id, ecogestureId: gesture.id } } });
    await prisma.result.create({
      data: {
        userId: demoUser.id,
        ecogestureId: gesture.id,
        planItemId: item?.id ?? null,
        planId: demoPlan.id,
        fechaInicio: new Date("2026-06-01"),
        fechaFin: new Date("2026-06-15"),
        valor: 100,
        unidad: "porcentaje",
        co2Real: gesture.impacto,
        comentario: "Seed tutoría: registro demostrativo de cohorte.",
        validacionEstado: gesture.codigo === "ECO-AGU-002" ? "declarado" : "validado_tutor",
        factorSnapshot: gesture.impactFactors[0] ?? null
      }
    });
  }

  const badgeRules = await prisma.badge.findMany({ where: { active: true } });
  const demoResults = await prisma.result.findMany({
    where: { userId: demoUser.id, validacionEstado: { not: "descartado" } },
    include: { ecogesture: { include: { category: true } } }
  });
  const registeredResults = demoResults.length;
  const validatedResults = demoResults.filter((result) => result.validacionEstado === "validado_tutor").length;
  const ecogestureCounts = demoResults.reduce<Record<string, number>>((acc, result) => {
    acc[result.ecogesture.codigo] = (acc[result.ecogesture.codigo] ?? 0) + 1;
    return acc;
  }, {});
  for (const badge of badgeRules) {
    const rule = badge.rule as { type?: string; count?: number; ecogestureCode?: string } | null;
    const count = rule?.count ?? 1;
    const eligible =
      rule?.type === "registered_results"
        ? registeredResults >= count
        : rule?.type === "validated_results"
          ? validatedResults >= count
          : rule?.type === "ecogesture_result" && rule.ecogestureCode
            ? (ecogestureCounts[rule.ecogestureCode] ?? 0) >= count
            : false;
    if (!eligible) continue;
    await prisma.badgeAward.upsert({
      where: { badgeId_userId: { badgeId: badge.id, userId: demoUser.id } },
      update: {
        snapshot: { seed: true, rule: badge.rule, registeredResults, validatedResults }
      },
      create: {
        badgeId: badge.id,
        userId: demoUser.id,
        snapshot: { seed: true, rule: badge.rule, registeredResults, validatedResults }
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      usuario: "seed",
      entidad: "sistema",
      entidadId: "seed",
      accion: "seed_mvp",
      despues: { ecogestos: raw.length, ecoroutes: seedEcoroutes.length, badges: 3, rewards: 3 }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
