# Design Document: Backlog Section

## Overview

`Backlog` se propone como una nueva sección del portfolio para narrar trabajo en curso. En esta primera iteración debe sentirse como un blog simplificado: entradas en lista, orden cronológico y lectura directa desde el índice.

La decisión principal del spec es esta:

- usar una **colección dedicada** para `Backlog`
- modelar las entradas como **lista cronológica simple**
- no introducir todavía navegación por proyectos, hero, ni páginas detalle

Esto encaja mejor con el producto actual porque conserva tres dominios editoriales claros:

- `Work` muestra piezas cerradas
- `Sketchbook` recoge exploraciones sueltas
- `Backlog` sigue una obra viva de forma continua

## Goals

1. Dar espacio a un seguimiento más íntimo y frecuente que `Work`
2. Evitar que ideas aisladas y desarrollo sostenido queden mezclados en `Sketchbook`
3. Mantener una implementación estática, simple y alineada con el modelo Jekyll actual
4. Dejar abierta la puerta a una futura capa de proyectos y filtros sin forzarla ahora

## Non-Goals

1. No convertir el portfolio en un blog tradicional con archivo mensual, feed central y taxonomías complejas
2. No introducir autenticación, comentarios o workflow editorial de backend
3. No replicar exactamente la UI caótica y física de `Sketchbook`
4. No exigir páginas detail para cada entrada en la primera iteración

## Recommendation

### Recommended Information Architecture

La arquitectura recomendada es:

- `pages/backlog.html` como índice principal en `/backlog/`
- colección `_backlog/` para las entradas

Cada entrada de `_backlog/` representa un momento puntual de trabajo. El índice muestra:

1. una cronología invertida de entradas
2. fecha visible
3. cuerpo o excerpt suficiente para leerse sin hacer click

### Why a Simplified Blog Model Fits the First Iteration

En esta fase sí tiene sentido acercarse a un formato blog mínimo por tres razones:

1. reduce la fricción para empezar a publicar
2. encaja bien con una lectura cronológica de diario
3. evita diseñar demasiado pronto la arquitectura de proyectos

La diferencia con un blog tradicional es que aquí no habrá, de momento, páginas detalle, archivo complejo ni sistema de tags como navegación principal.

## Content Model

### Collection

Se añadirá una colección nueva:

```yml
collections:
  backlog:
    output: false
```

`output: false` es la opción recomendada en esta iteración porque las entradas viven solo en el índice expandido. Si más adelante se quieren páginas detalle por entrada, puede pasar a `output: true`.

### Entry Frontmatter

Cada archivo en `_backlog/` usará un frontmatter parecido a este:

```yaml
---
layout: backlog
title: Naming the core loop
status: decision
date: "2026-04-06"
media_type: image
media: /assets/backlog/glass-house/naming-board.png
excerpt: "Locked the language for the main loop after three failed directions."
---
```

### Field Definitions

- `title`: título visible de la entrada
- `status`: tipo editorial de la actualización
- `date`: fecha de la entrada
- `media_type`: `image`, `video`, `gif`, `embed`, `text`
- `media`: asset o embed principal
- `excerpt`: resumen corto para índice o cards

Campos futuros reservados pero no necesarios ahora:

- `project`
- `phase`
- `tags`
- `featured`

## UX Model

### Index Page

La página `/backlog/` tendrá dos zonas:

1. **Header simple**
   - título de sección
   - una frase corta de contexto, opcional

2. **Timeline / list**
   - entradas ordenadas de más reciente a más antigua
   - fecha visible
   - título
   - `status`
   - body o excerpt visible en la propia lista
   - media si existe

No habrá navegación secundaria ni filtros en esta fase.

### Visual Direction

`Backlog` debe sentirse más enfocado que `Sketchbook`. La dirección visual recomendada es:

- una lista vertical clara
- jerarquía tipográfica clara
- ritmo editorial de diario o bitácora
- acentos de color por `status`
- menos ruido compositivo que `Sketchbook`, pero sin perder personalidad

### Status Presentation

Los estados editoriales tendrán tratamiento visual simple:

- `note`: neutral
- `wip`: activo/en proceso
- `decision`: marcado y legible
- `milestone`: celebratorio pero sobrio
- `blocker`: contraste alto

Esto mejora la lectura del proceso sin depender de texto largo.

## Template Architecture

### Files

Implementación sugerida:

- `pages/backlog.html`
- `_layouts/backlog.html`
- `_includes/backlog-entry.html`
- `_backlog/*.md`

### Rendering Strategy

El índice debe renderizarse en Liquid a partir de `site.backlog`, igual que `Sketchbook` ya renderiza `site.playground`.

Se recomienda:

- ordenar por `date` descendente
- renderizar cada entrada completa o semicompleta en la propia lista
- no agrupar por proyecto en la primera iteración
- dejar la puerta abierta a un filtro por proyecto más adelante

## Alternatives Considered

### Option A: Reuse `_posts`

No es la opción recomendada porque mete una semántica de blog demasiado fuerte. Aun así, la experiencia deseada sí puede inspirarse en un blog mínimo.

### Option B: Fold Backlog into `Sketchbook`

Descartado porque mezclaría ideas aisladas con seguimiento sostenido. Eso borra la diferencia editorial que el usuario quiere crear.

### Option C: Project-first navigation from day one

Descartado para la primera versión porque introduce una capa de arquitectura que ahora mismo no hace falta.

## Migration Path to Work

Más adelante, cuando exista la capa de proyectos:

1. `Backlog` podrá filtrar o agrupar por proyecto
2. `Work` podrá enlazar a ese archivo de proceso
3. ambas capas convivirán sin invalidar la lista cronológica original

Esto refuerza el arco narrativo del portfolio: idea, proceso, resultado.

## Risks And Mitigations

### Risk 1: Solapamiento con Sketchbook

Mitigación:

- definir copy claro en la intro de ambas secciones
- usar una UI más lineal y menos fragmentaria en `Backlog`
- reservar la agrupación por proyecto para una fase posterior

### Risk 2: Convertirse en blog genérico

Mitigación:

- usar tags solo como filtro secundario
- mantener el foco en la lista cronológica simple
- evitar taxonomías pesadas y archivo de posts tradicional

### Risk 3: Sobrecarga editorial

Mitigación:

- permitir entradas mínimas de texto corto
- soportar texto-only
- no exigir páginas detalle en la primera fase
