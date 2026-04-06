# Design Document: Portfolio Polish

## Overview

El Portfolio Polish es un conjunto de mejoras y refinamientos para el portfolio que moderniza la experiencia de usuario, mejora la interactividad y establece sistemas consistentes para animaciones, colores y tipografía. El diseño introduce un sistema unificado de stickers que soporta múltiples tipos (texto, imagen, 3D) con discriminación de tipo, mejora el comportamiento de arrastre con anchor centrado e inertia reducida, y establece sistemas robustos para animaciones, colores y tipografía.

### Key Objectives

1. **Unified Sticker System**: Crear un sistema unificado que maneje stickers de texto, imagen y 3D con discriminación de tipo clara
2. **Improved Drag Behavior**: Mejorar la experiencia de arrastre con anchor centrado y inertia reducida
3. **Animation Systems**: Implementar sistemas de animación consistentes con GSAP para diferentes contextos
4. **Color System**: Establecer un sistema de colores con soporte a frontmatter y valores por defecto
5. **Typography System**: Definir sistemas de tipografía con font stacks y animación de weights
6. **Responsive Layout**: Asegurar que el layout sea responsivo, especialmente en móvil
7. **3D Integration**: Integrar stickers 3D reutilizando código Three.js existente

---

## Architecture

### System Overview

El sistema está organizado en capas:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  (Pages: Welcome, About, Playground)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Component Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Sticker Drag │  │ Text Anim    │  │ Image Hover  │  │
│  │ System       │  │ System       │  │ System       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 3D Loader    │  │ Layout       │  │ Color System │  │
│  │ System       │  │ System       │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Core Systems Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Animation    │  │ Typography   │  │ Data         │  │
│  │ Engine       │  │ System       │  │ Management   │  │
│  │ (GSAP)       │  │              │  │ (YAML)       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Sticker Type Discrimination

El sistema unificado de stickers utiliza discriminación de tipo basada en la propiedad `type` en YAML:

```yaml
stickers:
  - type: image
    path: assets/images/project.jpg
    position: [100, 200]
    
  - type: text
    content: "Hello World"
    textColor: "#000000"
    bgColor: "#ff00ff"
    
  - type: 3d
    modelPath: assets/models/cube.gltf
    position: [0, 0, 0]
```

Cada tipo tiene su propio conjunto de propiedades y comportamientos específicos.

### Animation System with GSAP

GSAP se utiliza como motor de animaciones central:

- **Welcome Text Animation**: Anima solo la propiedad `color` (no weight)
- **Image Hover Zoom**: Zoom suave con escala 1.05-1.1x
- **Sticker Drag Inertia**: Desaceleración reducida al soltar
- **Typography Weight Animation**: Animación de weights para Neue Regrade Variable

### Color System Architecture

El sistema de colores soporta múltiples niveles de configuración:

1. **Frontmatter Overrides**: `bg_color` y `text_color` en metadatos de entrada
2. **Component Defaults**: Valores por defecto por componente
3. **Global Defaults**: Valores por defecto globales

Flujo de resolución:
```
Frontmatter Override → Component Default → Global Default
```

### Typography System

Font stacks definidos:

- **Sans-serif Global**: "Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Serif Global**: "Newsreader", Georgia, Cambria, "Times New Roman", Times, serif

---

## Components and Interfaces

### 1. Sticker Drag System

**Responsabilidad**: Gestionar el arrastre de todos los tipos de stickers con comportamiento consistente.

**Interfaz**:
```javascript
class StickerDragSystem {
  // Inicializar sistema de arrastre
  init(stickerElement, options)
  
  // Iniciar arrastre desde posición del cursor
  startDrag(event)
  
  // Actualizar posición durante arrastre
  updateDrag(event)
  
  // Finalizar arrastre con inertia
  endDrag(event)
  
  // Calcular inertia reducida (50% menos)
  calculateReducedInertia(velocity)
}
```

**Comportamiento**:
- Anchor centrado en posición del cursor al agarrar
- Inertia deceleration reducida 50% de la implementación actual
- Funciona con todos los tipos de stickers (imagen, texto, 3D)
- Smooth seguimiento del cursor durante arrastre

### 2. Text Animation System

**Responsabilidad**: Animar propiedades de texto en diferentes contextos.

**Interfaz**:
```javascript
class TextAnimationSystem {
  // Animar solo color (welcome)
  animateColorOnly(element, fromColor, toColor, duration)
  
  // Animar weight (para tipografía variable)
  animateWeight(element, fromWeight, toWeight, duration)
  
  // Animar múltiples propiedades
  animateProperties(element, properties, duration)
}
```

**Contextos**:
- **Welcome**: Solo animación de color, weight constante
- **About**: Soporte para HTML con links, animación de color y weight
- **Playground**: Animación de propiedades según configuración

### 3. Image Hover System

**Responsabilidad**: Aplicar zoom suave en hover para imágenes.

**Interfaz**:
```javascript
class ImageHoverSystem {
  // Inicializar hover zoom
  init(imageElement, options)
  
  // Aplicar zoom en hover
  applyZoom(scale, duration)
  
  // Revertir zoom
  revertZoom(duration)
  
  // Debounce hover events
  debounceHover(callback, delay)
}
```

**Comportamiento**:
- Zoom scale: 1.05-1.1x
- Duración: 300-400ms
- Revert suave al salir del hover
- Debounce para evitar múltiples triggers

### 4. 3D Sticker Loader

**Responsabilidad**: Cargar y renderizar modelos 3D reutilizando Three.js existente.

**Interfaz**:
```javascript
class ThreeDStickerLoader {
  // Cargar modelo desde archivo
  loadModel(modelPath, format)
  
  // Renderizar modelo en contenedor
  render(container, model, options)
  
  // Aplicar propiedades (posición, rotación, escala)
  applyProperties(model, properties)
  
  // Hacer modelo draggable
  makeDraggable(model, dragSystem)
  
  // Lazy load para evitar bloqueo
  lazyLoad(modelPath)
}
```

**Formatos Soportados**: .obj, .gltf, .fbx

**Lazy Loading**: Los modelos se cargan bajo demanda para no bloquear la página.

### 5. Layout System

**Responsabilidad**: Gestionar layout responsivo especialmente para móvil.

**Breakpoints**:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (multi-column)

**Comportamiento**:
- About page: single column en móvil
- Full vertical scrolling habilitado
- Scroll suave sin restricciones
- Contenido completamente visible sin cutoff

### 6. Color System

**Responsabilidad**: Gestionar colores con soporte a frontmatter y valores por defecto.

**Interfaz**:
```javascript
class ColorSystem {
  // Resolver color desde frontmatter o default
  resolveColor(entry, colorKey, defaultValue)
  
  // Aplicar colores a elemento
  applyColors(element, bgColor, textColor)
  
  // Invertir colores (para header/footer)
  invertColors(bgColor, textColor)
}
```

**Propiedades Frontmatter**:
- `bg_color`: Color de fondo
- `text_color`: Color de texto

**Aplicación**:
- 3D playground entries: `bg_color` para contenedor
- Popover text: `text_color` para texto
- Header/Footer: Colores invertidos

### 7. Typography System

**Responsabilidad**: Gestionar tipografía con font stacks y animación de weights.

**Interfaz**:
```javascript
class TypographySystem {
  // Cargar fuentes
  loadFonts()
  
  // Aplicar font stack
  applyFontStack(element, type)
  
  // Animar weight
  animateWeight(element, fromWeight, toWeight, duration)
  
  // Verificar soporte de variable fonts
  checkVariableFontSupport()
}
```

**Font Stacks**:
- Sans-serif: "Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Serif: "Newsreader", Georgia, Cambria, "Times New Roman", Times, serif

---

## Data Models

### Unified Sticker YAML Structure

```yaml
stickers:
  - id: sticker_1
    type: image
    path: assets/images/project.jpg
    position: [100, 200]
    rotation: 0
    scale: 1
    draggable: true
    
  - id: sticker_2
    type: text
    content: "<p>Hello <a href='#'>World</a></p>"
    shape: rectangular  # rectangular, oval, svg
    textColor: "#000000"
    bgColor: "#FFFFFF"
    fontSize: 16
    fontWeight: 400
    fontFamily: sans-serif
    position: [300, 150]
    draggable: true
    
  - id: sticker_3
    type: 3d
    modelPath: assets/models/cube.gltf
    format: gltf  # obj, gltf, fbx
    position: [0, 0, 0]
    rotation: [0, 0, 0]
    scale: 1
    draggable: true
    lazyLoad: true
```

### Text Sticker Properties

```typescript
interface TextSticker {
  id: string
  type: 'text'
  content: string  // HTML content
  shape: 'rectangular' | 'oval' | 'svg'
  textColor: string
  bgColor: string
  fontSize: number
  fontWeight: number
  fontFamily: 'sans-serif' | 'serif'
  position: [number, number]
  rotation: number
  scale: number
  draggable: boolean
}
```

### 3D Sticker Properties

```typescript
interface ThreeDSticker {
  id: string
  type: '3d'
  modelPath: string
  format: 'obj' | 'gltf' | 'fbx'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  draggable: boolean
  lazyLoad: boolean
}
```

### Image Sticker Properties

```typescript
interface ImageSticker {
  id: string
  type: 'image'
  path: string
  position: [number, number]
  rotation: number
  scale: number
  draggable: boolean
}
```

### Frontmatter Override Structure

```yaml
---
title: Project Name
bg_color: "#FF5733"
text_color: "#FFFFFF"
---
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Sticker Anchor Centered at Cursor

*For any* sticker and any cursor position, when the sticker is grabbed for dragging, the anchor point should be centered at the cursor position, ensuring the sticker doesn't jump to an unexpected location.

**Validates: Requirements 1.1, 1.2**

### Property 2: Sticker Follows Cursor Smoothly

*For any* sticker being dragged, the sticker's position should follow the cursor smoothly from the center point, maintaining a consistent offset throughout the drag operation.

**Validates: Requirements 1.3**

### Property 3: Reduced Inertia Deceleration

*For any* sticker released with initial velocity, the sticker should come to rest within 50% of the distance it would travel with the original inertia implementation.

**Validates: Requirements 2.1, 2.2**

### Property 4: Welcome Text Color-Only Animation

*For any* welcome text animation, the color property should change while the font-weight property remains constant throughout the entire animation duration.

**Validates: Requirements 3.1, 3.2**

### Property 5: Full Vertical Scrolling Enabled

*For any* portfolio page, the page should allow full vertical scrolling, with the scrollable height exceeding the viewport height and no scroll restrictions applied.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Mobile Single Column Layout

*For any* about page viewed on devices with width < 768px, the content should display in a single column with elements stacked vertically, not side-by-side.

**Validates: Requirements 5.1, 5.2**

### Property 7: About Page Scroll Enabled

*For any* about page, vertical scrolling should be enabled with no CSS overflow restrictions, and scroll behavior should be smooth without jumps.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 8: Mobile Scroll to Bottom

*For any* about page on mobile devices, scrolling should reach the very bottom with the last content element fully visible and not cut off.

**Validates: Requirements 7.1, 7.2**

### Property 9: 3D Playground Background Color from Frontmatter

*For any* 3D entry in playground with a `bg_color` defined in frontmatter, the background color should be applied to the 3D entry container; if undefined, a default color should be used.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 10: Popover Text Color from Frontmatter

*For any* popover element with a `text_color` defined in frontmatter, the text color should be applied to all text content; if undefined, a default color should be used.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 11: Inverted Header Colors

*For any* header with `bg_color` and `text_color` defined, the header should apply `text_color` as background and `bg_color` as text color, maintaining contrast and readability.

**Validates: Requirements 10.1, 10.2**

### Property 12: Inverted Footer Colors

*For any* footer with `bg_color` and `text_color` defined, the footer should apply the same inverted color scheme as the header.

**Validates: Requirements 10.3**

### Property 13: Text Sticker YAML Support

*For any* text sticker defined in YAML with properties (HTML content, shape, colors, size, weight, typography), all properties should be parsed correctly and accessible to the rendering system.

**Validates: Requirements 11.1**

### Property 14: Text Sticker Properties Applied

*For any* rendered text sticker, all defined properties (color, background, size, weight, font) should be applied to the DOM element as computed styles.

**Validates: Requirements 11.2**

### Property 15: Text Sticker Drag Consistency

*For any* text sticker being dragged, the drag behavior should be identical to image stickers, including anchor centering and reduced inertia.

**Validates: Requirements 11.3**

### Property 16: Serif Font Stack Definition

*For any* serif element, the computed font-family should include "Newsreader" as the first choice, with Georgia, Cambria, "Times New Roman", Times, and serif as fallbacks.

**Validates: Requirements 12.1, 12.2**

### Property 17: 3D Model Format Support

*For any* 3D sticker with modelPath pointing to .obj, .gltf, or .fbx format, the loader should successfully parse and render the model.

**Validates: Requirements 13.1**

### Property 18: 3D Sticker Reuses Three.js

*For any* 3D sticker rendered, the system should use existing Three.js utilities and code, not implement new 3D rendering logic.

**Validates: Requirements 13.2**

### Property 19: 3D Sticker Draggable

*For any* 3D sticker, the sticker should respond to drag events and move with the cursor using the same drag system as other sticker types.

**Validates: Requirements 13.3**

### Property 20: 3D Model Error Handling

*For any* 3D model that fails to load (invalid format, missing file, corrupted data), the system should handle the error gracefully without crashing and display a fallback.

**Validates: Requirements 13.4**

### Property 21: 3D Sticker YAML Configuration

*For any* 3D sticker defined in YAML with properties (modelPath, position, rotation, scale, interactive properties), all properties should be parsed correctly and consistent with existing sticker definitions.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

### Property 22: Unified Sticker Type Discrimination

*For any* unified sticker YAML structure with a `type` field (image, text, or 3d), the system should correctly identify and handle the sticker according to its type.

**Validates: Requirements 15.2**

### Property 23: Neue Regrade Variable Font Loading

*For any* sans-serif element, the computed font-family should include "Neue Regrade Variable" as the first choice, indicating the font has been loaded from assets/fonts.

**Validates: Requirements 16.1, 16.2, 16.3**

### Property 24: Weight Animation with Variable Font

*For any* element with "Neue Regrade Variable" font, animating the font-weight property should produce visible changes in the rendered text.

**Validates: Requirements 16.4, 17.1**

### Property 25: Image Hover Zoom Animation

*For any* image element on hover, a GSAP animation should be applied that scales the image to between 1.05 and 1.1x its original size.

**Validates: Requirements 18.1, 18.2**

### Property 26: Image Hover Zoom Revert

*For any* image that was zoomed on hover, when the mouse leaves the image, the zoom should revert smoothly back to scale 1.0.

**Validates: Requirements 18.4**

---

## Error Handling

### Sticker Drag System Errors

- **Invalid Sticker Element**: Validate that the element exists and is draggable before initializing drag
- **Null Cursor Position**: Fallback to element center if cursor position is unavailable
- **Drag Outside Viewport**: Clamp sticker position to reasonable bounds to prevent loss of element

### 3D Model Loading Errors

- **Invalid Model Path**: Log error and display placeholder/fallback 3D object
- **Unsupported Format**: Validate format before loading; reject unsupported formats with clear error message
- **Network Errors**: Implement retry logic with exponential backoff for failed model downloads
- **Corrupted Model Data**: Catch parsing errors and display fallback with user-friendly message

### Color System Errors

- **Invalid Color Values**: Validate color format (hex, rgb, hsl) before applying; fallback to default if invalid
- **Missing Frontmatter**: Use component defaults when frontmatter is missing
- **Circular Color References**: Detect and prevent infinite loops in color resolution

### Typography System Errors

- **Font Loading Failure**: Fallback to system fonts if custom fonts fail to load
- **Invalid Font Weight**: Clamp weight values to valid range (100-900)
- **Variable Font Not Supported**: Gracefully degrade to static font weights if variable fonts not supported

### Layout System Errors

- **Scroll Disabled Accidentally**: Detect and warn if overflow is set to hidden on scrollable containers
- **Content Cutoff**: Validate that all content is within viewport bounds when scrolled to bottom
- **Responsive Breakpoint Issues**: Test layout at all breakpoints to ensure proper stacking

---

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** (Specific Examples & Edge Cases):
- Sticker drag with specific cursor positions
- Color resolution with missing frontmatter
- 3D model loading with various file formats
- Mobile layout at exactly 768px breakpoint
- Text animation with specific color values
- Font weight animation with edge values (100, 900)

**Property-Based Tests** (Universal Properties):
- All 26 correctness properties defined above
- Each property tested with 100+ random iterations
- Comprehensive input coverage through randomization

### Unit Testing Focus

- **Drag System**: Test anchor centering, inertia calculation, cursor tracking
- **Text Animation**: Verify color-only animation, weight constancy
- **3D Loading**: Test all supported formats, error handling
- **Color System**: Test frontmatter resolution, defaults, inversion
- **Layout**: Test responsive breakpoints, scroll behavior
- **Typography**: Test font loading, weight animation

### Property-Based Testing Configuration

Each property-based test must:
1. Reference the design document property by number and title
2. Run minimum 100 iterations with randomized inputs
3. Use tag format: `Feature: portfolio-polish, Property {number}: {property_text}`
4. Generate appropriate test data (stickers, colors, positions, etc.)
5. Verify the property holds across all generated inputs

**Example Property Test Structure**:
```javascript
// Feature: portfolio-polish, Property 1: Sticker Anchor Centered at Cursor
describe('Sticker Anchor Centering', () => {
  it('should center anchor at cursor position for all stickers', () => {
    fc.assert(
      fc.property(
        fc.record({
          sticker: generateSticker(),
          cursorX: fc.integer({ min: 0, max: 1000 }),
          cursorY: fc.integer({ min: 0, max: 1000 })
        }),
        ({ sticker, cursorX, cursorY }) => {
          const dragSystem = new StickerDragSystem(sticker);
          dragSystem.startDrag({ clientX: cursorX, clientY: cursorY });
          
          expect(sticker.anchorX).toBe(cursorX);
          expect(sticker.anchorY).toBe(cursorY);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Sticker Drag System**: 100% coverage of drag logic, inertia calculation
- **Text Animation**: 100% coverage of animation properties
- **3D Loader**: 100% coverage of format support, error handling
- **Color System**: 100% coverage of resolution logic, defaults
- **Layout System**: 100% coverage of responsive breakpoints
- **Typography System**: 100% coverage of font loading, weight animation
- **Image Hover**: 100% coverage of zoom animation, revert logic

### Performance Testing

- Verify that lazy loading 3D models doesn't block page rendering
- Verify that hover animations don't cause layout thrashing
- Verify that drag animations maintain 60fps performance
- Verify that color resolution doesn't cause unnecessary reflows

### Integration Testing

- Test sticker drag with all sticker types (image, text, 3D)
- Test color system with all components (header, footer, playground, popover)
- Test typography system with all font stacks
- Test layout responsiveness across all breakpoints
- Test 3D models with all supported formats

---

## Addendum: Cambios March 18, 2026

### A. Home: Color Influence Radius en Welcome

- Extender modelo de sticker en `_data/stickers.yml` con:
  - `influenceColor`
  - `influenceRadius`
- Crear motor de influencia de proximidad que:
  - calcule distancia sticker->glyph o sticker->span en `welcome-text`
  - aplique interpolación de color con falloff suave
  - acumule múltiples influencias con prioridad por cercanía

### B. Works: Masonry 2 Columnas

- Migrar layout de listado Work a masonry de 2 columnas.
- Las cards conservan altura natural de media, sin igualación por fila.
- Estrategia recomendada:
  - CSS columns (`column-count: 2`) o CSS masonry equivalente compatible.
  - Fallback responsive para móvil en 1 columna.

### C. Work Detail: Flechas Flotantes Prev/Next

- Añadir controles laterales flotantes para navegación entre proyectos.
- Resolver orden desde colección `site.works` con índice actual.
- Asegurar soporte teclado (`ArrowLeft`, `ArrowRight`) y ARIA labels.

### D. Sketchbook: Visibilidad de Tags y Agrupación por Día

- Ocultar visualmente tags sin eliminar lógica.
- Agrupar cards por fecha diaria (`day/month/year`) con:
  - encabezado (`h3`) por grupo
  - divisor horizontal entre grupos.
- La renderización agrupada debe preservar orden cronológico definido por fecha.

### E. Bugfix Popover Video Centrado

- Revisar cálculo de posición del popover para media `video`.
- Unificar ruta de centrado entre image/video/text/3D.
- Recalcular en `resize` y cambio de orientación.

### F. Scroll Lock Reutilizable para Interacciones Táctiles

- Extraer utilidad compartida (ej. `touch-scroll-lock.js`) con API:
  - `lock(contextId)`
  - `unlock(contextId)`
  - `isLocked()`
- Reusar en:
  - drag de stickers (About)
  - interacción 3D en móvil (Sketchbook).

### G. Drag Ligero en Cards de Sketchbook + Física Existente

- Añadir drag manual de baja influencia sobre cards.
- Mantener físicas de interacción entre cards.
- Definir parámetros diferenciados respecto stickers:
  - menor desplazamiento
  - mayor fuerza de retorno
  - damping superior.

### H. Frontmatter 3D Avanzado

Agregar soporte en entradas `media_type: three_d`:

```yaml
material_type: lambert | normal | matcap
material_color: "#RRGGBB"
wireframe: false
cast_shadows: true
```

- Si el modelo no aporta material válido, aplicar fallback por frontmatter.
- `matcap` cargará textura desde `assets/` (path configurable).

### I. Configuración de Luces Three.js Simplificada

- Centralizar al principio del módulo una config editable:
  - `ambient`
  - `key` (point)
  - `fill` (point)
  - `rim` (point)
- Cada luz con `position`, `intensity`, `color`.

### J. Calidad de Sombras y Aliasing

- Mejorar sombras mediante:
  - `shadow.mapSize`
  - `shadow.bias` / `normalBias`
  - filtros compatibles según rendimiento
- Exponer presets de calidad (mobile/desktop) para balance visual/perf.

### K. Sistema de Sonido de Interacción (Futuro)

- Añadir un módulo reutilizable `interaction-sfx.js` con API mínima:
  - `init(config)`
  - `play(eventName)`
  - `setEnabled(boolean)`
  - `setVolume(number)`
- Eventos candidatos:
  - `sticker_hover`, `sticker_pick`, `sticker_drop`
  - `card_hover`, `card_pick`, `card_drop`
  - `popover_open`, `popover_close`
- Requisitos técnicos:
  - Preload/caching de audios cortos para latencia baja.
  - Fail-safe: si no hay autoplay permission o falla audio, no romper UX.
  - Control global de mute y respeto de preferencias de accesibilidad.

### L. CMS Editorial para Works y Sketchbook

- Integrar un CMS git-based tipo Decap CMS en una ruta administrativa dedicada (`/admin/` o equivalente existente).
- Mantener el modelo de contenido actual como fuente de verdad:
  - `works` -> `_works/`
  - `playground` -> `_playground/`
- Configurar colecciones editoriales separadas para:
  - portfolio works
  - sketchbook entries
- Exponer en la UI los campos ya usados por Liquid/frontmatter:
  - comunes: `title`, `date`, `layout`, `bg_color`, `text_color`
  - works: `year`, `client`, `studio`, `thumb`, `video`, `vimeo`
  - playground: `discipline`, `media_type`, `media`, `size`
  - 3D playground: `material_type`, `material_color`, `wireframe`, `cast_shadows`, `shadow_quality`, `matcap_texture`
- Mantener edición basada en archivos Markdown/HTML compatibles con Jekyll, sin introducir base de datos externa.
- Añadir preview/editorial validation suficiente para evitar romper el frontmatter esperado por templates.
- Aprovechar la carpeta/ruta administrativa ya presente en el repo si simplifica la integración, evitando duplicar entrypoints innecesarios.
- Documentar credenciales, backend de autenticación/publicación y flujo editorial local en un archivo operativo breve cuando se implemente.
