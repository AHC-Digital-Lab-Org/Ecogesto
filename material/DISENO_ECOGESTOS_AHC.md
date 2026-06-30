# Diseño EcoGestos AHC

## Diagnóstico rápido

El archivo `PROMPT_WEB_APP.md` describe un MVP muy grande: app pública, catálogo, planificador, informes, progreso personal, registro de evidencias, administración editorial, EcoRecorridos, dashboard, roles, Moodle, seguridad, accesibilidad y despliegue.

Para una sola persona, el riesgo no está en elegir un MCP "de diseño", sino en intentar diseñarlo todo al mismo nivel desde el primer día. Conviene separar el trabajo en una base visual sólida y tres flujos prioritarios.

## MCP y herramientas que sí sirven

### 1. Figma MCP

Útil si existe un archivo de Figma de la AHC o se quiere crear un prototipo visual externo antes de programar.

Sirve para:

- Leer variables, estilos, componentes y frames de Figma.
- Convertir pantallas aprobadas en componentes frontend.
- Comparar implementación contra diseño.

Estado actual: no aparece activo en esta sesión. Si tienes un enlace de Figma o quieres trabajar con Figma, habría que activar/instalar ese MCP o darme acceso al archivo.

### 2. Browser / Playwright / screenshots

Es la herramienta más útil si diseñamos en código directamente.

Sirve para:

- Levantar la app local.
- Ver capturas desktop y móvil.
- Detectar solapes, problemas de responsive, contrastes visuales y pantallas vacías.
- Iterar diseño real, no solo imaginarlo.

Recomendación: para este proyecto, diseñar en React/Tailwind y verificar con navegador es más rápido que hacer primero un Figma completo.

### 3. Image generation

Útil solo para assets puntuales: imagen hero, ilustraciones suaves de acompañamiento, texturas o mockups.

No debería ser la base del sistema visual, porque el producto depende más de claridad, confianza y datos que de ilustración decorativa.

### 4. PDF / DOCX / Spreadsheet tools

Útiles para extraer requisitos, inventarios y marca desde documentos fuente.

No son herramientas de diseño visual final, pero ayudan a convertir requisitos en pantallas, datos y criterios de aceptación.

## Dirección visual recomendada

### Concepto

Una herramienta de acción climática cotidiana: clara, cercana, práctica y fiable. Más "cuaderno de progreso con datos" que landing de ONG decorativa.

### Tono

- Motivador sin culpa.
- Didáctico sin infantilizar.
- Operativo para personas que quieren elegir acciones concretas.
- Riguroso para AHC, EcoGestores y entidades.

### Estilo

Usar la marca AHC de forma sobria:

- Fondo claro `#F4F1E9`.
- Verde principal `#4F9447`.
- Verde de títulos `#537358`.
- Texto `#222A1A`.
- Tarjetas blancas, pero sin abusar de "card dentro de card".
- Material Symbols como sistema de iconos.
- Source Sans 3 para títulos.
- Nunito Sans para cuerpo.

Evitar:

- Aspecto de plantilla SaaS genérica.
- Gradientes morados o estética IA.
- Hero enorme que tape la funcionalidad.
- Gamificación con emojis.
- Demasiada decoración naturalista.

## Sistema de pantallas por prioridad

### Fase 1: Producto público usable

Objetivo: que alguien entienda EcoGestos, filtre acciones y guarde un plan básico.

Pantallas:

1. Landing EcoGestos.
2. Catálogo filtrable.
3. Ficha EcoGesto.
4. Selector / crear plan.
5. Resumen del plan.
6. Informe imprimible.

Componentes clave:

- App shell con cabecera AHC.
- Buscador y filtros.
- Tarjeta EcoGesto.
- Ficha detallada.
- Panel de selección persistente.
- Resumen de impacto.
- Gráficos MVP.
- Vista print-friendly.

### Fase 2: Seguimiento personal

Objetivo: que la persona vuelva y registre avances.

Pantallas:

1. Mi progreso.
2. Registro de resultado.
3. Evidencias.
4. Estado Moodle.

Componentes clave:

- Lista de acciones pendientes/en curso/completadas.
- Formulario de resultado.
- Subida de evidencia.
- Historial de impacto.
- Próxima acción sugerida.

### Fase 3: Gobierno interno

Objetivo: que AHC pueda mantener calidad de datos y publicar contenido.

Pantallas:

1. Administración de EcoGestos.
2. Edición de ficha.
3. Workflow editorial.
4. EcoRecorridos.
5. Dashboard de impacto.
6. Audit log.

Componentes clave:

- Tabla densa con filtros.
- Estado editorial visible.
- Editor por secciones.
- Validación de fuentes e impacto.
- KPIs internos.
- Vista de auditoría.

## Primera entrega recomendable

Antes de construir backend completo, diseñaría un frontend navegable con datos locales desde `ecogestos.json`.

Debe incluir:

- Tokens de marca AHC.
- Layout responsive.
- Landing compacta.
- Catálogo real con los 50 EcoGestos.
- Ficha EcoGesto real.
- Selector de plan en memoria/localStorage.
- Resumen con gráficos.
- Vista imprimible básica.

Esto permitiría validar marca, experiencia y alcance antes de invertir en Prisma, roles, Moodle y administración.

## Decisión práctica

No necesitas un MCP mágico para diseñar esto bien.

La mejor combinación es:

1. Usar el `.md` como spec funcional.
2. Usar `ecogestos.json` como contenido real.
3. Crear un prototipo React/Tailwind con marca AHC.
4. Verificarlo con navegador y capturas responsive.
5. Solo usar Figma MCP si hay un Figma real que respetar o si AHC necesita aprobar pantallas fuera del código.

## Próximo paso concreto

Construir una primera versión de diseño en código:

- `frontend/` con Vite + React + TypeScript.
- Tailwind o CSS variables con tokens AHC.
- Rutas principales de Fase 1.
- Datos locales importados desde `ecogestos.json`.
- Capturas desktop y móvil para revisar el diseño.

