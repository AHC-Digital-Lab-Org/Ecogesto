# API EcoGestos AHC MVP

Base local: `http://localhost:3000/api`

## Salud y sesión

| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| GET | `/health` | Público | Estado de la API |
| POST | `/auth/alias` | Público | Crea/abre sesión por alias con cookie httpOnly |
| POST | `/auth/logout` | Usuario | Cierra sesión |
| GET | `/me` | Público | Devuelve usuario actual o `null` |
| GET | `/users/me/export` | Usuario | Exporta datos propios RGPD |
| POST | `/users/me/anonymize` | Usuario | Anonimiza datos personales |

## Catálogo

| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| GET | `/categorias` | Público | Lista categorías activas |
| GET | `/ecogestos` | Público | Lista EcoGestos con filtros y paginación |
| GET | `/ecogestos/{id}` | Público | Consulta por `id`, `codigo` o `slug` |
| POST | `/ecogestos` | Voluntario/EcoGestor/Admin | Crea EcoGesto en borrador |
| PUT | `/ecogestos/{id}` | EcoGestor/Admin | Actualiza ficha |
| PATCH | `/ecogestos/{id}/estado` | EcoGestor/Admin | Cambia estado editorial |

Filtros soportados en `/ecogestos`: `q`, `categoria`, `subcategoria`, `perfil`, `coste`, `dificultad`, `impacto`, `ambito`, `tiempoImplantacion`, `duracion`, `requiereMoodle`, `calculoValidado`, `conMultimedia`, `estado`, `page`, `limit`.

## Planes y resultados

| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| POST | `/planes` | Usuario | Crea plan con items |
| GET | `/planes` | Usuario | Lista planes propios |
| GET | `/planes/{id}` | Usuario | Consulta plan propio |
| POST | `/planes/{id}/items` | Usuario | Añade/actualiza item |
| DELETE | `/planes/{planId}/items/{itemId}` | Usuario | Quita item |
| GET | `/planes/{id}/resumen` | Usuario | Totales, datos de gráficos y matriz impacto/dificultad |
| POST | `/resultados` | Usuario | Registra resultado y evidencia |
| GET | `/resultados` | Usuario | Lista resultados propios |

## Insignias Open Badges y recompensas

| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| GET | `/insignias` | Usuario | Lista insignias emitidas, disponibles y saldo de puntos |
| POST | `/insignias/recalcular` | Usuario | Reevalúa reglas y emite insignias elegibles |
| GET | `/openbadges/issuer` | Público | Emisor Open Badges 2.0 |
| GET | `/openbadges/badges/{id}` | Público | BadgeClass Open Badges 2.0 |
| GET | `/openbadges/badges/{id}/image.svg` | Público | Imagen SVG de la insignia |
| GET | `/openbadges/assertions/{id}` | Público | Assertion hospedada de una insignia emitida |
| GET | `/recompensas` | Usuario | Catálogo de recompensas sin pagos, saldo y canjes activos |
| GET | `/recompensas/canjes` | Usuario | Canjes propios |
| POST | `/recompensas/{id}/canjear` | Usuario | Solicita un canje con puntos internos |

## Tutoría, EcoRecorridos, Moodle y admin

| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| GET | `/tutoria/registros` | Tutor/EcoGestor/Admin | Registros de la cohorte del tutor o de todas las cohortes para admin |
| PATCH | `/tutoria/registros/{id}/validacion` | Tutor/EcoGestor/Admin | Marca un registro como validado, en revisión o descartado |
| GET | `/ecorrecorridos` | Público | Lista rutas ordenadas |
| GET | `/moodle/piloto` | Público | Microcurso piloto ECO-AGU-002 |
| POST | `/moodle/sync` | EcoGestor/Admin | Simula sync; preparado para credenciales reales |
| GET | `/admin/calculos` | Tutor/EcoGestor/Admin | Matriz de factores, fuentes, confianza y acciones recomendadas |
| PATCH | `/admin/factores/{id}` | EcoGestor/Admin | Actualiza fórmula, fuente, factor o confianza de un factor |
| PATCH | `/admin/canjes/{id}` | EcoGestor/Admin/Entidad | Cambia estado de un canje solicitado |
| GET | `/admin/dashboard` | Tutor/EcoGestor/Admin/Entidad | KPIs internos |
| GET | `/admin/audit` | EcoGestor/Admin | Últimos cambios auditados |

Notas de alcance:

- Las recompensas no incluyen pagos ni pasarela. El canje solo crea una solicitud interna con estado editorial/logístico.
- Las insignias siguen el formato Open Badges 2.0 hospedado. La publicación automática en LinkedIn queda preparada a nivel de assertion pública, pero no usa OAuth ni publica en redes por el usuario.
- La matriz de cálculos mantiene la posición metodológica del MVP: estimaciones auditables, unidades separadas y confianza explícita, no certificación externa.

## Modelo de respuesta

Exito:

```json
{ "data": {} }
```

Error:

```json
{ "error": { "code": "AUTH_REQUIRED", "message": "Inicia sesión con alias para continuar" } }
```
