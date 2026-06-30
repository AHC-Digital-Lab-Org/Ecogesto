# Marca AHC y Accesibilidad

## Fuentes revisadas

- `material/AHC - Guia de Marca - 2026 copia 2.pdf`
- `material/Requisitos_App_Web_EcoGestos_AHC.pdf`

## Paleta

| Uso | Color |
|---|---|
| Texto | `#222A1A` |
| Verde principal / subtitulos | `#4F9447` |
| Enlaces | `#A5C6A4` |
| Titulos | `#537358` |
| Fondo claro | `#F4F1E9` |

## Tipografia

- Titulos: Source Sans Pro / Source Sans 3 en peso 600-700.
- Texto normal: Nunito Sans.
- Fallbacks: `sans-serif`.

## Logo

La guia contempla:

- Version principal con `A H C`, subtitulo "ASOCIACION HUELLA DE CARBONO" y simbolo CO2.
- Version secundaria con nube `CO2` y flecha descendente.

En la web se recomienda:

- Header: version compacta inline SVG.
- Informes/certificados: version principal o sello AHC.
- Iconos de acciones: Material Symbols Outlined, usando el campo `icono` del inventario.

## Tono

- Motivador.
- Practico.
- No culpabilizador.
- Claro para publico no tecnico.

Frases validas:

- Cada gesto cuenta.
- Elige lo que puedes aplicar.
- Mejor progreso que perfeccion.

## Accesibilidad WCAG 2.1 AA

Checklist minimo:

- `lang="es"` en HTML.
- Contraste 4.5:1 en texto normal.
- Focus visible en enlaces, botones e inputs.
- Formularios con `label` visible o accesible.
- Mensajes de error con texto claro.
- Navegacion completa por teclado.
- Imagenes con `alt`.
- No depender solo del color para estado.
- Graficos con tabla o resumen textual equivalente.
- Vista imprimible sin controles innecesarios.

## Prohibiciones del spec

- No usar emojis en UI, errores, exitos, titulares, placeholders ni notificaciones.
- No ocultar incertidumbre de calculos.
- No mezclar web y Moodle como si fueran lo mismo.

