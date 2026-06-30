import type { User } from "@prisma/client";
import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { prisma } from "../lib/prisma.js";

export type AppVariables = {
  user: User | null;
};

const COOKIE_NAME = "eg_session";

export async function sessionMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const userId = getCookie(c, COOKIE_NAME);
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  c.set("user", user);
  await next();
}

export function writeSession(c: Context, userId: string) {
  setCookie(c, COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90
  });
}

export function requireUser(c: Context<{ Variables: AppVariables }>): User {
  const user = c.get("user");
  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }
  return user;
}

export function requireRole(c: Context<{ Variables: AppVariables }>, roles: string[]): User {
  const user = requireUser(c);
  if (!roles.includes(user.tipoUsuario)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
