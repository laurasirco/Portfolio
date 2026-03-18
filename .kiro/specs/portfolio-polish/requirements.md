# Requirements Document: Portfolio Polish

## Introduction

Este spec define mejoras y refinamientos para el portfolio, enfocándose en la experiencia de usuario, animaciones, interactividad y consistencia visual. Incluye correcciones de comportamiento de stickers, animaciones de texto, scroll y layout, colores y estilos, tipografía, y nuevas características como stickers 3D y zoom en hover.

## Glossary

- **Sticker**: Elemento visual interactivo (imagen, texto o 3D) que puede ser arrastrado en la página
- **Anchor**: Punto de referencia desde el cual se arrastra un elemento
- **Inertia**: Velocidad de desaceleración al soltar un elemento arrastrado
- **Frontmatter**: Metadatos YAML en archivos de contenido que definen propiedades visuales
- **Smoothscroll**: Desplazamiento suave de la página
- **Three.js**: Librería JavaScript para renderizado 3D
- **GSAP**: Librería de animaciones JavaScript
- **Weight**: Grosor de la tipografía (100-900)
- **Serif**: Tipografía con remates (Newsreader, Georgia, Times New Roman)
- **Sans-serif**: Tipografía sin remates (Neue Regrade Variable)
- **Popover**: Elemento emergente que muestra información adicional
- **Welcome**: Página de inicio del portfolio
- **About**: Página de información personal
- **Sketchbook**: Página de proyectos interactivos (antes "Playground")

## Requirements

### Requirement 1: Centrar Anchor de Stickers al Arrastrar

**User Story:** Como usuario, quiero que los stickers se agarren desde su centro cuando los arrastro, para que la interacción sea más intuitiva y natural.

#### Acceptance Criteria

1. WHEN a sticker is grabbed for dragging, THE Sticker_System SHALL center the anchor point at the cursor position
2. THE grabbed sticker SHALL NOT jump to the top-right corner when dragging begins
3. WHILE dragging, THE sticker position SHALL follow the cursor smoothly from the center point

---

### Requirement 2: Reducir Velocidad de Inertia en Stickers

**User Story:** Como usuario, quiero que los stickers se desaceleren más rápidamente al soltarlos, para que el movimiento sea más controlado.

#### Acceptance Criteria

1. WHEN a sticker is released, THE Sticker_System SHALL apply reduced inertia deceleration
2. THE sticker SHALL come to rest within a shorter distance than the current implementation
3. THE deceleration curve SHALL feel natural and responsive to user expectations

---

### Requirement 3: Cambiar Efecto de Welcome a Solo Color

**User Story:** Como diseñador, quiero que la animación de bienvenida solo cambie el color de las letras, no el weight, para mantener la consistencia visual.

#### Acceptance Criteria

1. WHEN the welcome animation plays, THE Text_Animator SHALL animate only the color property
2. THE font weight SHALL remain constant throughout the animation
3. THE color transition SHALL be smooth and visually appealing

---

### Requirement 4: Revisar y Corregir Scroll de Páginas de Portfolio

**User Story:** Como usuario, quiero poder hacer scroll completo en todas las páginas del portfolio, para acceder a todo el contenido sin restricciones.

#### Acceptance Criteria

1. WHEN viewing portfolio pages, THE Page_Renderer SHALL allow full vertical scrolling
2. THE smoothscroll behavior SHALL NOT prevent content from being visible
3. WHEN scrolling to the bottom, THE user SHALL see all content without cutoff

---

### Requirement 5: Página About - Layout Responsivo en Móvil

**User Story:** Como usuario móvil, quiero que la página about sea una única columna en dispositivos pequeños, para una mejor legibilidad.

#### Acceptance Criteria

1. WHEN viewing on mobile devices (< 768px), THE About_Page SHALL display content in a single column
2. THE layout SHALL stack vertically without side-by-side columns
3. THE content SHALL remain readable and properly spaced

---

### Requirement 6: Página About - Habilitar Scroll

**User Story:** Como usuario, quiero poder hacer scroll en la página about, para acceder a todo el contenido.

#### Acceptance Criteria

1. WHEN viewing the about page, THE Page_Renderer SHALL enable vertical scrolling
2. THE scroll behavior SHALL NOT be disabled or restricted
3. WHEN scrolling, THE content SHALL move smoothly without jumps

---

### Requirement 7: Página About - Scroll Completo en Móvil

**User Story:** Como usuario móvil, quiero poder hacer scroll hasta el final de la página about, para ver todo el contenido.

#### Acceptance Criteria

1. WHEN scrolling on mobile devices, THE About_Page SHALL allow scrolling to the very bottom
2. THE last content element SHALL be fully visible when scrolled to the end
3. THE scroll behavior SHALL work consistently across different mobile devices

---

### Requirement 8: Colores de Fondo en Entradas 3D de Playground

**User Story:** Como diseñador, quiero que los colores de fondo de las entradas 3D en playground se tomen del frontmatter, para mantener consistencia visual.

#### Acceptance Criteria

1. WHEN rendering 3D entries in playground, THE Playground_Renderer SHALL read bg_color from frontmatter
2. THE background color SHALL be applied to the 3D entry container
3. IF no bg_color is defined, THE system SHALL use a default color

---

### Requirement 9: Colores de Texto en Popover de Playground

**User Story:** Como diseñador, quiero que los colores de texto en los popover se tomen del frontmatter, para mantener consistencia visual.

#### Acceptance Criteria

1. WHEN rendering text in popover elements, THE Popover_Renderer SHALL read text_color from frontmatter
2. THE text color SHALL be applied to all text content in the popover
3. IF no text_color is defined, THE system SHALL use a default color

---

### Requirement 10: Invertir Colores en Footer y Header

**User Story:** Como diseñador, quiero probar invertir los colores en footer y header (usando text_color como bg_color y viceversa), para explorar nuevas opciones visuales.

#### Acceptance Criteria

1. WHEN rendering the header, THE Header_Renderer SHALL apply text_color as background color
2. WHEN rendering the header, THE Header_Renderer SHALL apply bg_color as text color
3. WHEN rendering the footer, THE Footer_Renderer SHALL apply the same inverted color scheme
4. THE contrast and readability SHALL be maintained

---

### Requirement 11: Crear Stickers de Texto en About

**User Story:** Como diseñador, quiero crear stickers de texto en la página about con la misma lógica que los stickers de imagen, para enriquecer la interactividad.

#### Acceptance Criteria

1. WHEN defining text stickers in YAML, THE Sticker_System SHALL support: HTML content, shape (rectangular, oval, svg), text color, background color, size, weight, and typography
2. WHEN rendering text stickers, THE Sticker_System SHALL apply all defined properties
3. WHEN dragging text stickers, THE Sticker_System SHALL use the same drag logic as image stickers
4. THE text stickers SHALL be interactive and responsive

---

### Requirement 12: Definir Tipografía Serif Global

**User Story:** Como diseñador, quiero definir una tipografía serif global para el portfolio, para mantener consistencia en elementos serif.

#### Acceptance Criteria

1. THE global serif font stack SHALL be: "Newsreader", Georgia, Cambria, "Times New Roman", Times, serif
2. WHEN applying serif typography, THE system SHALL use this font stack
3. THE font fallbacks SHALL ensure proper rendering across browsers

---

### Requirement 13: Añadir Stickers 3D al Welcome

**User Story:** Como diseñador, quiero añadir stickers 3D al welcome usando modelos 3D (.obj, .gltf, .fbx), para crear una experiencia visual más inmersiva.

#### Acceptance Criteria

1. WHEN defining 3D stickers, THE Sticker_System SHALL support loading .obj, .gltf, and .fbx formats
2. WHEN rendering 3D stickers, THE system SHALL reuse existing Three.js code
3. THE 3D stickers SHALL be interactive and draggable like other stickers
4. WHEN loading a 3D model, THE system SHALL handle errors gracefully

---

### Requirement 14: Crear YAML para Stickers 3D

**User Story:** Como desarrollador, quiero crear archivos YAML para definir stickers 3D en welcome y about, para mantener la configuración centralizada.

#### Acceptance Criteria

1. THE system SHALL support YAML configuration for 3D stickers in welcome
2. THE system SHALL support YAML configuration for 3D stickers in about
3. EACH YAML file SHALL define: model path, position, rotation, scale, and interactive properties
4. THE YAML structure SHALL be consistent with existing sticker definitions

---

### Requirement 15: Considerar Unificación de Stickers

**User Story:** Como desarrollador, quiero considerar unificar todos los stickers (texto, imagen, 3D) en un único YAML por página, para simplificar la arquitectura.

#### Acceptance Criteria

1. THE system SHALL evaluate the feasibility of a unified sticker YAML structure
2. IF unified, THE structure SHALL support all sticker types (text, image, 3D) with type discrimination
3. THE unified approach SHALL reduce code complexity and maintenance overhead
4. THE migration path SHALL be documented if implemented

---

### Requirement 16: Cambiar Tipografía Sans-Serif Global

**User Story:** Como diseñador, quiero cambiar la tipografía sans-serif global a "Neue Regrade Variable", para modernizar el portfolio.

#### Acceptance Criteria

1. THE global sans-serif font SHALL be changed to "Neue Regrade Variable" from assets/fonts
2. WHEN the font is loaded, THE system SHALL apply it to all sans-serif text
3. THE font file SHALL be properly linked and loaded from the assets directory
4. THE animation of font weights SHALL continue to function correctly

---

### Requirement 17: Verificar Animación de Weights

**User Story:** Como desarrollador, quiero verificar que la animación de font weights sigue funcionando después del cambio de tipografía, para mantener la funcionalidad existente.

#### Acceptance Criteria

1. WHEN animating font weights, THE animation system SHALL work with "Neue Regrade Variable"
2. THE weight transitions SHALL be smooth and visually correct
3. THE animation performance SHALL not be degraded

---

### Requirement 18: Implementar Zoom en Hover para Imágenes

**User Story:** Como diseñador, quiero implementar un pequeño zoom divertido con GSAP para las imágenes cuando hago hover, para mejorar la interactividad.

#### Acceptance Criteria

1. WHEN hovering over images, THE Image_System SHALL apply a zoom animation using GSAP
2. THE zoom scale SHALL be subtle and playful (e.g., 1.05 to 1.1x)
3. THE animation duration SHALL be smooth and responsive
4. WHEN mouse leaves the image, THE zoom SHALL revert smoothly to original size

---

### Requirement 19: Home - Influencia de Color de Stickers sobre Welcome Text

**User Story:** Como diseñador, quiero que los stickers flotantes en Home también influyan en el color del texto Welcome dentro de un radio, para crear una interacción visual más rica.

#### Acceptance Criteria

1. WHEN a floating sticker is near Welcome text glyphs, THE Welcome_Text_System SHALL apply a color influence falloff based on distance
2. EACH sticker SHALL define a preconfigured influence color in `stickers.yml`
3. THE system SHALL support a configurable influence radius per sticker (or global default)
4. WHEN no sticker is inside influence radius, THE text SHALL return to its base color without abrupt jumps

---

### Requirement 20: Works - Layout Masonry en 2 Columnas

**User Story:** Como usuario, quiero que el listado de Works se muestre en 2 columnas tipo masonry, para que las alturas variables de imagen se aprovechen mejor visualmente.

#### Acceptance Criteria

1. THE Works page SHALL render cards in two visual columns
2. EACH card height SHALL be defined by its media content height
3. CARDS in left and right column SHALL NOT be forced to equal row heights
4. THE layout SHALL remain responsive and stable across desktop and mobile breakpoints

---

### Requirement 21: Work Detail - Navegación Flotante Anterior/Siguiente

**User Story:** Como usuario, quiero flechas flotantes a ambos lados en detalle de proyecto para navegar al trabajo anterior o siguiente fácilmente.

#### Acceptance Criteria

1. WHEN viewing a work detail page, THE Work_Detail_UI SHALL display floating prev/next arrows
2. PREV/NEXT navigation SHALL resolve correctly according to work ordering
3. THE arrows SHALL be accessible via keyboard and have clear aria-labels
4. ON mobile, THE controls SHALL remain usable without tap conflicts with scroll

---

### Requirement 22: Sketchbook - Ocultar Visualmente Tags Manteniendo Lógica

**User Story:** Como diseñador, quiero quitar la sección visible de tags en Sketchbook sin eliminar la funcionalidad subyacente para poder reactivarla más adelante.

#### Acceptance Criteria

1. THE tags UI SHALL NOT be visible in Sketchbook
2. TAG metadata and filtering logic SHALL remain available in code
3. Hidden tags behavior SHALL NOT break card rendering or popover behavior

---

### Requirement 23: Sketchbook - Agrupación por Día con Divisores

**User Story:** Como usuario, quiero ver las cards de Sketchbook agrupadas por fecha con separadores visibles, para entender mejor la cronología.

#### Acceptance Criteria

1. CARDS SHALL be grouped by day (`day/month/year`)
2. EACH group SHALL render a visible heading (e.g. `h3`) with date label
3. GROUPS SHALL be separated by a horizontal divider line
4. MULTIPLE cards on the same date SHALL appear under the same date heading

---

### Requirement 24: Sketchbook Popover - Corregir Centrado de Video

**User Story:** Como usuario, quiero que el popover de video se centre correctamente en pantalla, para una experiencia consistente con otros contenidos.

#### Acceptance Criteria

1. WHEN opening a video popover, THE Popover_System SHALL center the modal in viewport
2. THE popover SHALL NOT render shifted downward unexpectedly
3. THE centering SHALL remain correct on resize/orientation change

---

### Requirement 25: Extraer Utilidad Reutilizable de Bloqueo de Scroll Táctil

**User Story:** Como desarrollador, quiero reutilizar la lógica de bloqueo temporal de scroll táctil en varias interacciones (stickers, 3D), para evitar duplicación y bugs inconsistentes.

#### Acceptance Criteria

1. THE codebase SHALL expose a reusable utility/module for temporary touch scroll lock
2. STICKER drag and mobile 3D interaction SHALL consume the same utility
3. SCROLL lock SHALL enable only during interaction and restore cleanly on end/cancel
4. THE utility SHALL avoid visual jump/regression on iOS Safari

---

### Requirement 26: Sketchbook Cards Draggables con Influencia Baja

**User Story:** Como usuario, quiero arrastrar ligeramente las cards de Sketchbook como stickers, pero con fuerza de retorno para que no se desordenen demasiado.

#### Acceptance Criteria

1. WHEN dragging a Sketchbook card, THE card SHALL move with low influence compared to sticker drag
2. THE physics system SHALL keep interaction between cards enabled
3. AFTER release, cards SHALL tend to settle back near their original placement
4. THE drag interaction SHALL work on mouse and touch

---

### Requirement 27: Three.js Frontmatter de Material y Sombras para Items 3D

**User Story:** Como diseñador, quiero configurar material y sombras de entradas 3D desde frontmatter para tener control artístico sin tocar JS.

#### Acceptance Criteria

1. THE frontmatter for `media_type: three_d` SHALL support:
   - `material_type` (`lambert`, `normal`, `matcap`)
   - `material_color` (fallback si el modelo no trae material útil)
   - `wireframe` (boolean)
   - `cast_shadows` (boolean)
2. WHEN `material_type: matcap`, THE renderer SHALL use a matcap texture from assets
3. IF frontmatter options are absent, THE renderer SHALL use sensible defaults

---

### Requirement 28: Configuración Clara de Luces Three.js (Ambient + Key/Fill/Rim)

**User Story:** Como diseñador, quiero editar fácil la configuración de luces (posición, intensidad, color) al principio del código, para iterar el look sin fricción.

#### Acceptance Criteria

1. THREE.js lighting config SHALL be centralized in a clear top-level object/module
2. THE setup SHALL include ambient light plus three point lights: key, fill, rim
3. EACH light SHALL expose editable `position`, `intensity`, and `color`
4. Light changes SHALL apply consistently to all 3D Sketchbook items

---

### Requirement 29: Mejorar Calidad de Sombras y Reducir Aliasing

**User Story:** Como diseñador, quiero sombras más limpias en 3D para evitar aliasing visible en los objetos.

#### Acceptance Criteria

1. THE renderer SHALL improve shadow quality via shadow map configuration (resolution/bias/filtering)
2. SHADOW edges SHALL exhibit less aliasing under typical camera distances
3. QUALITY tuning SHALL preserve acceptable performance on desktop and mobile

---

### Requirement 30: Sistema de Efectos de Sonido para Interacciones (Futuro)

**User Story:** Como usuario, quiero feedback sonoro sutil en interacciones (hover/drag/open/close) para reforzar la sensación táctil del portfolio.

#### Acceptance Criteria

1. THE UI SHALL support optional interaction SFX for stickers, sketchbook cards, and popovers
2. THE sound system SHALL expose centralized config (volume, enabled flag, per-event sound map)
3. THE implementation SHALL preload/cache audio assets to avoid lag on first interaction
4. THE system SHALL include a global mute/disable option and respect reduced-motion/accessibility preferences
5. IF audio fails to load/play, THE UI SHALL continue without blocking interaction
