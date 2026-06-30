# Columna "Icono" del inventario

Cada EcoGesto del CSV tiene asignado un **icono de Google Material Symbols** (https://fonts.google.com/icons) que cubre el campo *Multimedia – icono o ilustración* del Anexo B del documento de requisitos.

## Por qué Material Symbols

- Es la librería de iconos estándar de Google, gratuita, con licencia Apache 2.0
- 2.500+ iconos disponibles cubriendo prácticamente cualquier concepto
- Cero peso de assets propios: se cargan desde la CDN de Google Fonts
- Se pueden renderizar en cualquier color (incluido el verde AHC `#4F9447`) sin tocar el icono
- Compatibles con WordPress, React, plain HTML, móvil

## Cómo pintarlos en la web

**1. Cargar la fuente** (una vez en el `<head>` de la página):

```html
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
```

**2. Pintar el icono usando el nombre del CSV**:

```html
<span class="material-symbols-outlined">recycling</span>
```

**3. Estilarlo con CSS si hace falta** (tamaño, color AHC):

```css
.material-symbols-outlined {
  font-size: 48px;
  color: #4F9447;
}
```

## Variantes disponibles (por si las quieren)

Material Symbols tiene 3 estilos. Cambiando la URL y la clase se cambia el estilo sin tocar el CSV:

| Estilo | URL a cargar | Clase a usar |
|--------|--------------|--------------|
| Contorno (recomendado) | `family=Material+Symbols+Outlined` | `material-symbols-outlined` |
| Redondeado | `family=Material+Symbols+Rounded` | `material-symbols-rounded` |
| Afilado | `family=Material+Symbols+Sharp` | `material-symbols-sharp` |

## Si prefieren otro sistema

El campo "Icono" es solo el **nombre** del concepto (`recycling`, `directions_bus`, etc.). Si la AHC decide usar otra librería (FontAwesome, Heroicons, iconos propios), basta con mapear esos nombres a los suyos. Los conceptos son universales.

## Si prefieren imagen real en lugar de icono

El Anexo B dice "Imagen principal, **icono o** ilustración" — los tres son válidos. Si en una fase posterior la AHC quiere fotografías reales:

1. Crear una columna "Imagen_URL" adicional con la URL a una imagen libre (Unsplash, Pexels)
2. Mantener el "Icono" como fallback cuando no haya imagen disponible
3. Mostrar la imagen en la ficha grande y el icono en las tarjetas pequeñas del catálogo
