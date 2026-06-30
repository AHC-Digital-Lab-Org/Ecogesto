# EcoGestos AHC

Aplicación web MVP para la Asociación Huella de Carbono. Incluye catálogo público de EcoGestos, plan personal, resumen de impacto, informe imprimible, registro de resultados, tutoría de cohorte, administración editorial, EcoRecorridos, KPIs internos e integración preparada con Moodle.

## Stack

- Frontend: React 18, Vite, TypeScript estricto, React Router, TanStack Query, Recharts y CSS con tokens AHC.
- Backend: Node 22, Hono, TypeScript, Prisma, SQLite por defecto, Zod, Pino, Vitest.
- Despliegue: Netlify (frontend estático, vía plantilla de la asociación) + Docker Compose para el stack completo (frontend, API y nginx).

## Estructura

```text
apps/
  backend/   API Hono, Prisma, seed, tests
  frontend/  React/Vite con pantallas MVP
packages/
  shared/    Tipos y constantes compartidas
docs/        API, manual admin y manual usuario
material/    Requisitos y datos fuente
diseño/      Prototipo visual original
```

## Comandos

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Frontend local: http://localhost:5173  
Backend local: http://localhost:3000/api/health

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Entrada nginx: http://localhost:8080

## Despliegue en la organización (Netlify + asociacion-ops)

Este repositorio está adaptado a la **plantilla oficial Node** de la asociación
(`AHC-Digital-Lab-Org/node-template`) y a su pipeline central de CI/CD.

**Cómo funciona el pipeline** (`.github/workflows/main.yml`): al hacer push a `main`,
se invoca el workflow reutilizable `asociacion-ops/netlify-reusable.yml`, que ejecuta
el contrato universal `npm install` → `npm test` → `npm run build` → `netlify deploy --dir=dist`.

Por eso `npm run build` construye **solo el frontend** y copia su salida a `./dist`
(la carpeta que Netlify publica). El backend tiene scripts aparte:

- `npm run build` → frontend estático en `./dist` (lo que despliega Netlify).
- `npm run build:backend` → compila la API (`apps/backend/dist`).
- `npm run build:all` → monorepo completo.

**Frontend ↔ backend.** El frontend lee la URL de la API de `VITE_API_URL`
(definido en `apps/frontend/src/lib/api.ts`, con fallback a `/api`). Netlify solo sirve
estáticos, así que el backend Hono/Prisma debe hospedarse aparte (Docker en
Render/Railway/Fly/VPS) y apuntar `VITE_API_URL` a esa URL pública en
*Site settings → Environment variables* de Netlify.

**Secretos que Ops debe configurar** en el repo/organización (se heredan con
`secrets: inherit`):

- `NETLIFY_AUTH_TOKEN` (secret) — token de la cuenta de Netlify.
- `NETLIFY_SITE_ID` (variable) — id del sitio Netlify destino.

**Pasos para publicarlo en la organización** (no se puede subir directamente; lo crea Ops):

1. Pedir al Coordinador de Proyecto / canal de Ops un repo nuevo en `AHC-Digital-Lab-Org`
   basado en `node-template` (p. ej. `ecogestos-ahc`).
2. Subir este código a ese repo (`git remote add origin … && git push -u origin main`).
3. Ops conecta el sitio Netlify y carga `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID`.
4. El push a `main` despliega el frontend automáticamente; coordinar con Ops el hosting del backend.

## Decisiones

- El modo inicial de autenticacion usa alias sin contrasena y cookie httpOnly firmada.
- WordPress SSO, OAuth Moodle, S3/R2 y Matomo quedan preparados por variables de entorno y adaptadores.
- Moodle se implementa como endpoints de sincronizacion y enlaces de microcurso; requiere credenciales reales para activar llamadas REST.
- El seed importa los 50 EcoGestos de `material/ecogestos.json` y genera categorías, pasos, factores iniciales, 4 EcoRecorridos, una cohorte demo y un microcurso piloto.
- En local, `db:push` aplica la migración SQLite inicial en `apps/backend/prisma/dev.db`.
