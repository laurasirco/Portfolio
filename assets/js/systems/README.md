# Systems - Módulos Reutilizables

Este directorio contiene los sistemas base reutilizables para el Portfolio Polish. Cada sistema proporciona funcionalidad específica que se utiliza en múltiples componentes.

## Módulos Disponibles

### 1. ColorSystem (`color-system.js`)

Sistema para gestionar colores con soporte a frontmatter y valores por defecto.

**Características:**
- Resolución de colores desde frontmatter o defaults
- Aplicación de colores a elementos
- Inversión de colores (para header/footer)
- Validación de valores de color
- Cálculo de contraste

**Uso:**
```javascript
import { ColorSystem } from './systems/color-system.js';

const colorSystem = new ColorSystem({
  bgColor: '#FFFFFF',
  textColor: '#000000'
});

// Resolver color desde frontmatter o default
const bgColor = colorSystem.resolveColor(entry, 'bg_color', '#FFFFFF');

// Aplicar colores a elemento
colorSystem.applyColors(element, bgColor, textColor);

// Invertir colores (para header/footer)
colorSystem.invertColors(headerElement, bgColor, textColor);
```

**Métodos:**
- `resolveColor(entry, colorKey, defaultValue)` - Resuelve color desde cascada
- `applyColors(element, bgColor, textColor)` - Aplica colores a elemento
- `invertColors(element, bgColor, textColor)` - Invierte colores
- `isValidColor(color)` - Valida si es un color válido
- `toHex(color)` - Convierte color a formato hex
- `hasContrast(color1, color2)` - Calcula contraste entre colores
- `setDefaults(newDefaults)` - Actualiza defaults del sistema

---

### 2. StickerDragSystem (`drag-system.js`)

Sistema para gestionar el arrastre de stickers con comportamiento consistente.

**Características:**
- Anchor centrado en la posición del cursor
- Seguimiento suave del cursor durante arrastre
- Inertia reducida (50% menos) al soltar
- Soporte para todos los tipos de stickers
- Callbacks opcionales para eventos

**Uso:**
```javascript
import { StickerDragSystem } from './systems/drag-system.js';

const dragSystem = new StickerDragSystem();

dragSystem.init(stickerElement, {
  inertiaMultiplier: 0.5,
  onDragStart: (event) => console.log('Drag started'),
  onDragEnd: (event) => console.log('Drag ended')
});

// Limpiar cuando ya no se necesita
dragSystem.destroy();
```

**Métodos:**
- `init(element, options)` - Inicializa sistema de arrastre
- `startDrag(event)` - Inicia arrastre desde posición del cursor
- `updateDrag(event)` - Actualiza posición durante arrastre
- `endDrag(event)` - Finaliza arrastre con inertia
- `calculateReducedInertia(velocity)` - Calcula inertia reducida
- `destroy()` - Limpia event listeners

**Opciones:**
- `inertiaMultiplier` (default: 0.5) - Multiplicador de inertia
- `onDragStart` - Callback al iniciar arrastre
- `onDragEnd` - Callback al finalizar arrastre

---

### 3. TextAnimationSystem (`animation-system.js`)

Sistema para animar propiedades de texto en diferentes contextos.

**Características:**
- Animación de solo color (welcome)
- Animación de font-weight (tipografía variable)
- Animación de múltiples propiedades
- Integración con GSAP para animaciones suaves
- Fallback a CSS transitions si GSAP no está disponible

**Uso:**
```javascript
import { TextAnimationSystem } from './systems/animation-system.js';

const animationSystem = new TextAnimationSystem({
  defaultDuration: 1000
});

// Animar solo color
await animationSystem.animateColorOnly(element, '#000000', '#FF0000', 500);

// Animar weight
await animationSystem.animateWeight(element, 400, 700, 500);

// Animar múltiples propiedades
await animationSystem.animateProperties(element, {
  color: '#FF0000',
  fontWeight: 700,
  opacity: 0.5
}, 500);

// Cancelar animaciones
animationSystem.cancelAll();
animationSystem.cancel(element);
```

**Métodos:**
- `animateColorOnly(element, fromColor, toColor, duration)` - Anima solo color
- `animateWeight(element, fromWeight, toWeight, duration)` - Anima weight
- `animateProperties(element, properties, duration)` - Anima múltiples propiedades
- `cancelAll()` - Cancela todas las animaciones
- `cancel(element)` - Cancela animación de elemento específico

**Opciones:**
- `defaultDuration` (default: 1000) - Duración por defecto en ms

---

### 4. TypographySystem (`typography-system.js`)

Sistema para gestionar el stack tipográfico global y la animación de pesos para fuentes variables.

**Características:**
- Carga de `Neue Regrade Variable` y `Newsreader` mediante la Font Loading API cuando está disponible
- Aplicación explícita de stacks `sans`, `serif` y `mono`
- Animación de `font-weight` con sincronización de `font-variation-settings`
- Verificación de soporte a variable fonts

**Uso:**
```javascript
import { TypographySystem } from './systems/typography-system.js';

const typographySystem = new TypographySystem();

await typographySystem.loadFonts();
typographySystem.applyFontStack(element, 'sans');
await typographySystem.animateWeight(element, 400, 700, 300);
```

---

## Estructura de Archivos

```
assets/js/systems/
├── color-system.js          # Sistema de colores
├── drag-system.js           # Sistema de arrastre
├── animation-system.js      # Sistema de animaciones
├── typography-system.js     # Sistema tipográfico
├── systems.test.js          # Tests de estructura
└── README.md                # Este archivo
```

## Integración con Otros Módulos

Estos sistemas están diseñados para ser reutilizados en:

- **Sticker Rendering**: Usar `StickerDragSystem` para todos los tipos de stickers
- **Welcome Page**: Usar `TextAnimationSystem` para animación de color
- **About Page**: Usar `ColorSystem` para colores de frontmatter
- **Playground**: Usar `ColorSystem` para colores de 3D entries
- **Header/Footer**: Usar `ColorSystem` para inversión de colores

## Testing

Los tests de estructura verifican:
- ✓ Todos los módulos se cargan correctamente
- ✓ Las clases base se instancian sin errores
- ✓ Todos los métodos requeridos están presentes
- ✓ Las opciones por defecto funcionan correctamente
- ✓ Las opciones personalizadas se aceptan correctamente

Ejecutar tests:
```bash
npm test -- assets/js/systems/systems.test.js
```

## Notas de Implementación

### ColorSystem
- Soporta hex (#FFF, #FFFFFF), rgb, rgba, hsl, hsla, y named colors
- La cascada de resolución es: Frontmatter → Component Default → Global Default
- El cálculo de contraste es simple (basado en luminancia)

### StickerDragSystem
- El anchor se centra en la posición del cursor al agarrar
- La inertia se reduce 50% por defecto (configurable)
- Usa `requestAnimationFrame` para animaciones suaves
- Soporta todos los tipos de stickers (imagen, texto, 3D)

### TextAnimationSystem
- Usa GSAP si está disponible, sino fallback a CSS transitions
- Las animaciones retornan Promises para mejor control
- Solo una animación por elemento a la vez (la anterior se cancela)
- Soporta camelCase a kebab-case conversion para CSS

## Próximos Pasos

Estos sistemas base serán utilizados en:
1. Tarea 2: Implementar StickerDragSystem mejorado
2. Tarea 3: Implementar Text Animation System mejorado
3. Tarea 4: Implementar Color System con soporte a frontmatter
4. Tarea 5: Implementar Typography System
5. Tareas posteriores: Integración con stickers, layout, etc.
