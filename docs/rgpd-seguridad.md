# RGPD y Seguridad

## Principio operativo

La app debe funcionar con minimizacion de datos: alias primero, datos personales opcionales y resultados agregados separados de identidad personal cuando sea posible.

## Datos personales tratados

| Dato | Necesidad | Recomendacion |
|---|---|---|
| Alias | Identificacion basica sin nombre real | Obligatorio |
| Email | Recuperacion/contacto/SSO | Opcional en modo ciudadano |
| Nombre | Certificados o entidades | Opcional |
| Ciudad/pais | Segmentacion agregada | Opcional |
| Perfil de habitos | Recomendaciones | Consentimiento de medicion |
| Evidencias | Validacion de resultados | Minimizar, avisar y permitir borrado |
| Resultados | Impacto y progreso | Separar de datos personales para analitica |

## Consentimientos minimos

- Registro y uso de alias.
- Medicion de EcoGestos y resultados.
- Comunicaciones informativas.
- Uso de datos agregados anonimizados.
- Tratamiento de evidencias subidas.

## Derechos RGPD que deben implementarse

| Derecho | Comportamiento esperado |
|---|---|
| Acceso | Exportar datos del usuario y sus resultados |
| Rectificacion | Editar alias, email, perfil y registros propios |
| Supresion | Borrar o anonimizar datos personales |
| Portabilidad | Export JSON/CSV de datos propios |
| Oposicion | Desactivar comunicaciones y uso no imprescindible |
| Anonimizacion | Mantener estadistica agregada sin identidad |

## Seguridad minima del MVP

- Cookies de sesion `httpOnly`, `sameSite=lax`, `secure` en produccion.
- Roles diferenciados y menor privilegio.
- 2FA TOTP obligatorio para `administrador_ahc`.
- Audit log en acciones administrativas.
- Validacion Zod en todos los payloads.
- CORS restringido a `APP_ORIGIN`.
- Subida de evidencias con limite de tamano, MIME permitidos y ruta no ejecutable.
- Backups periodicos de SQLite/Postgres.
- Entorno staging antes de produccion.

## Matriz de permisos resumida

| Rol | Catalogo | Planes | Resultados | Admin EcoGestos | Usuarios | Auditoria |
|---|---|---|---|---|---|---|
| Visitante publico | Leer publicados | No | No | No | No | No |
| Usuario registrado | Leer publicados | CRUD propio | CRUD propio | No | Propio | No |
| Ciudadano activista | Leer publicados | CRUD propio | CRUD propio | No | Propio | No |
| Voluntario EcoGestos | Leer/proponer | Propio | Propio | Crear borrador | No | No |
| Tutor EcoGestos | Leer | Ver grupos | Validar grupos | Comentar | Grupo | No |
| EcoGestor | CRUD avanzado | Ver agregados | Ver agregados | Validar/publicar | No | Lectura parcial |
| Administrador AHC | Total | Total | Total | Total | Total | Total |
| Entidad colaboradora | Publicados/agregados | Entidad | Agregados entidad | No | No | No |

## Checklist antes de demo externa

- Politica de privacidad revisada.
- Consentimientos visibles y no preengañados.
- Evidencias con aviso de privacidad.
- Usuario puede usar alias sin nombre completo.
- Admin requiere 2FA.
- Audit log registra cambios de estado editorial.
- Backups documentados.
- No hay secretos en repositorio.
- Cabeceras de seguridad configuradas en nginx/hosting.

