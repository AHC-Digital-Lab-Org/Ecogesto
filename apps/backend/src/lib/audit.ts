import type { Context } from "hono";
import { prisma } from "./prisma.js";

export async function auditLog(input: {
  c?: Context;
  usuario: string;
  entidad: string;
  entidadId: string;
  accion: string;
  antes?: unknown;
  despues?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      usuario: input.usuario,
      entidad: input.entidad,
      entidadId: input.entidadId,
      accion: input.accion,
      antes: input.antes === undefined ? undefined : JSON.parse(JSON.stringify(input.antes)),
      despues: input.despues === undefined ? undefined : JSON.parse(JSON.stringify(input.despues)),
      ip: input.c?.req.header("x-forwarded-for") ?? input.c?.req.header("x-real-ip") ?? null
    }
  });
}
