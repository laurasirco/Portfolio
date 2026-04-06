# Requirements Document: Backlog Section

## Introduction

Este spec define una nueva sección editorial llamada `Backlog` para el portfolio. Su función es documentar el seguimiento de trabajo en curso mediante entradas cortas y acumulativas: decisiones, bloqueos, pruebas, avances visuales y notas de proceso.

La sección debe convivir con los dominios ya existentes:

- `Work`: proyectos terminados y pulidos
- `Sketchbook`: ideas sueltas, pruebas aisladas y experimentos
- `Backlog`: diario de desarrollo de un proyecto activo

En esta primera iteración, `Backlog` se plantea como una lista cronológica simplificada, cercana a un blog mínimo, pero todavía integrada dentro del portfolio.

## Glossary

- **Backlog**: sección editorial para el seguimiento de un proyecto vivo
- **Backlog entry**: una entrada individual de diario o progreso
- **Active project**: proyecto actualmente documentado en `Backlog`
- **Project slug**: identificador corto del proyecto para agrupar entradas
- **Milestone**: momento relevante dentro del desarrollo del proyecto
- **Status**: estado editorial de la entrada, como `note`, `wip`, `decision`, `milestone`, `blocker`
- **Tag**: etiqueta opcional para filtrar entradas por tema, no como eje principal de navegación
- **Collection**: colección Jekyll con frontmatter y renderizado propio

## Requirements

### Requirement 1: Crear un tercer dominio editorial claro

**User Story:** Como visitante, quiero entender la diferencia entre proyectos terminados, ideas sueltas y seguimiento de un proyecto en curso, para navegar el portfolio sin confusión.

#### Acceptance Criteria

1. WHEN a visitor sees the site navigation, THE Site SHALL present `Backlog` as a distinct section alongside `Work` and `Sketchbook`
2. THE section SHALL communicate that it documents an in-progress project rather than finished case studies
3. THE section SHALL NOT read like a generic chronological blog disconnected from the portfolio structure

---

### Requirement 2: Priorizar una primera iteración simple

**User Story:** Como autora, quiero empezar con una versión muy simple de `Backlog`, para usarla ya sin diseñar todavía la arquitectura de proyectos.

#### Acceptance Criteria

1. THE first iteration SHALL work without project-level navigation or grouping
2. THE section SHALL render as a single chronological list of entries
3. THE implementation SHALL leave room for future project-based filtering without requiring a rewrite

---

### Requirement 3: Priorizar lectura cronológica tipo diario

**User Story:** Como visitante, quiero leer las entradas en orden temporal, para seguir el progreso de forma simple.

#### Acceptance Criteria

1. WHEN viewing the backlog index, THE entries SHALL be grouped or ordered by date with newest entries first
2. EACH entry SHALL display its date prominently
3. THE reading model SHALL emphasize sequential progress over category browsing

---

### Requirement 4: Mantener las entradas solo dentro del índice

**User Story:** Como visitante, quiero leer cada entrada directamente en la lista, para no tener que abrir páginas individuales.

#### Acceptance Criteria

1. THE first iteration SHALL NOT require per-entry detail pages
2. EACH entry SHALL be fully readable from the backlog index
3. THE UI SHALL NOT suggest click-through behavior to standalone entry pages

---

### Requirement 5: Soportar entradas ligeras y heterogéneas

**User Story:** Como autora, quiero publicar avances pequeños sin tener que escribir una case study completa, para mantener el seguimiento vivo mientras desarrollo.

#### Acceptance Criteria

1. EACH backlog entry SHALL support short text as the minimum viable content
2. THE content model SHALL support optional media such as image, video, GIF, embed, or text-only entry
3. THE system SHALL allow entries that capture process notes, doubts, tests, or partial outcomes

---

### Requirement 6: Introducir metadatos editoriales específicos de seguimiento

**User Story:** Como autora, quiero distinguir decisiones, bloqueos, hitos y work-in-progress, para que el seguimiento tenga más estructura que un diario plano.

#### Acceptance Criteria

1. EACH backlog entry SHALL support a `status` field
2. THE supported editorial states SHALL include at minimum `note`, `wip`, `decision`, `milestone`, and `blocker`
3. THE interface SHALL expose the status in a readable but lightweight way

---

### Requirement 7: Mantener los tags fuera de la primera iteración

**User Story:** Como autora, quiero arrancar sin filtros ni taxonomías, para no complicar una sección que todavía está naciendo.

#### Acceptance Criteria

1. THE first iteration SHALL work without tags
2. THE section SHALL NOT depend on tag-based browsing
3. THE spec SHALL leave tags or filters as optional future extensions

---

### Requirement 8: Mantener continuidad visual con Sketchbook sin duplicarlo

**User Story:** Como visitante, quiero sentir que `Backlog` pertenece al mismo portfolio, pero que tiene una lógica distinta a `Sketchbook`.

#### Acceptance Criteria

1. THE section SHALL preserve the portfolio's editorial and playful tone
2. THE presentation SHALL feel more focused and legible than `Sketchbook`
3. THE section SHALL avoid reading as a duplicate grid of disconnected experiments or as a heavy blog template

---

### Requirement 9: Permitir una transición clara de Backlog a Work

**User Story:** Como autora, quiero que material desarrollado en `Backlog` pueda terminar convertido en una pieza de `Work`, para que el contenido acompañe el ciclo real del proyecto.

#### Acceptance Criteria

1. THE spec SHALL treat `Backlog` and `Work` as complementary stages, not competing sections
2. THE backlog model SHALL preserve reusable material such as dates, decisions, media, and milestones
3. THE future addition of project-level grouping or linking SHALL be possible without restructuring unrelated content

---

### Requirement 10: Ajustarse al stack estático actual

**User Story:** Como desarrolladora, quiero implementar `Backlog` con el stack actual del portfolio, para no introducir complejidad innecesaria.

#### Acceptance Criteria

1. THE implementation SHALL use Jekyll collections, pages, layouts, includes, and frontmatter-driven rendering
2. THE section SHALL NOT require backend features, CMS logic, or account systems
3. THE implementation SHALL keep `_site` as generated output only
