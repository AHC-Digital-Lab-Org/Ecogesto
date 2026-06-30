# Auditoria Funcional MVP EcoGestos AHC

## Entregado

| Bloque | Estado | Evidencia |
|---|---|---|
| Catalogo | Completo | 50 EcoGestos importados desde `material/ecogestos.json` |
| Fichas | Completo | URL individual, pasos, fuente, confianza, Moodle y print |
| Selector | Completo | Seleccion, porcentaje, plazo, prioridad y frecuencia |
| Plan | Completo | Guardado en SQLite con items y snapshot |
| Calculo | Completo v0.1 | Motor compartido en `packages/shared/src/calculations.ts` |
| Informe | Completo | Vista imprimible/exportable a PDF desde navegador |
| Resultados | Completo | Registro de valor, unidad, fechas, evidencia y comentario |
| Progreso | Completo | Planes, seleccionados, CO2 estimado y CO2 registrado |
| Admin EcoGestos | Completo | Tabla editorial y cambio de estado |
| Admin EcoRecorridos | Completo | 4 rutas semilla y microcurso piloto |
| Dashboard | Completo | 9 KPIs y graficos |
| Auditoria | Completo | `audit_log` para login, planes, resultados y cambios admin |
| RGPD | MVP | Alias, consentimiento, exportacion y anonimizacion |
| Moodle | Preparado | Endpoint sync y piloto ECO-AGU-002 sin credenciales reales |

## Validaciones realizadas

- `npm run lint`: TypeScript limpio en shared, backend y frontend.
- `npm run build`: build completo de shared, API y web.
- `npm test`: 3 tests backend/calculo correctos.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- API local:
  - `/api/health` correcto.
  - `/api/ecogestos?limit=3` devuelve datos.
  - Login alias y creacion de plan correctos.
- Browser:
  - Landing renderiza.
  - Catalogo muestra 50 tarjetas.
  - Plan permite guardar desde UI.
  - Dashboard muestra 8 tarjetas KPI visibles.
  - Progreso muestra plan guardado.
  - Sin overflow horizontal en vista estrecha ni desktop.

## Decisiones tecnicas

- SQLite local para MVP, migracion inicial SQL explicita por estabilidad.
- Prisma Client se mantiene como ORM de la API.
- Sesion por alias con cookie httpOnly.
- Exportacion PDF mediante imprimir/guardar como PDF del navegador.
- Los factores se guardan como snapshot para no depender de cambios futuros de ficha.
- CO2, agua, plastico y euros se agregan por separado.

## Fase 2 realista

- Credenciales Moodle reales y prueba de Web Services.
- SSO WordPress/Moodle.
- Subida real de archivos/evidencias.
- Edicion completa de formulas por UI.
- Validacion profesional externa de factores.
- Code splitting del frontend si el catalogo crece mucho.
