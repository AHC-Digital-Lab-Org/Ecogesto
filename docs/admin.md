# Manual Administrador EcoGestos AHC

## Acceso demo

1. Abre `http://localhost:5173`.
2. Entra con alias `demo-ahc`.
3. El rol demo es `administrador_ahc` y permite ver dashboard, auditoria y cambiar estados.

## Flujo editorial

Estados disponibles:

- `Borrador`
- `En revisión`
- `Pendiente de cálculo`
- `Validado`
- `Publicado`
- `En revisión periódica`
- `Archivado`

Pantalla principal: `/admin/ecogestos`.

Desde esa tabla se revisa codigo, fuente, confianza, impacto y estado. Cada cambio de estado genera entrada en `audit_log`.

## EcoRecorridos y Moodle

Pantalla: `/admin/ecorrecorridos`.

Incluye 4 EcoRecorridos semilla:

- `ECR-01` Primeros pasos en casa
- `ECR-02` Movilidad baja en carbono
- `ECR-03` Cocina y consumo consciente
- `ECR-04` Comunidad que actua

El microcurso piloto es `ECO-AGU-002 - Acortar la ducha a menos de 5 minutos`. La sincronizacion Moodle esta preparada en `/api/moodle/sync`, pero requiere `MOODLE_BASE_URL` y `MOODLE_TOKEN` reales.

## Dashboard

Pantalla: `/dashboard`.

KPIs incluidos:

- EcoGestos publicados
- EcoGestos seleccionados
- Planes creados
- Kg CO2 estimados
- Kg CO2 registrados
- Tasa de finalizacion Moodle
- Insignias emitidas
- Top categorias
- Calidad de datos

## Base de datos local

Comandos:

```bash
npm run db:push
npm run db:seed
```

La base SQLite local queda en `apps/backend/prisma/dev.db`.
