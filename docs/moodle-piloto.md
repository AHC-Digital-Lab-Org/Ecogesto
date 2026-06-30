# Moodle Piloto EcoGestos

## Enfoque recomendado

No duplicar Moodle dentro de la web. La web sirve para explorar, seleccionar y planificar. Moodle sirve para aprender, registrar evidencia, recibir feedback y emitir insignia/certificado.

## Microcurso piloto recomendado

EcoGesto piloto: `ECO-AGU-002 - Acortar la ducha a menos de 5 minutos`

Motivo:

- Es facil de entender.
- Tiene medicion clara en minutos/litros.
- Requiere poca inversion.
- Permite evidencia simple.
- Es apto para ciudadano y familia.

## Estructura del microcurso de 10 minutos

| Bloque | Contenido | Criterio de finalizacion |
|---|---|---|
| 1. Introduccion | Que es el EcoGesto y objetivo climatico | Lectura vista |
| 2. Antes de empezar | Temporizador, ducha, caudal aproximado | Checklist completado |
| 3. Guia paso a paso | Temporizador, cerrar grifo al enjabonarse, cabezal eficiente | Lectura vista |
| 4. Medicion | Minutos antes/despues, duchas por semana, litros estimados | Mini cuestionario |
| 5. Actividad practica | Aplicar durante 7 dias | Tarea/Database Activity |
| 6. Evidencia | Captura temporizador o registro semanal | Archivo o texto enviado |
| 7. Reflexion | Barreras y aprendizaje | Campo obligatorio |
| 8. Insignia | EcoGesto completado | Completion + validacion tutor |

## Campos del formulario Moodle

- Codigo EcoGesto.
- Usuario Moodle.
- Fecha inicio.
- Fecha fin.
- Valor declarado.
- Unidad.
- Evidencia.
- Comentario.
- Consentimiento para uso agregado.
- Validacion tutor.
- Impacto estimado calculado.

## Certificado / insignia

Debe incluir:

- Nombre o alias.
- Codigo y nombre del EcoGesto.
- Fecha de finalizacion.
- Impacto estimado o real, con disclaimer.
- QR o URL de verificacion si Moodle lo permite.
- Marca AHC.

## Sincronizacion con la web

Endpoint preparado: `POST /api/moodle/sync`

Eventos esperados:

- Crear o actualizar enlaces de curso/actividad/badge.
- Importar finalizaciones.
- Importar insignias emitidas.
- Actualizar estado Moodle de cada EcoGesto.

## Variables necesarias

- `MOODLE_BASE_URL`
- `MOODLE_TOKEN`
- `MOODLE_SERVICE`
- IDs de curso, actividad, badge y certificado por EcoGesto.

## Pendiente de admin Moodle

- Confirmar version Moodle.
- Confirmar plugins disponibles: Database Activity, Edwiser Forms, H5P, Certificates, Badges.
- Crear Web Service y token con permisos minimos.
- Definir plantilla de curso reutilizable.
- Definir si EcoRecorrido es curso padre, cohorte, programa o secuencia de cursos.

