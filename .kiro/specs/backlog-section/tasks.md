# Plan de Implementación: Backlog Section

## Descripción General

Este plan implementa una nueva sección `Backlog` como tercer dominio editorial del portfolio. La estrategia es introducir primero una lista cronológica mínima, después pulir la lectura editorial, y dejar filtros o agrupaciones por proyecto para una fase posterior.

## Tareas

- [ ] 1. Definir modelo de contenido para backlog
  - [ ] 1.1 Añadir colección `backlog` en [`_config.yml`](/Users/laura/Sites/Portfolio/_config.yml)
    - Registrar `backlog` como colección Jekyll
    - Mantener el modelo alineado con las colecciones existentes
    - _Requisitos: 2.1, 10.1_

  - [ ] 1.2 Crear directorio [`_backlog/`](/Users/laura/Sites/Portfolio/_backlog) con entradas de ejemplo
    - Añadir al menos 3 entradas representando `note`, `decision` y `milestone`
    - Verificar que cada entrada incluye `status`, `date` y `title`
    - _Requisitos: 3.1, 5.1, 6.1_

- [ ] 2. Crear la página principal de Backlog
  - [ ] 2.1 Añadir [`pages/backlog.html`](/Users/laura/Sites/Portfolio/pages/backlog.html)
    - Crear ruta `/backlog/`
    - Renderizar una lista cronológica simple de entradas
    - Cargar entradas ordenadas por fecha descendente
    - _Requisitos: 1.1, 3.1, 4.1_

  - [ ] 2.2 Añadir enlace a `Backlog` en [`_includes/header.html`](/Users/laura/Sites/Portfolio/_includes/header.html)
    - Insertar navegación junto a `Work` y `Sketchbook`
    - Marcar estado activo cuando `page.url` sea `/backlog/`
    - _Requisitos: 1.1_

- [ ] 3. Implementar layout y componentes de timeline
  - [ ] 3.1 Crear [`_layouts/backlog.html`](/Users/laura/Sites/Portfolio/_layouts/backlog.html)
    - Basarse en la shell actual del sitio
    - Cargar solo los scripts/estilos necesarios
    - _Requisitos: 8.1, 10.1_

  - [ ] 3.2 Crear [`_includes/backlog-entry.html`](/Users/laura/Sites/Portfolio/_includes/backlog-entry.html)
    - Renderizar fecha, título, estado, body o excerpt y media opcional
    - Soportar `text`, `image`, `gif`, `video` y `embed`
    - Evitar links a páginas detalle de entrada
    - _Requisitos: 4.1, 4.2, 5.3_

  - [ ] 3.3 Diseñar una UI de lectura editorial en [`assets/css/app.scss`](/Users/laura/Sites/Portfolio/assets/css/app.scss)
    - Crear estilos específicos para lista, fechas y badges de `status`
    - Mantener una presentación más lineal y legible que `Sketchbook`
    - _Requisitos: 8.1, 8.2_

- [ ] 4. Definir relación editorial con Work y Sketchbook
  - [ ] 4.1 Añadir copy de contexto en la cabecera de `Backlog`
    - Explicar brevemente que la sección reúne entradas de seguimiento y proceso
    - Diferenciarla explícitamente de `Sketchbook` y `Work`
    - _Requisitos: 1.2, 8.3_

  - [ ] 4.2 Dejar preparado el modelo para futura agrupación por proyecto
    - Documentar campos opcionales futuros como `project` o `tags`
    - Evitar que la primera implementación bloquee una segunda fase con filtros
    - _Requisitos: 2.3, 7.3, 9.3_

- [ ] 5. Verificar integración
  - [ ] 5.1 Ejecutar build local de Jekyll
    - Confirmar que la nueva colección se procesa correctamente
    - Verificar que `/backlog/` renderiza sin errores Liquid
    - _Requisitos: 10.1, 10.2_

  - [ ] 5.2 Revisar responsive y legibilidad
    - Validar lectura cómoda en móvil y desktop
    - Verificar que la lista no se siente como grid caótica ni como plantilla pesada de blog
    - _Requisitos: 3.2, 8.2_

  - [ ] 5.3 Añadir tests solo si aparece lógica interactiva no trivial
    - Cubrir renderizado dinámico solo si se introduce JavaScript específico
    - Evitar tests superfluos para marcado estático simple
    - _Requisitos: 10.1_
