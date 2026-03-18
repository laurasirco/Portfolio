# Plan de Implementación: Portfolio Polish

## Descripción General

Este plan implementa mejoras y refinamientos para el portfolio, modernizando la experiencia de usuario con sistemas unificados de stickers, animaciones mejoradas, colores consistentes y tipografía variable. La implementación sigue un orden estratégico: primero sistemas base (drag, animación, colores), luego componentes (stickers, layout), y finalmente testing integral.

## Tareas

- [x] 1. Configurar sistemas base y estructura de proyecto
  - [x] 1.1 Crear estructura de módulos para sistemas base
    - Crear directorio `assets/js/systems/` para módulos reutilizables
    - Crear `assets/js/systems/drag-system.js` con clase base StickerDragSystem
    - Crear `assets/js/systems/animation-system.js` con clase base TextAnimationSystem
    - Crear `assets/js/systems/color-system.js` con clase base ColorSystem
    - _Requisitos: 1.1, 2.1, 8.1, 9.1, 10.1_

  - [ ]* 1.2 Escribir tests de estructura de módulos
    - Verificar que todos los módulos se cargan correctamente
    - Verificar que las clases base se instancian sin errores
    - _Requisitos: 1.1, 2.1_

- [-] 2. Implementar Sticker Drag System mejorado
  - [x] 2.1 Implementar StickerDragSystem con anchor centrado
    - Modificar `assets/js/sticker-drag.js` para centrar anchor en posición del cursor
    - Implementar método `startDrag(event)` que calcula offset desde centro del elemento
    - Implementar método `updateDrag(event)` que mantiene offset consistente
    - Asegurar que el sticker no salta al agarrarlo
    - _Requisitos: 1.1, 1.2, 1.3_

  - [ ]* 2.2 Escribir property test para anchor centrado
    - **Property 1: Sticker Anchor Centered at Cursor**
    - **Valida: Requisitos 1.1, 1.2**

  - [x] 2.3 Reducir inertia deceleration 50%
    - Implementar método `calculateReducedInertia(velocity)` que reduce deceleration
    - Modificar método `endDrag(event)` para aplicar inertia reducida
    - Ajustar curva de desaceleración para que se sienta natural
    - _Requisitos: 2.1, 2.2_

  - [ ]* 2.4 Escribir property test para inertia reducida
    - **Property 3: Reduced Inertia Deceleration**
    - **Valida: Requisitos 2.1, 2.2**

  - [x] 2.5 Verificar drag funciona con todos los tipos de stickers
    - Probar drag con stickers de imagen existentes
    - Documentar que el sistema está listo para stickers de texto y 3D
    - _Requisitos: 1.1, 1.2, 1.3_

- [x] 3. Implementar Text Animation System mejorado
  - [x] 3.1 Modificar welcome-text-animation.js para animar solo color
    - Actualizar `assets/js/welcome-text-animation.js` para usar GSAP
    - Implementar animación de solo la propiedad `color`
    - Remover animación de `font-weight` del welcome
    - Asegurar que weight permanece constante durante animación
    - _Requisitos: 3.1, 3.2_

  - [ ]* 3.2 Escribir property test para color-only animation
    - **Property 4: Welcome Text Color-Only Animation**
    - **Valida: Requisitos 3.1, 3.2_

- [ ] 4. Implementar Color System con soporte a frontmatter
  - [x] 4.1 Crear ColorSystem con resolución de colores
    - Crear clase `ColorSystem` en `assets/js/systems/color-system.js`
    - Implementar método `resolveColor(entry, colorKey, defaultValue)` con cascada
    - Implementar método `applyColors(element, bgColor, textColor)`
    - Implementar método `invertColors(bgColor, textColor)` para header/footer
    - _Requisitos: 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 10.3_

  - [ ]* 4.2 Escribir property tests para color system
    - **Property 9: 3D Playground Background Color from Frontmatter**
    - **Property 10: Popover Text Color from Frontmatter**
    - **Property 11: Inverted Header Colors**
    - **Property 12: Inverted Footer Colors**
    - **Valida: Requisitos 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 10.3**

  - [x] 4.3 Aplicar colores a 3D playground entries
    - Modificar `assets/js/playground.js` para usar ColorSystem
    - Leer `bg_color` del frontmatter de cada entrada
    - Aplicar color de fondo al contenedor de entrada 3D
    - Usar color por defecto si no está definido
    - _Requisitos: 8.1, 8.2, 8.3_

  - [x] 4.4 Aplicar colores a popover text
    - Modificar renderizado de popover para usar ColorSystem
    - Leer `text_color` del frontmatter
    - Aplicar color de texto a todo contenido del popover
    - Usar color por defecto si no está definido
    - _Requisitos: 9.1, 9.2, 9.3_

  - [x] 4.5 Invertir colores en header y footer
    - Modificar header para aplicar colores invertidos
    - Modificar footer para aplicar colores invertidos
    - Asegurar que contraste y legibilidad se mantienen
    - _Requisitos: 10.1, 10.2, 10.3_

- [x] 5. Implementar Typography System con Neue Regrade Variable
  - [x] 5.1 Importar Neue Regrade Variable desde assets/fonts
    - Verificar que archivo de fuente existe en `assets/fonts/`
    - Crear regla @font-face en `assets/css/app.scss` para Neue Regrade Variable
    - Asegurar que la fuente se carga correctamente
    - _Requisitos: 16.1, 16.2, 16.3_

  - [x] 5.2 Cambiar global sans-serif font stack
    - Modificar `assets/css/app.scss` para usar Neue Regrade Variable como primera opción
    - Actualizar font stack a: "Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    - Aplicar a todos los elementos sans-serif globales
    - _Requisitos: 16.1, 16.2, 16.3_

  - [ ]* 5.3 Escribir property test para Neue Regrade Variable
    - **Property 23: Neue Regrade Variable Font Loading**
    - **Valida: Requisitos 16.1, 16.2, 16.3**

  - [x] 5.4 Definir global serif font stack con Newsreader
    - Importar Newsreader desde Google Fonts o assets
    - Crear regla @font-face en `assets/css/app.scss` para Newsreader
    - Definir global serif font stack: "Newsreader", Georgia, Cambria, "Times New Roman", Times, serif
    - _Requisitos: 12.1, 12.2_

  - [ ]* 5.5 Escribir property test para serif font stack
    - **Property 16: Serif Font Stack Definition**
    - **Valida: Requisitos 12.1, 12.2**

  - [ ] 5.6 Verificar animación de weights con Neue Regrade Variable
    - Probar que animación de font-weight funciona con variable font
    - Verificar que transiciones de weight son suaves
    - Verificar que performance no se degrada
    - _Requisitos: 16.4, 17.1_

  - [ ]* 5.7 Escribir property test para weight animation
    - **Property 24: Weight Animation with Variable Font**
    - **Valida: Requisitos 16.4, 17.1**

- [x] 6. Revisar y corregir scroll y layout
  - [x] 6.1 Revisar páginas de portfolio para scroll completo
    - Revisar `index.html` (welcome) para asegurar scroll completo
    - Revisar `pages/about.html` para asegurar scroll completo
    - Revisar páginas de proyectos en `_works/` para asegurar scroll completo
    - Remover restricciones de overflow si existen
    - _Requisitos: 4.1, 4.2, 4.3_

  - [x]* 6.2 Escribir property test para full vertical scrolling
    - **Property 5: Full Vertical Scrolling Enabled**
    - **Valida: Requisitos 4.1, 4.2, 4.3**

  - [x] 6.3 Hacer about single column en móvil
    - Modificar `pages/about.html` o CSS para single column en < 768px
    - Asegurar que elementos se apilan verticalmente
    - Verificar que contenido es legible y bien espaciado
    - _Requisitos: 5.1, 5.2_

  - [x]* 6.4 Escribir property test para mobile single column
    - **Property 6: Mobile Single Column Layout**
    - **Valida: Requisitos 5.1, 5.2**

  - [x] 6.5 Habilitar scroll en about
    - Modificar `pages/about.html` para habilitar scroll vertical
    - Remover restricciones de overflow
    - Asegurar que scroll es suave sin saltos
    - _Requisitos: 6.1, 6.2, 6.3_

  - [x]* 6.6 Escribir property test para about scroll enabled
    - **Property 7: About Page Scroll Enabled**
    - **Valida: Requisitos 6.1, 6.2, 6.3**

  - [x] 6.7 Verificar scroll hasta el final en móvil
    - Probar scroll en dispositivos móvil (< 768px)
    - Asegurar que último elemento es visible sin cutoff
    - Verificar que scroll funciona consistentemente
    - _Requisitos: 7.1, 7.2_

  - [x]* 6.8 Escribir property test para mobile scroll to bottom
    - **Property 8: Mobile Scroll to Bottom**
    - **Valida: Requisitos 7.1, 7.2**

- [ ] 7. Unificar Sticker System
  - [x] 7.1 Evaluar unificación de YAML (imagen, texto, 3D)
    - Revisar estructura actual de stickers
    - Diseñar estructura unificada con discriminación de tipo
    - Documentar beneficios y costos de unificación
    - _Requisitos: 15.1, 15.2_

  - [x]* 7.2 Escribir property test para unified sticker type discrimination
    - **Property 22: Unified Sticker Type Discrimination**
    - **Valida: Requisitos 15.2**

  - [x] 7.3 Implementar discriminación de tipo en renderizado
    - Crear función unificada que renderiza stickers basado en `type`
    - Soportar type: image, text, 3d
    - Asegurar que cada tipo se renderiza correctamente
    - _Requisitos: 15.2_

  - [x] 7.4 Migrar stickers existentes a estructura unificada base (imagen)
    - Migrar image stickers a estructura unificada como primer paso
    - Verificar que render y drag de image stickers no regresionan
    - _Requisitos: 15.1, 15.2, 15.3_

- [x] 8. Implementar Text Stickers en About
  - [x] 8.1 Crear estructura YAML para text stickers
    - Extender `_data/stickers.yml` con soporte para text stickers
    - Definir propiedades: content (HTML), shape, textColor, bgColor, fontSize, fontWeight, fontFamily, position, draggable
    - Crear ejemplos de text stickers para about
    - _Requisitos: 11.1_

  - [x] 8.2 Implementar renderizado de text stickers
    - Crear función en `assets/js/` para renderizar text stickers desde YAML
    - Aplicar todas las propiedades definidas (color, background, size, weight, font)
    - Asegurar que HTML content se renderiza correctamente
    - _Requisitos: 11.2_

  - [x] 8.3 Crear TextAnimationSystem reutilizable
    - Clase `TextAnimationSystem` disponible en `assets/js/systems/animation-system.js`
    - Métodos disponibles: `animateColorOnly`, `animateWeight`, `animateProperties`
    - _Requisitos: 3.1, 3.2_

  - [x]* 8.4 Escribir property test para text sticker YAML support
    - **Property 13: Text Sticker YAML Support**
    - **Valida: Requisitos 11.1**

  - [x]* 8.5 Escribir property test para text sticker properties applied
    - **Property 14: Text Sticker Properties Applied**
    - **Valida: Requisitos 11.2**

  - [x] 8.6 Soportar HTML content con links en text stickers
    - Modificar renderizado para permitir HTML content
    - Asegurar que links funcionan correctamente
    - Verificar que estilos se aplican correctamente a contenido HTML
    - _Requisitos: 11.1, 11.2_

  - [x] 8.7 Soportar diferentes shapes (rectangular, oval, svg)
    - Implementar soporte para shape: rectangular (default)
    - Implementar soporte para shape: oval (border-radius)
    - Implementar soporte para shape: svg (custom SVG mask)
    - _Requisitos: 11.1, 11.2_

  - [x] 8.8 Hacer text stickers draggables
    - Integrar text stickers con StickerDragSystem
    - Asegurar que drag behavior es idéntico a image stickers
    - Verificar que anchor centering y reduced inertia funcionan
    - _Requisitos: 11.3_

  - [x]* 8.9 Escribir property test para text sticker drag consistency
    - **Property 15: Text Sticker Drag Consistency**
    - **Valida: Requisitos 11.3**

- [ ] 9. Implementar 3D Sticker Loader
  - [ ] 9.1 Crear 3D Sticker Loader reutilizando Three.js
    - Crear clase `ThreeDStickerLoader` en `assets/js/systems/3d-loader.js`
    - Reutilizar código Three.js existente de playground
    - Implementar método `loadModel(modelPath, format)` para .obj, .gltf, .fbx
    - Implementar método `render(container, model, options)`
    - Implementar método `applyProperties(model, properties)` para posición, rotación, escala
    - _Requisitos: 13.1, 13.2_

  - [ ]* 9.2 Escribir property test para 3D model format support
    - **Property 17: 3D Model Format Support**
    - **Valida: Requisitos 13.1**

  - [ ] 9.3 Implementar lazy loading para modelos 3D
    - Implementar método `lazyLoad(modelPath)` que carga bajo demanda
    - Asegurar que lazy loading no bloquea renderizado de página
    - Usar Intersection Observer para detectar cuando modelo es visible
    - _Requisitos: 13.1_

  - [ ] 9.4 Implementar error handling para 3D models
    - Capturar errores de carga de modelo
    - Mostrar fallback/placeholder si modelo falla
    - Loguear errores de forma clara
    - _Requisitos: 13.4_

  - [ ]* 9.5 Escribir property test para 3D model error handling
    - **Property 20: 3D Model Error Handling**
    - **Valida: Requisitos 13.4**

  - [ ] 9.6 Hacer 3D stickers draggables
    - Integrar 3D stickers con StickerDragSystem
    - Implementar método `makeDraggable(model, dragSystem)`
    - Asegurar que drag behavior funciona con modelos 3D
    - _Requisitos: 13.3_

  - [ ]* 9.7 Escribir property test para 3D sticker reuses Three.js
    - **Property 18: 3D Sticker Reuses Three.js**
    - **Valida: Requisitos 13.2**

  - [ ]* 9.8 Escribir property test para 3D sticker draggable
    - **Property 19: 3D Sticker Draggable**
    - **Valida: Requisitos 13.3**

- [ ] 10. Crear YAML para 3D Stickers
  - [ ] 10.1 Extender estructura YAML para 3D stickers
    - Extender `_data/stickers.yml` con soporte para 3D stickers
    - Definir propiedades: modelPath, format (obj/gltf/fbx), position, rotation, scale, draggable, lazyLoad
    - Asegurar que estructura es consistente con image y text stickers
    - _Requisitos: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 10.2 Escribir property test para 3D sticker YAML configuration
    - **Property 21: 3D Sticker YAML Configuration**
    - **Valida: Requisitos 14.1, 14.2, 14.3, 14.4**

  - [ ] 10.3 Crear YAML para 3D stickers en welcome
    - Definir 3D stickers para página welcome en `_data/stickers.yml`
    - Especificar modelos, posiciones, rotaciones, escalas
    - Asegurar que stickers se cargan y renderizan correctamente
    - _Requisitos: 13.1, 14.1, 14.2_

  - [ ] 10.4 Crear YAML para 3D stickers en about
    - Definir 3D stickers para página about en `_data/stickers.yml`
    - Especificar modelos, posiciones, rotaciones, escalas
    - Asegurar que stickers se cargan y renderizan correctamente
    - _Requisitos: 13.1, 14.1, 14.2_

- [ ] 11. Implementar Image Hover Zoom con GSAP
  - [ ] 11.1 Crear Image Hover System con GSAP
    - Crear clase `ImageHoverSystem` en `assets/js/systems/image-hover.js`
    - Implementar método `init(imageElement, options)` para inicializar hover
    - Implementar método `applyZoom(scale, duration)` para aplicar zoom
    - Implementar método `revertZoom(duration)` para revertir zoom
    - Implementar método `debounceHover(callback, delay)` para debounce
    - _Requisitos: 18.1, 18.2_

  - [ ]* 11.2 Escribir property test para image hover zoom animation
    - **Property 25: Image Hover Zoom Animation**
    - **Valida: Requisitos 18.1, 18.2**

  - [ ] 11.3 Aplicar zoom 1.05-1.1x en hover
    - Configurar escala de zoom entre 1.05 y 1.1x
    - Aplicar a todas las imágenes interactivas
    - Asegurar que zoom es sutil y divertido
    - _Requisitos: 18.1, 18.2_

  - [ ] 11.4 Revert suave al salir del hover
    - Implementar revert suave a escala 1.0
    - Usar duración consistente (300-400ms)
    - Asegurar que revert es suave sin saltos
    - _Requisitos: 18.4_

  - [ ]* 11.5 Escribir property test para image hover zoom revert
    - **Property 26: Image Hover Zoom Revert**
    - **Valida: Requisitos 18.4**

  - [ ] 11.6 Debounce hover events
    - Implementar debounce para evitar múltiples triggers
    - Configurar delay apropiado (50-100ms)
    - Verificar que performance no se degrada
    - _Requisitos: 18.1, 18.2_

- [ ] 12. Checkpoint - Verificar todos los sistemas base
  - Asegurar que todos los tests pasan
  - Verificar que todos los sistemas funcionan correctamente
  - Preguntar al usuario si hay preguntas o problemas

- [ ] 13. Implementar suite de tests integral
  - [ ] 13.1 Escribir unit tests para Sticker Drag System
    - Test anchor centering con posiciones específicas del cursor
    - Test inertia calculation y reduced deceleration
    - Test cursor tracking durante drag
    - Test edge cases (drag fuera de viewport, etc.)
    - _Requisitos: 1.1, 1.2, 1.3, 2.1, 2.2_

  - [ ] 13.2 Escribir unit tests para Text Animation System
    - Test color-only animation en welcome
    - Test weight constancy durante animación
    - Test smooth color transitions
    - Test edge cases (colores inválidos, etc.)
    - _Requisitos: 3.1, 3.2_

  - [ ] 13.3 Escribir unit tests para Color System
    - Test frontmatter resolution
    - Test default values
    - Test color inversion
    - Test invalid color values
    - _Requisitos: 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 10.3_

  - [ ] 13.4 Escribir unit tests para Typography System
    - Test font loading
    - Test font stack application
    - Test weight animation
    - Test variable font support
    - _Requisitos: 12.1, 12.2, 16.1, 16.2, 16.3, 16.4, 17.1_

  - [ ] 13.5 Escribir unit tests para Layout System
    - Test responsive breakpoints
    - Test single column layout en móvil
    - Test scroll behavior
    - Test content visibility
    - _Requisitos: 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3, 7.1, 7.2_

  - [ ] 13.6 Escribir unit tests para 3D Loader
    - Test model loading para .obj, .gltf, .fbx
    - Test error handling
    - Test lazy loading
    - Test property application
    - _Requisitos: 13.1, 13.2, 13.3, 13.4_

  - [ ] 13.7 Escribir unit tests para Image Hover System
    - Test zoom animation
    - Test zoom revert
    - Test debounce
    - Test edge cases
    - _Requisitos: 18.1, 18.2, 18.4_

  - [ ] 13.8 Escribir integration tests para todos los sistemas
    - Test sticker drag con todos los tipos (imagen, texto, 3D)
    - Test color system con todos los componentes
    - Test typography system con todos los font stacks
    - Test layout responsiveness en todos los breakpoints
    - Test 3D models con todos los formatos soportados
    - _Requisitos: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 12.1, 12.2, 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 14.4, 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4, 17.1, 18.1, 18.2, 18.4_

- [ ] 14. Final checkpoint - Verificar suite de tests completa
  - Asegurar que todos los tests pasan
  - Verificar que coverage es completo
  - Preguntar al usuario si hay preguntas o problemas

- [x] 15. Sketchbook - Ocultar tags visualmente
  - [x] 15.1 Ocultar sección de tags sin eliminar lógica de filtrado
    - Mantener hooks/datos para futura reactivación
    - _Requisitos: 22.1, 22.2, 22.3_

- [x] 16. Bugfix - Centrado de popover de video
  - [x] 16.1 Corregir cálculo de centrado de popover para media video
    - Unificar posicionamiento con otros tipos de popover
    - Recalcular en resize/orientation change
    - _Requisitos: 24.1, 24.2, 24.3_

  - [ ]* 16.2 Escribir tests de centrado de popover
    - _Requisitos: 24.1, 24.2_

- [ ] 17. Works - Convertir listado a 2-column masonry
  - [x] 17.1 Implementar layout masonry en `pages/work.html`/CSS
    - Usar estrategia sin forzar alturas por fila
    - Mantener responsive (1 columna en móvil, 2 en desktop/tablet)
    - _Requisitos: 20.1, 20.2, 20.3, 20.4_

  - [ ]* 17.2 Escribir tests visuales/DOM para masonry
    - Validar que no hay igualación artificial de filas
    - _Requisitos: 20.2, 20.3_

- [x] 18. Work Detail - Flechas flotantes prev/next
  - [x] 18.1 Añadir UI flotante lateral en layout de detalle
    - Flecha izquierda: trabajo anterior
    - Flecha derecha: siguiente trabajo
    - _Requisitos: 21.1, 21.2_

  - [x] 18.2 Añadir accesibilidad y teclado
    - ARIA labels
    - Soporte `ArrowLeft` y `ArrowRight`
    - _Requisitos: 21.3_

  - [ ]* 18.3 Escribir tests de navegación prev/next
    - _Requisitos: 21.2, 21.3, 21.4_

- [x] 19. Sketchbook - Agrupar cards por día con divisores
  - [x] 19.1 Agrupar entries por fecha diaria en render server-side
    - Añadir encabezado de fecha (`h3`) por grupo
    - Insertar divisor horizontal entre grupos
    - _Requisitos: 23.1, 23.2, 23.3, 23.4_

  - [ ]* 19.2 Escribir tests de agrupación por día
    - _Requisitos: 23.1, 23.4_

- [x] 20. Extraer utilidad reutilizable de touch scroll lock
  - [x] 20.1 Crear módulo compartido de lock/unlock táctil
    - API propuesta: `lock(contextId)`, `unlock(contextId)`, `isLocked()`
    - _Requisitos: 25.1_

  - [x] 20.2 Migrar Sticker drag a la utilidad compartida
    - Reemplazar implementación ad hoc en `sticker-drag.js`
    - _Requisitos: 25.2, 25.3, 25.4_

  - [x] 20.3 Integrar lock temporal al interactuar con 3D en móvil
    - Activar durante drag/orbit/interaction y liberar al finalizar
    - _Requisitos: 25.2, 25.3, 25.4_

- [x] 21. Home - Color influence de stickers sobre Welcome
  - [x] 21.1 Extender YAML de stickers con `influenceColor` y `influenceRadius`
    - Añadir propiedades en `_data/stickers.yml` para stickers de `page: welcome`
    - Definir defaults seguros si faltan valores
    - _Requisitos: 19.2, 19.3_

  - [x] 21.2 Implementar motor de influencia por proximidad en welcome
    - Detectar distancia entre sticker y letras/spans de welcome text
    - Aplicar color con falloff suave según radio
    - Resolver influencia de múltiples stickers activos
    - _Requisitos: 19.1, 19.4_

  - [x]* 21.3 Escribir tests para influencia radial de color
    - Validar entrada/salida de radio y transición de color
    - _Requisitos: 19.1, 19.4_

- [ ] 22. Sketchbook cards draggables con baja influencia
  - [ ] 22.1 Añadir drag manual ligero sobre cards
    - Menor desplazamiento y mayor retorno que stickers
    - _Requisitos: 26.1, 26.3, 26.4_

  - [ ] 22.2 Mantener integración con físicas entre cards
    - No romper interacciones Matter.js existentes
    - _Requisitos: 26.2_

  - [ ]* 22.3 Escribir tests de convivencia drag+física
    - _Requisitos: 26.1, 26.2, 26.3_

- [ ] 23. Three.js avanzado para Sketchbook 3D
  - [ ] 23.1 Soportar frontmatter de material/sombras
    - `material_type`, `material_color`, `wireframe`, `cast_shadows`
    - _Requisitos: 27.1, 27.3_

  - [ ] 23.2 Implementar modo `matcap` con textura en assets
    - Cargar textura matcap y aplicarla según frontmatter
    - _Requisitos: 27.2_

  - [ ] 23.3 Centralizar configuración de luces editable
    - Ambient + key/fill/rim con posición/intensidad/color
    - _Requisitos: 28.1, 28.2, 28.3, 28.4_

  - [ ] 23.4 Mejorar calidad de sombras (antialiasing)
    - Ajustar mapSize/bias/normalBias y filtros
    - Definir presets mobile/desktop
    - _Requisitos: 29.1, 29.2, 29.3_

  - [ ]* 23.5 Escribir tests de frontmatter 3D y render settings
    - _Requisitos: 27.1, 27.2, 28.1, 29.1_

- [ ] 24. Sistema de efectos de sonido para interacciones (futuro)
  - [ ] 24.1 Crear módulo `interaction-sfx.js` con configuración centralizada
    - API: init/play/setEnabled/setVolume
    - _Requisitos: 30.1, 30.2, 30.5_

  - [ ] 24.2 Integrar SFX en stickers, cards y popovers
    - Hover/pick/drop/open/close según evento
    - _Requisitos: 30.1_

  - [ ] 24.3 Añadir preload/cache y fallback silencioso
    - Sin bloqueo si autoplay/audio falla
    - _Requisitos: 30.3, 30.5_

  - [ ]* 24.4 Añadir control global de mute/volumen
    - Preferencias persistentes y accesibilidad
    - _Requisitos: 30.4_

## Notas

- Las tareas marcadas con `*` son opcionales y pueden saltarse para MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades de correctness universales
- Los unit tests validan ejemplos específicos y edge cases
- El orden de tareas asegura que sistemas base se completan primero, luego componentes, y finalmente testing
