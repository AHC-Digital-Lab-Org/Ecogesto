# Prompt completo para generar la Web App EcoGestos según el spec V1

Este prompt cubre **todo lo que pide el documento de requisitos** `Requisitos_App_Web_EcoGestos_AHC.pdf` versión 1.0 (13/06/2026). No se omite ningún punto del MVP. El JSON con los 50 EcoGestos está en `ecogestos.json` en este mismo directorio: cuando el prompt pida adjuntar datos, adjunta ese archivo.

---

## PROMPT (copia desde aquí)

Quiero que generes una aplicación web completa para la **Asociación Huella de Carbono (AHC)** que cumpla **todo el alcance del MVP** descrito en el documento de requisitos funcionales y técnicos versión 1.0. Te paso primero el contexto del proyecto, después el modelo de datos exacto, las pantallas mínimas, los endpoints API, los gráficos obligatorios, los filtros, el flujo de validación editorial, los roles, los KPIs y la integración con Moodle. Quiero que no omitas nada.

Si en algún punto faltan detalles concretos, toma la decisión razonable más alineada con el spec y avísame en un párrafo breve.

### 1. Contexto

La **Asociación Huella de Carbono (AHC)** es una ONG española (sede en Gavà, Barcelona) que ayuda a ciudadanos, empresas, familias y comunidades a medir, reducir y compensar su huella de carbono. Tiene una plataforma educativa propia llamada **Campus Huella de Carbono** basada en **Moodle**.

Un **EcoGesto** es una acción concreta, medible y replicable que reduce o evita impactos ambientales. Un **EcoRecorrido** es una colección ordenada de EcoGestos que forman un itinerario progresivo para un perfil concreto. Un **EcoHéroe** es la persona usuaria que selecciona, ejecuta y registra EcoGestos. Un **EcoGestor** es el rol de coordinación que propone, valida, mejora y publica EcoGestos.

El objetivo del producto es:

- Catálogo público y filtrable de EcoGestos
- Selección de EcoGestos en un plan personal con totalización de impacto y gráficos
- Generación de informes imprimibles y exportables
- Microcurso Moodle asociado a cada EcoGesto con registro de evidencias y emisión de insignias o diplomas
- Sistema de gobierno del dato con flujo editorial, trazabilidad de fuentes y auditoría de cambios
- Base de datos reutilizable para futuras campañas y aplicaciones de IA

### 2. Datos iniciales

Adjunto `ecogestos.json` con 50 EcoGestos en formato lista de objetos. Cada uno tiene los siguientes campos: `codigo`, `nombre`, `resumen`, `categoria`, `subcategoria`, `perfiles` (array), `dificultad`, `coste`, `impacto_estimado` (texto con número y unidad), `periodo`, `guia_pasos` (array), `evidencia`, `moodle`, `fuente`, `icono` (Material Symbols Outlined). El JSON se importa al arrancar la base de datos por primera vez y rellena la tabla `ecogestures` con estado editorial `Borrador`. A partir de ahí los datos se editan desde el panel de administración.

### 3. Identidad de marca AHC

Aplica a rajatabla en todo el frontend:

- Paleta: verde principal `#4F9447`, verde títulos `#537358`, texto `#222A1A`, enlaces `#A5C6A4`, fondo claro `#F4F1E9`, fondo de tarjeta `#FFFFFF`
- Tipografías Google Fonts: **Source Sans 3** (600, 700) para títulos, **Nunito Sans** (400, 600) para cuerpo
- Logo de cabecera en SVG inline con composición "A H C" en verde, subtítulo "ASOCIACIÓN HUELLA DE CARBONO" y una nube con "CO₂" + flecha hacia abajo
- Iconos: **Google Material Symbols Outlined** cargados desde la CDN de Google Fonts. El campo `icono` del JSON es directamente el nombre del símbolo
- Tono motivador, práctico, no culpabilizador. Frases tipo: *"cada gesto cuenta"*, *"elige lo que puedes aplicar"*, *"mejor progreso que perfección"*
- **Prohibido usar emojis** en cualquier parte del UI, en textos de error, en mensajes de éxito, en titulares, en placeholders, en notificaciones, en absolutamente nada. Solo Material Symbols si hace falta un icono

### 4. Stack técnico que quiero

**Frontend**:

- React 18 + Vite + TypeScript estricto
- Tailwind CSS v4 con variables CSS para la paleta AHC
- React Router v6
- TanStack Query para consumo de la API
- React Hook Form + Zod para formularios y validación
- Recharts para gráficos
- Fuse.js para búsqueda fuzzy local
- jsPDF + html2canvas para exportar a PDF
- date-fns para fechas
- i18next con soporte de español por defecto y catalán como segundo idioma

**Backend**:

- Node 22 LTS + Hono (o Express si lo prefieres) + TypeScript estricto
- Prisma ORM
- SQLite por defecto, configurable para migrar a PostgreSQL o MySQL/MariaDB sin cambios de código
- Zod para validación de payloads de API
- Pino para logging estructurado
- Vitest para tests unitarios

**Autenticación**:

- Alias simple sin contraseña como modo inicial (genera token de sesión guardado en cookie httpOnly)
- Soporte preparado para SSO con WordPress y para OAuth2 con Moodle como opciones configurables vía variables de entorno
- 2FA TOTP para roles de administrador (usar `otplib`)

**Integración Moodle**:

- Sincronización por API REST de Moodle (Web Services) en endpoints específicos
- Soporte para enlaces directos a cursos/actividades/badges
- Tabla `moodle_links` que relaciona cada EcoGesto con su curso, actividad, badge y certificado en Moodle

**Multimedia**:

- Storage local en `uploads/` por defecto
- Configurable para S3 compatible (Cloudflare R2, AWS S3) vía env vars
- Cada asset guarda licencia, autor, texto alternativo obligatorio y estado

**Analítica**:

- Panel interno con los KPIs del spec
- Soporte opcional para Matomo configurable vía env

**Despliegue**:

- `Dockerfile` para backend, otro para frontend
- `docker-compose.yml` con servicios web, api, db y un nginx delante
- Variables de entorno documentadas en `.env.example`
- Script `scripts/seed.ts` que importa `ecogestos.json` al arrancar por primera vez

### 5. Roles y permisos (sección 04 del spec)

Implementa estos 8 roles. Cada uno con su set de permisos:

| Rol | Permisos clave |
|-----|----------------|
| Visitante público | Lectura pública sin datos personales. Ve EcoGestos publicados, lee fichas, ve ejemplos, accede a landing pages |
| Usuario registrado | CRUD propio sobre planes y resultados. Lectura del catálogo publicado |
| Ciudadano activista | Igual que usuario más participación en retos y seguimiento |
| Voluntario EcoGestos | Crear propuestas, comentar, sugerir mejoras. No publicar sin validación |
| Tutor EcoGestos | Ver resultados de sus grupos/cohortes. Emitir feedback |
| EcoGestor | CRUD avanzado, workflow de revisión y publicación |
| Administrador AHC | Acceso completo con 2FA obligatorio y trazabilidad |
| Entidad colaboradora | Acceso a datos agregados y planes de su entidad según consentimiento |

### 6. Modelo de datos (sección 06 del spec)

Implementa estas 14 tablas en Prisma. Mantén la separación entre datos maestros, transaccionales, resultados, multimedia, Moodle y analítica.

| Tabla | Campos principales |
|-------|--------------------|
| `users` | id, alias, email, nombre opcional, tipo_usuario, ciudad, pais, fecha_alta, consentimientos (JSON), estado |
| `profiles` | id, user_id, hogar, movilidad, dieta, vivienda, presupuesto, motivaciones, barreras, nivel_compromiso |
| `ecogestures` | id, codigo, nombre, resumen, descripcion, categoria_id, dificultad, coste, impacto, unidad, periodo, estado, version, fecha_alta, fecha_revision, slug, alias_corto, idioma, licencia, autor, validador |
| `ecogesture_steps` | id, ecogesture_id, orden, titulo, descripcion, evidencia_requerida, tiempo_estimado |
| `categories` | id, parent_id, nombre, descripcion, icono, color, orden, activa |
| `impact_factors` | id, ecogesture_id, variable, formula, factor, unidad, fuente, confianza, fecha_revision |
| `media_assets` | id, ecogesture_id, tipo, url, alt_text, licencia, autor, estado |
| `plans` | id, user_id, nombre, objetivo, fecha_creacion, estado, total_co2, total_coste, total_agua, total_plastico |
| `plan_items` | id, plan_id, ecogesture_id, prioridad, porcentaje_aplicacion, plazo, frecuencia, impacto_estimado, coste_estimado, estado |
| `results` | id, user_id, ecogesture_id, plan_item_id, fecha_inicio, fecha_fin, valor, unidad, co2_real, evidencia_url, validacion_estado |
| `ecoroutes` | id, codigo, nombre, descripcion, perfil_objetivo, dificultad_total, impacto_estimado, estado |
| `ecoroute_items` | id, ecoroute_id, ecogesture_id, orden, obligatorio, prerequisito_id |
| `moodle_links` | id, ecogesture_id, course_id, activity_id, enrol_url, badge_id, certificate_template_id |
| `audit_log` | id, usuario, entidad, entidad_id, accion, antes (JSON), despues (JSON), fecha, ip |

Reglas de integridad obligatorias (sección 06.1):

- Un EcoGesto publicado no se borra físicamente si ya ha sido usado; se archiva o se crea una nueva versión
- Los resultados de usuarios no deben depender de valores editables de la ficha viva. Deben guardar copia del factor y fórmula usados en el momento del registro
- Las imágenes y documentos deben tener licencia y texto alternativo para accesibilidad
- Los planes deben poder recalcular impacto estimado pero conservar una versión imprimible histórica
- Los datos personales deben poder anonimizarse sin perder estadísticas agregadas

### 7. Workflow editorial (sección 10 del spec)

Estados editoriales de un EcoGesto y quién actúa en cada transición:

| Estado | Quién actúa | Descripción |
|--------|-------------|-------------|
| Borrador | Autor o voluntario | Se crea una propuesta con contenido mínimo |
| En revisión | EcoGestor o I+D | Se revisa coherencia, fuentes, categoría, cálculo, imagen y licencia |
| Pendiente de cálculo | Equipo técnico/ambiental | Falta fórmula o factor de emisión suficiente. Puede publicarse como "impacto pendiente" si se decide |
| Validado | Responsable AHC | Contenido listo para publicación interna o pública |
| Publicado | Administrador/EcoGestor | Aparece en el catálogo y puede añadirse a planes |
| En revisión periódica | EcoGestor | Se revisa por caducidad, nuevas fuentes, comentarios de usuarios o cambios metodológicos |
| Archivado | Administrador | No se muestra en catálogo, pero mantiene histórico para planes antiguos |

Operaciones de administración (sección 10.1):

- Alta, baja lógica, modificación, consulta y duplicado de EcoGestos
- Importación inicial desde Excel y limpieza de datos
- Gestión de categorías, perfiles, etiquetas, costes y niveles de dificultad
- Carga de imágenes, documentos y vídeos con licencia
- Creación de EcoRecorridos mediante drag and drop u orden numérico
- Revisión masiva de impactos y factores
- Exportación CSV/Excel para análisis
- Panel de auditoría: quién cambió qué y cuándo

### 8. Cálculo de impacto (sección 11 del spec)

Distinguir entre **impacto estimado, impacto declarado por el usuario** e **impacto validado**.

Tipos de cálculo a soportar:

| Tipo | Tratamiento en la app |
|------|----------------------|
| Cálculo directo (kWh evitados × factor) | El usuario introduce dato y el sistema calcula |
| Cálculo por sustitución (km coche → bici) | El usuario indica distancia, frecuencia y medio |
| Cálculo por hábito (apagar router por la noche) | Fórmula basada en supuestos configurables y revisables |
| Cálculo por selección (cambio a renovable) | Se pregunta consumo/base y se aplica factor comparativo |
| Impacto no CO2 (plástico, agua, euros, salud) | Indicador complementario, no siempre sumable con CO2 |

Campos de fórmula obligatorios (sección 11.1) en `impact_factors`:

- `variable_usuario`: nombre de la variable de entrada (`km_semana`, `duchas_semana`, `kWh_mes`...)
- `formula_visible`: expresión textual (`kgCO2 = km_evitar * factor_coche * semanas`)
- `factor`: número y unidad (`0.12 kg CO2/km`)
- `unidad`: `kg CO2e`, `litros`, `kg plástico`, `euros`...
- `periodo`: `dia`, `semana`, `mes`, `año`, `evento`
- `fuente`: MITECO, IDAE, GHG Protocol, literatura, estimación AHC, pendiente
- `confianza`: alta, media, baja, pendiente de validar

### 9. Funcionalidades del selector web (sección 07 del spec)

Implementa estos módulos con sus criterios de aceptación:

| Módulo | Criterio |
|--------|----------|
| Landing pública | El usuario entiende la propuesta en menos de un minuto y puede explorar sin registrarse |
| Catálogo | Filtros se combinan y actualizan resultados sin perder selección |
| Ficha EcoGesto | Debe poder imprimirse como ficha individual y compartirse por URL |
| Perfil inicial | El sistema sugiere EcoGestos compatibles con el perfil y explica por qué |
| Selector | Comparar y seleccionar EcoGestos, indicar porcentaje de aplicación, plazo, prioridad y frecuencia. La selección se guarda y se puede editar antes de generar informe |
| Plan de acción | Vista resumen con acciones agrupadas, totales, gráficos y calendario. El plan puede imprimirse, exportarse y enviarse a Moodle |
| Registro de resultados | Formulario para declarar ejecución, resultado, evidencia y comentarios. El usuario puede ver acumulados por fecha, categoría y EcoRecorrido |
| Mis EcoGestos | Panel personal con acciones pendientes, en curso, completadas y recomendadas. Debe mostrar progreso y siguiente acción sugerida |

Filtros mínimos del catálogo (sección 7.1) — **implementa los 9**:

1. Categoría y subcategoría
2. Perfil (ciudadano, familia, empleado, comunidad, entidad)
3. Coste (sin coste, bajo, medio, alto)
4. Dificultad (muy fácil, fácil, moderada, avanzada, colectiva)
5. Impacto (bajo, moderado, alto, muy alto)
6. Tiempo de implantación y duración
7. Ámbito (hogar, trabajo, movilidad, alimentación, comunidad)
8. Requiere Moodle: sí/no
9. Tiene cálculo validado: sí/no
10. Tiene imagen, vídeo o guía descargable: sí/no

### 10. Plan de acción, informe y gráficos (sección 08 del spec)

Contenido del informe imprimible — **todas estas secciones**:

| Sección | Contenido |
|---------|-----------|
| Portada | Nombre del plan, alias o entidad, fecha, objetivo, número de EcoGestos seleccionados, sello AHC |
| Resumen ejecutivo | Impacto potencial total, coste estimado total, ahorro económico si existe, dificultad media, plazo recomendado |
| Gráficos | CO2 por categoría, coste por categoría, impacto acumulado por plazo, matriz impacto/dificultad |
| Plan priorizado | Tabla de EcoGestos ordenados por impacto, facilidad, coste y plazo |
| Fichas resumidas | Nombre, objetivo, pasos, coste, dificultad, impacto, evidencia y enlace al microcurso |
| Calendario de ejecución | Acciones para hoy, semana 1, mes 1, trimestre y revisión anual |
| Registro de resultados | Espacio o QR para registrar resultados reales en Moodle/app |
| Disclaimer | Impactos estimados, fuentes, nivel de confianza y responsabilidad del usuario en la ejecución |

Gráficos obligatorios del MVP (sección 8.2) — **implementa los 5**:

1. **Barras**: kg CO2 por categoría
2. **Donut**: distribución de acciones por categoría o dificultad
3. **Línea/área**: impacto acumulado por mes o trimestre
4. **Matriz impacto/dificultad**: eje X dificultad, eje Y impacto, tamaño por coste
5. **Ranking Top 10**: EcoGestos con mayor impacto o mejor relación impacto/coste

### 11. Módulo Moodle (sección 09 del spec)

La aplicación web **no sustituye a Moodle**. El selector funciona como puerta de entrada, catálogo y planificador. Moodle funciona como espacio de aprendizaje, validación, registro, evidencias, diplomas e insignias.

Implementa cada uno de estos elementos:

| Elemento Moodle | Requisito |
|-----------------|-----------|
| Curso EcoGesto | Cada EcoGesto importante puede tener un curso breve de 5 a 15 minutos en formato tarjeta o tema único |
| Actividad de aprendizaje | Contenido breve: texto, vídeo, H5P o infografía. Debe explicar el porqué, cómo hacerlo y cómo medirlo |
| Formulario de resultado | Registrar valor, fecha, evidencia, comentario y cálculo estimado. Implementable con Database Activity, Edwiser Forms o plugin propio |
| Finalización | Completar lectura, cuestionario y registro de resultado. Activa badge o desbloquea siguiente EcoGesto |
| EcoRecorrido | Ruta de varios EcoGestos con progresión. Modelable como curso padre, plan de aprendizaje, cohorte o secuencia de cursos |
| Diploma/insignia | Emitir al completar EcoGesto o EcoRecorrido. Incluir nombre, fecha, impacto estimado o real y QR de verificación cuando sea posible |
| Tutoría | Foro o espacio de dudas con tutores EcoGestos. El tutor valida evidencias y ayuda a resolver barreras |

Estructura estándar de un microcurso (sección 9.1):

1. Introducción al EcoGesto y objetivo climático
2. Qué necesito antes de empezar
3. Guía paso a paso con ejemplos y variantes
4. Cómo medir el resultado
5. Actividad práctica: aplicar el EcoGesto
6. Registro de evidencia y resultado
7. Reflexión final: qué he aprendido y a quién puedo inspirar
8. Insignia o certificado al completar

### 12. API REST interna propuesta (sección 13.1 del spec)

Implementa **todos** estos endpoints con sus validaciones de entrada, permisos por rol y respuestas tipadas:

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/ecogestos` | Listar EcoGestos con filtros y paginación |
| GET | `/api/ecogestos/{id}` | Consultar ficha completa |
| POST | `/api/ecogestos` | Crear EcoGesto en borrador |
| PUT | `/api/ecogestos/{id}` | Actualizar ficha |
| PATCH | `/api/ecogestos/{id}/estado` | Cambiar estado editorial |
| GET | `/api/categorias` | Listar taxonomía |
| POST | `/api/planes` | Crear plan |
| POST | `/api/planes/{id}/items` | Añadir EcoGesto al plan |
| GET | `/api/planes/{id}/resumen` | Obtener totales y datos para gráficos |
| POST | `/api/resultados` | Registrar resultado real y evidencia |
| GET | `/api/ecorrecorridos` | Listar EcoRecorridos |
| POST | `/api/moodle/sync` | Sincronizar cursos, finalizaciones o badges |

Añade además los endpoints necesarios para autenticación, gestión de usuarios, gestión de roles, gestión de categorías, gestión de impact_factors, gestión de media_assets y exposición de audit_log para administradores.

### 13. Seguridad, RGPD y accesibilidad (sección 14 del spec)

Implementa **cada uno** de estos puntos:

- Consentimiento explícito para registro, medición, comunicaciones y uso de datos agregados
- Minimización de datos: permitir alias y no exigir nombre completo para uso ciudadano básico
- Separación entre datos personales y resultados agregados
- Derechos RGPD: acceso, rectificación, supresión, portabilidad y anonimización
- Contraseñas seguras (no aplica si solo alias; aplica si SSO o login con contraseña): bcrypt, mínimo 12 caracteres, política configurable
- **2FA obligatorio para administradores** (TOTP, RFC 6238)
- Roles mínimos necesarios y principio de menor privilegio
- Audit log para todas las acciones administrativas con `usuario`, `entidad`, `entidad_id`, `accion`, `antes`, `despues`, `fecha`, `ip`
- Backups automáticos del SQLite/Postgres
- Entorno de staging, control de versiones y recuperación ante errores
- Accesibilidad **WCAG 2.1 AA**: contraste mínimo 4.5:1 para texto normal, navegación completa por teclado, labels claros en formularios, texto alternativo obligatorio en imágenes, mensajes de error con texto explicativo, atributo `lang="es"`, focus visible

### 14. Analítica, cuadros de mando y KPIs (sección 15 del spec)

Implementa un dashboard interno con **estos 9 KPIs**:

| KPI | Definición | Vista |
|-----|------------|-------|
| EcoGestos publicados | Número de fichas activas y validadas | Administración |
| EcoGestos seleccionados | Total de acciones añadidas a planes | Impacto y adopción |
| Planes creados | Planes personales o de entidad generados | Crecimiento |
| Kg CO2 estimados | Suma estimada de planes | Resumen público y privado |
| Kg CO2 registrados | Suma de resultados reales declarados/validados | Dashboard de impacto |
| Tasa de finalización Moodle | Usuarios que completan microcurso o EcoRecorrido | Formación |
| Insignias emitidas | Badges o diplomas por periodo | Gamificación |
| Top categorías | Categorías con mayor selección, finalización o impacto | Decisiones de contenido |
| Calidad de datos | Porcentaje de EcoGestos con cálculo validado y fuente | Gobierno del dato |

### 15. Pantallas mínimas a implementar (sección 12.1 del spec)

**No omitas ninguna**. Cada pantalla debe ser accesible vía React Router y respetar la marca AHC:

1. Landing EcoGestos
2. Catálogo filtrable
3. Ficha EcoGesto (con URL compartible y vista imprimible)
4. Crear/editar plan (selector con porcentaje, plazo, prioridad, frecuencia)
5. Resumen del plan
6. Informe imprimible (vista print-friendly, gráficos incrustados, calendario)
7. Mi progreso (acciones pendientes, en curso, completadas)
8. Registro de resultado (formulario con validación, subida de evidencia)
9. Administración de EcoGestos (tabla, filtros, acciones masivas, edición ficha)
10. Administración de EcoRecorridos (drag and drop, orden, prerequisitos)
11. Dashboard de impacto (los 9 KPIs y los 5 gráficos)

### 16. Historias de usuario principales (sección 16.3 del spec)

Asegúrate de que todas estas funcionan:

- Como visitante, quiero explorar EcoGestos por categoría para entender qué acciones puedo realizar
- Como usuario, quiero seleccionar EcoGestos y guardarlos en un plan para comprometerme con acciones concretas
- Como usuario, quiero ver el CO2 y otros impactos potenciales de mi plan para priorizar mis acciones
- Como usuario, quiero imprimir o descargar mi plan para seguirlo sin depender de la web
- Como usuario, quiero registrar resultados y evidencias para ver mi progreso real
- Como tutor, quiero ver los registros de mi grupo para acompañar y validar resultados
- Como EcoGestor, quiero crear y revisar EcoGestos con fuentes e impacto para publicar contenido fiable
- Como administrador, quiero auditar cambios y permisos para proteger datos y calidad del sistema
- Como entidad, quiero crear un EcoRecorrido recomendado para mi comunidad y ver resultados agregados

### 17. Criterios de aceptación del MVP (sección 17 del spec) — todos obligatorios

| Área | Criterio de aceptación |
|------|------------------------|
| Catálogo | Al menos 50 EcoGestos importados, categorizados, con dificultad, coste, impacto estimado o marcado como pendiente, y estado editorial |
| Ficha | Cada EcoGesto publicado tiene nombre, descripción, guía, categoría, coste, dificultad, periodo, fuente o nota de cálculo, imagen o icono y enlace/estado Moodle |
| Selector | El usuario puede añadir y quitar EcoGestos, indicar porcentaje, plazo, prioridad y guardar el plan |
| Informe | El sistema genera un informe imprimible con resumen, gráficos y tabla de acciones |
| Cálculo | Los totales se recalculan automáticamente al cambiar selección, porcentaje o frecuencia |
| Administración | EcoGestor puede crear, editar, archivar, revisar y publicar fichas sin tocar base de datos |
| Moodle | Existe al menos un microcurso piloto completo con registro, finalización e insignia/diploma |
| Seguridad | Roles diferenciados, datos personales mínimos, consentimiento y auditoría de cambios |
| Accesibilidad | Navegación básica por teclado, contraste aceptable y texto alternativo en imágenes clave |
| Rendimiento | Catálogo con 500 EcoGestos debe cargar y filtrar de forma fluida en navegador estándar |

### 18. Entregables que espero de ti

Construye el proyecto en este orden y entrégamelo archivo por archivo:

1. `README.md` con visión, stack, comandos y estructura
2. `docker-compose.yml`, `Dockerfile` backend, `Dockerfile` frontend, `nginx.conf`
3. `.env.example` con todas las variables documentadas
4. `package.json` del workspace + de backend + de frontend
5. Esquema completo de Prisma (las 14 tablas)
6. Migración inicial
7. Script `scripts/seed.ts` que importa `ecogestos.json` y crea categorías
8. Backend: routers, controladores, servicios, validadores Zod, middlewares de autenticación y rol, helper de audit log
9. Frontend: tokens AHC en Tailwind, layout, router, hooks, componentes, páginas
10. Tests unitarios mínimos del backend
11. Documentación de la API en `/docs/api.md` con cada endpoint y sus permisos
12. Manual de administrador en `/docs/admin.md`
13. Manual de usuario en `/docs/usuario.md`
14. Cuando esté todo, un resumen final de qué se entregó, qué decisiones se tomaron y qué quedó marcado como "fase 2"

Si en algún paso te falta espacio para entregar todo de una vez, párate, dime "voy por el paso N de 14", y te pido "continúa con el siguiente". No omitas pantallas, endpoints, filtros, gráficos, roles, KPIs ni tablas. Si tienes que recortar, recorta profundidad de algún archivo concreto pero conserva todos los elementos enumerados.

Adelante.

---

## FIN DEL PROMPT (no copies esta línea)

## Cómo usarlo

1. Abre un chat nuevo con Claude (claude.ai) o el modelo más capaz al que tengas acceso (Opus, GPT-5, o similar — un modelo flash NO va a poder con esto)
2. Adjunta `ecogestos.json` que está en esta carpeta
3. Pega el contenido entre "## PROMPT (copia desde aquí)" y "## FIN DEL PROMPT"
4. Cuando empiece a entregar, dile "continúa" cada vez que pause hasta llegar al paso 14
5. Pega cada archivo en su ruta, ejecuta `docker-compose up` y deberías tener:
   - Frontend en http://localhost:5173
   - Backend en http://localhost:3000
   - Base de datos SQLite o Postgres según `.env`
6. Para desplegar: subir a un VPS con Docker, o desacoplar frontend a Netlify/Vercel y backend a Render/Fly.io

## Nota honesta

Este alcance es el del **MVP completo del spec** y el propio documento dice (sección 16.2) que está pensado para **6 becarios trabajando 10 semanas**. Un LLM puede generarlo en una sesión larga, pero ten en cuenta:

- Va a producir mucho código, probablemente con bugs que habrá que iterar
- La integración real con Moodle requiere un Moodle de pruebas para verificarla
- Las fórmulas de cálculo del impacto (`impact_factors`) se inicializan vacías; hay que rellenarlas EcoGesto por EcoGesto con factores reales
- El SSO con WordPress/Moodle queda preparado pero la configuración real depende de las credenciales que tenga la AHC

Si el LLM no entrega bien todo en una sesión, el plan B es ir pidiendo módulos sueltos: primero "monta el backend con las 14 tablas y los endpoints", después "monta el frontend público (landing + catálogo + ficha)", después "monta el editor de planes", y así.
