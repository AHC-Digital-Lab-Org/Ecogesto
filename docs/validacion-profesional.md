# Paquete de Validacion Profesional EcoGestos AHC

## Objetivo

Este documento separa lo que puede quedar implementado tecnicamente en el MVP de lo que debe ser validado por perfiles profesionales antes de publicarse como dato fiable, cumplimiento legal o integracion operativa.

Fuente principal: `material/Requisitos_App_Web_EcoGestos_AHC.pdf`, version 1.0, 13/06/2026. El propio documento indica que el calculo cientifico definitivo de todos los factores queda fuera del MVP inicial y que el arranque debe hacerse con formula, fuente y validacion manual.

## Decision recomendada para ir al punto

La ruta mas corta y profesional es esta:

1. Publicar el MVP con los 50 EcoGestos como catalogo operativo, pero con estado editorial y confianza visibles.
2. Marcar cada impacto como `validado`, `estimacion AHC`, `pendiente de calculo` o `impacto indirecto`.
3. No sumar indicadores no comparables: CO2 por separado, agua por separado, plastico por separado y euros por separado.
4. Elegir 10 EcoGestos prioritarios para validacion ambiental profunda, no intentar validar los 50 el primer dia.
5. Crear un microcurso Moodle piloto para 1 EcoGesto y 1 EcoRecorrido.
6. Pasar RGPD, seguridad y accesibilidad por checklist antes de demo externa.

## Matriz de responsabilidades

| Area | Responsable recomendado | Entregable que debe firmar | Riesgo si no se valida |
|---|---|---|---|
| Calculo ambiental | Tecnico ambiental / consultor huella carbono | Metodologia, factores, formulas y niveles de confianza | Perder credibilidad por impactos incorrectos |
| Modelo matematico | Perfil datos / matematico aplicado | Reglas de agregacion, ponderacion y ranking | Sumar indicadores incompatibles o priorizar mal |
| RGPD | Legal / DPO / asesor privacidad | Politica de privacidad, consentimientos y derechos | Incumplimiento legal por datos personales/evidencias |
| Seguridad | AppSec / responsable IT | Revision de roles, 2FA, cookies, subida de archivos, backups | Exposicion de datos o acceso indebido al panel |
| Moodle | Admin Moodle / e-learning | Plantilla de microcurso, finalizacion, badges y certificados | Duplicidad web-Moodle y certificados no verificables |
| Editorial AHC | EcoGestor / contenidos | Fichas, tono, fuentes, imagenes, licencias y estados | Contenido incoherente o no publicable |
| Marca y accesibilidad | Diseno / UX / accesibilidad | Pantallas aprobadas, WCAG AA basico, guia visual | Rechazo por no parecer AHC o por mala usabilidad |

## Semaforo para el MVP

| Bloque | Estado recomendado | Criterio de salida |
|---|---|---|
| Catalogo | Verde tecnico, amarillo editorial | 50 EcoGestos importados, categorizados y con estado editorial |
| Planificador | Verde tecnico | Seleccion, porcentaje, plazo, prioridad, frecuencia y recalculo |
| Informe | Verde tecnico, amarillo ambiental | Imprime resumen, graficos, tabla, disclaimer y fuentes |
| Calculos | Amarillo | Formula y fuente visibles; confianza marcada; no afirmar precision cientifica sin revision |
| Moodle | Amarillo | Enlaces y sync preparados; piloto real pendiente de credenciales/configuracion |
| RGPD | Amarillo/Rojo hasta revision legal | Consentimientos, alias, anonimización y textos legales aprobados |
| Seguridad | Amarillo | Roles, cookie httpOnly, auditoria y 2FA admin implementados; pentest pendiente |
| Marca | Verde si se respeta guia | Paleta, tipografia, logo, tono y responsive revisados |

## Lo que no debe fingirse

- Factores oficiales no comprobados.
- Certificados Moodle si no existe curso, badge y criterio de finalizacion.
- Cumplimiento RGPD definitivo sin revision legal.
- Seguridad auditada sin pruebas especificas.
- Validacion cientifica de impactos indirectos como finanzas o comunidad.

## Entregables creados en este paquete

- `docs/metodologia-impacto.md`
- `docs/rgpd-seguridad.md`
- `docs/moodle-piloto.md`
- `docs/control-calidad-editorial.md`
- `docs/marca-accesibilidad.md`
- `docs/matriz-validacion-ecogestos.csv`
- `docs/plan-al-punto.md`
