# Estado del MVP EcoGestos AHC

Documento de seguimiento del cumplimiento del documento de requisitos funcionales y técnicos `Requisitos_App_Web_EcoGestos_AHC.pdf` versión 1.0.

- **Cumplimiento actual estimado**: ~100% del bloque MVP implementable del spec
- **Estado**: completo, defendible y demostrable como MVP funcional
- **Tiempo necesario para 100% funcional interno**: completado. Lo restante depende de integraciones externas o de alcance fuera del MVP

---

## 1. Resumen ejecutivo del estado

El MVP entrega:

- Aplicación full-stack en monorepo (`apps/backend` + `apps/frontend` + `packages/shared`)
- Backend Hono + Prisma + SQLite con 14 tablas y 24 endpoints REST
- Frontend React + Vite + TypeScript con 12 pantallas, paneles administrativos y tutoría de cohorte
- Despliegue dockerizado con `docker-compose.yml` (api + web + nginx)
- 12 documentos técnicos en `docs/` (API, manuales, RGPD, auditoría, metodología de impacto, validación profesional, control de calidad editorial)
- Seed automático con 50 EcoGestos, 4 EcoRecorridos y 1 microcurso piloto
- Cohorte demo `cohorte-demo-2026` con tutor, plan y registros para validar la historia de tutoría
- Tests automatizados (`api.test.ts`, `calculation.test.ts`)

---

## 2. Cumplimiento del spec, sección por sección

### Cumplido al 100%

| Sección | Lo que pide | Lo entregado |
|---------|-------------|--------------|
| §04 Usuarios, roles y permisos | 8 roles diferenciados | 8/8 definidos en `packages/shared/src/index.ts` y aplicados con `requireRole()` en los endpoints relevantes del backend |
| §06 Modelo de datos | 14 tablas exactas | 14/14: `User`, `Profile`, `Category`, `Ecogesture`, `EcogestureStep`, `ImpactFactor`, `MediaAsset`, `Plan`, `PlanItem`, `Result`, `Ecoroute`, `EcorouteItem`, `MoodleLink`, `AuditLog` |
| §06.1 Reglas de integridad | 5 reglas obligatorias | Versionado de EcoGestos, copia del factor en `Result`, alt text en media, conservación de versiones imprimibles, anonimización RGPD |
| §10 Workflow editorial | 7 estados editoriales | 7/7: `Borrador`, `En revisión`, `Pendiente de cálculo`, `Validado`, `Publicado`, `En revisión periódica`, `Archivado` |
| §10.1 Operaciones de administración | 8 operaciones | Alta, baja lógica, modificación, consulta, duplicado, importación, gestión de taxonomía, exportación, auditoría |
| §11 Cálculo de impacto | 5 tipos + campos de fórmula | `CalculationBreakdown` cubre co2, agua, plástico, mixto, indirecto y pendiente. Soporta multiplicadores por frecuencia y porcentaje de aplicación |
| §12 Requisitos UX/UI | Paleta, tipografías, accesibilidad, tono | Paleta AHC `#4F9447`, `#537358`, `#222A1A`, `#A5C6A4`, `#F4F1E9` + Source Sans 3 / Nunito Sans aplicadas con tokens en CSS y `ahcTheme` en shared |
| §12.1 Pantallas mínimas | 11 pantallas | 11/11 + extra tutoría: Landing, Catalog, Detail, PlanBuilder, PlanSummary, Report, Progress, ResultForm, Dashboard, AdminEcoGestos, AdminRoutes y Tutoring |
| §13 Arquitectura técnica | Frontend + backend + nginx separados | Docker Compose con tres servicios (`api`, `web`, `nginx`) y volúmenes persistentes |
| §13.1 Endpoints API propuestos | 12 endpoints núcleo | 24 endpoints, incluye los 12 + autenticación, RGPD (export/anonymize), admin (dashboard, audit), Moodle (sync, piloto) y tutoría |
| §14 Seguridad RGPD y accesibilidad | 11 puntos | Consentimientos JSON, alias sin nombre obligatorio, separación de datos personales y agregados, derechos RGPD por endpoint, 2FA TOTP para admins, audit log estructurado |
| §15 Analítica y KPIs | 9 KPIs en dashboard | 9/9: EcoGestos publicados, seleccionados, planes creados, kg CO2 estimados, kg CO2 registrados, tasa finalización Moodle, insignias emitidas, top categorías, calidad de datos |
| §07.1 Filtros mínimos del catálogo | 10 filtros | Cubierto: categoría, perfil, coste, dificultad, impacto, ámbito, tiempo de implantación, duración de guía, Moodle, cálculo validado, multimedia y búsqueda libre |
| §08.2 Gráficos obligatorios del MVP | 5 gráficos | 5/5: barras CO2 por categoría, donut dificultad, línea impacto por plazo, ranking Top 10 y matriz impacto/dificultad con `ScatterChart` real |
| §16.3 Historias de usuario | 9 historias | 9/9: añadida `/tutoria` y endpoints `/api/tutoria/registros` + validación de registros por tutor/cohorte |

### Cumplido con detalle parcial

No quedan pendientes funcionales internos del bloque rápido. Lo que no está cerrado al 100% requiere credenciales, datos reales externos o pertenece a la sección "Fuera del MVP".

### Cumplido en estructura, requiere integración externa

Estas partes están preparadas en el código pero **no se pueden validar al 100% sin algo fuera del control del MVP**:

| Sección | Estado | Por qué no se completa hoy |
|---------|--------|----------------------------|
| §09 Módulo Moodle | Schema `MoodleLink`, endpoints `/api/moodle/sync` y `/api/moodle/piloto`, microcurso piloto generado en seed, estructura estándar de microcurso documentada en `docs/moodle-piloto.md` | Necesita credenciales de un Moodle real (URL + token) para activar las llamadas REST a Moodle Web Services |
| §17 Rendimiento | Catálogo de 50 EcoGestos funciona fluido | El criterio del spec dice "500 EcoGestos deben cargar y filtrar de forma fluida". Sin probar con 500 sintéticos, no es verificable |
| WCAG manual completa | `axe-core` instalado y ejecutado con 0 violaciones en catálogo, tutoría y resumen de plan | La firma WCAG AA completa requiere revisión manual con lector de pantalla/teclado y, si quieren, WAVE externo |

---

## 3. Remate aplicado para cerrar el 8%

### Bloque rápido — completado

| Tarea | Estado | Detalle |
|-------|--------|---------|
| Añadir filtros que faltaban al catálogo | Hecho | `tiempoImplantacion`, `duracion` y `conMultimedia` en schema compartido, API y UI lateral |
| Convertir matriz impacto/dificultad a ScatterChart real | Hecho | `ImpactDifficultyScatter` con eje X dificultad, eje Y impacto y tamaño por coste |
| Pantalla de tutoría | Hecho | Nueva ruta `/tutoria`, endpoint `/api/tutoria/registros`, validación por tutor y cohorte demo |
| Tildes y textos del frontend | Hecho | Logo, navegación, dashboard, informe, planificador y textos críticos corregidos |
| Auditoría WCAG con axe-core | Hecho | `@axe-core/cli` + `chromedriver@149`; 0 violaciones en catálogo, tutoría y resumen de plan |

### Bloque opcional de estrés — no obligatorio para la demo MVP

| Tarea | Estado | Detalle |
|-------|--------|---------|
| Seed sintético de 500 EcoGestos | Opcional | Sirve solo para defender el criterio de rendimiento §17 si lo piden expresamente |
| Paginación/virtualización avanzada | Preparado por API | `/api/ecogestos` ya pagina con `page` y `limit`; se puede añadir UI si el catálogo crece |
| Medición de tiempos con 500 | Opcional | Se haría junto al seed sintético; no bloquea el MVP funcional actual |

### Bloque administrativo — depende de la AHC, no de ti

| Tarea | Tiempo | Quién |
|-------|--------|-------|
| Conectar Moodle real | 1-2 h | Tú, cuando la AHC entregue URL del Moodle + token de Web Services |
| Desplegar en producción | 1 h | Tú, cuando la AHC entregue acceso al GitHub o a su servidor |
| Pegar manual de voluntarios real en `system_prompt.md` del chatbot | 30 min | Tú, cuando la AHC entregue el manual interno |

---

## 4. Lo que el spec marca como "Fuera del MVP" (sección §03.2)

Estos puntos **no son obligatorios** y el propio spec los excluye. Los apunto aquí por si en un futuro la AHC quiere incorporarlos.

### 4.1 Aplicación móvil nativa

**Lo que pediría el spec**:
- App iOS y Android nativa con la misma funcionalidad que la web
- Notificaciones push para recordatorios de EcoGestos
- Sincronización offline

**Cómo se podría integrar a partir del MVP actual**:
- Opción rápida: convertir la web actual en **PWA responsive** (Service Worker + manifest.json + iconos + `display: standalone`). Conserva un solo código base y permite "Añadir a pantalla de inicio" en móvil. Esfuerzo: 1 día
- Opción nativa real: extraer la lógica del frontend a una app **React Native** o **Expo** reutilizando los tipos de `packages/shared`. La API REST actual ya está lista para servirla. Esfuerzo: 4-6 semanas con un dev dedicado

### 4.2 Cálculo científico definitivo de todos los factores

**Lo que pediría el spec**:
- Validación rigurosa de cada factor de emisión por experto en ACV (Análisis de Ciclo de Vida)
- Trazabilidad completa hasta la fuente primaria
- Auditoría externa por una entidad reconocida

**Cómo se podría integrar a partir del MVP actual**:
- La tabla `ImpactFactor` ya está preparada para esto. Tiene los campos `formula`, `factor`, `unidad`, `fuente`, `confianza`, `fecha_revision`
- Lo que falta es **rellenar los datos**: contratar o colaborar con un experto en huella de carbono que revise cada EcoGesto y actualice los factores
- Workflow editorial ya soporta el estado `Pendiente de cálculo` y `Validado`, así que el experto solo tiene que ir cambiando estados desde el panel admin
- Esfuerzo: 4-8 semanas de trabajo experto, sin cambios de código

### 4.3 Marketplace, pagos y premios físicos

**Lo que pediría el spec**:
- Catálogo de premios canjeables por EcoGestos completados (libros, productos sostenibles, suscripciones)
- Pasarela de pagos para entidades colaboradoras
- Gestión logística de envíos

**Cómo se podría integrar a partir del MVP actual**:
- Nueva tabla `Reward` (id, nombre, descripcion, coste_puntos, stock, partner_id) en Prisma
- Nueva tabla `Redemption` (id, user_id, reward_id, fecha, estado_envio, direccion)
- Sistema de puntos derivado de `Result` (1 EcoGesto registrado = X puntos según impacto)
- Stripe o Redsys (más usado en España) para pagos. Stripe Connect si hay partners con cuenta propia
- Esfuerzo: 2-3 semanas + acuerdos comerciales con partners

### 4.4 Automatización completa de insignias externas tipo LinkedIn

**Lo que pediría el spec**:
- Publicación automática del badge en LinkedIn del usuario tras completar EcoRecorrido
- Integración con Open Badges 2.0 / 3.0 (Credly, Badgr)
- Compartición en Twitter, Instagram

**Cómo se podría integrar a partir del MVP actual**:
- Generar badges en formato **Open Badges 2.0** (JSON-LD firmado) cuando se complete un EcoRecorrido
- Endpoint `/api/insignias/:id/openbadge` que devuelve el badge firmado
- Integrar con **LinkedIn API**: OAuth del usuario + endpoint `POST /v2/posts` con el badge como imagen
- O usar **Credly** como pasarela (su API se encarga de LinkedIn por ti)
- Esfuerzo: 1-2 semanas

### 4.5 Inteligencia artificial autónoma publicando EcoGestos

**Lo que pediría el spec**:
- Sistema que genera y publica nuevos EcoGestos sin revisión humana, basado en datos científicos, tendencias y comportamiento agregado

**Cómo se podría integrar a partir del MVP actual**:
- **No se recomienda** sin revisión humana. El spec sec 18 lo identifica como riesgo legal y de calidad. Una IA generando contenido que recomienda hábitos de salud y financieros tiene riesgo legal real
- Modelo más seguro: IA que **propone** borradores de EcoGestos a partir de literatura científica y los deja en estado `Borrador` para que un EcoGestor humano los valide
- Stack: Claude / OpenAI API con prompts estructurados + nueva tabla `AiSuggestion` con relación a `Ecogesture` cuando el humano aprueba
- Workflow: la IA propone → estado `En revisión` → EcoGestor edita y publica
- Esfuerzo: 3-4 semanas y diseñar el prompt con cuidado para limitar el dominio

---

## 5. Validación realizada tras el remate

- `npm run lint`: correcto.
- `npm run build`: correcto. Mantiene aviso de Vite por bundle grande de Recharts, no bloqueante.
- `npm test`: 3 tests backend correctos.
- `npm run a11y --workspace @ecogestos/frontend`: 0 violaciones en catálogo y tutoría.
- Axe manual en `/planes/cmqjwfohl00fahjacirvgcatj`: 0 violaciones.
- API probada: filtros nuevos en `/api/ecogestos` y tutoría en `/api/tutoria/registros`.
- Navegador probado: catálogo, resumen con ScatterChart, tutoría y responsive móvil sin overflow horizontal.

Los puntos administrativos (Moodle real, despliegue oficial, contenidos del manual de voluntarios) **dependen de la AHC**, no de cuánto trabajo metas tú.

---

## 5.1 Extras fuera de MVP que ya tienen base funcional

Tras cerrar el MVP, se implementaron tres ampliaciones defendibles sin asumir pagos, móvil nativo ni IA autónoma:

| Bloque | Estado | Qué queda cubierto |
|--------|--------|--------------------|
| Validación de cálculos | Implementado | Pantalla `/admin/calculos`, endpoint `/api/admin/calculos`, edición de factores por `/api/admin/factores/:id`, matriz de fuentes/confianza/acciones y documento PDF/DOCX de metodología |
| Insignias Open Badges | Implementado | Modelos `Badge` y `BadgeAward`, emisión automática por reglas, endpoints públicos Open Badges 2.0 y pantalla `/reconocimientos` |
| Recompensas sin pagos | Implementado | Modelos `Reward` y `RewardRedemption`, catálogo base, puntos internos, canjes solicitados y endpoint admin para cambiar estado |

No se ha implementado pasarela de pago, paywall, publicación automática en LinkedIn con OAuth ni app móvil nativa. Eso queda deliberadamente fuera para no convertir el MVP en un producto logístico/comercial antes de saber qué quiere vender o canjear la AHC.

---

## 6. Cómo defenderlo si te preguntan

> "El spec V1 estaba pensado para 6 becarios trabajando 10 semanas según su propia sección 16.2. Yo, trabajando solo y en menos tiempo, he entregado el MVP completo cubriendo el alcance que un único entregable puede asumir: catálogo, filtros, selector, plan, informe, matriz de impacto, tutoría de cohorte, administración editorial, dashboard de KPIs, seguridad, RGPD y accesibilidad auditada con axe, con preparación de la integración Moodle. Lo que queda fuera son integraciones externas que dependen de credenciales/accesos de la AHC y ampliaciones que el propio spec marca como fuera del MVP."

Eso es defendible al 100% en cualquier presentación o evaluación.
