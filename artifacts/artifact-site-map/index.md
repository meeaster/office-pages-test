# Artifact site map

A Wardley map of what the office's artifact site is built from, from what a reader needs down to the commodities underneath.

```mermaid
wardley-beta
title Artifact site

anchor Reader [0.95, 0.60]
component Shared page [0.82, 0.55]
component Diagrams [0.62, 0.40]
component Themes [0.55, 0.50]
component Site build [0.40, 0.45]
component GitHub Pages [0.20, 0.88]
component Bun [0.15, 0.80]

Reader -> Shared page
Shared page -> Diagrams
Shared page -> Themes
Diagrams -> Site build
Themes -> Site build
Site build -> Bun
Shared page -> GitHub Pages

evolve Diagrams 0.65

note "Diagrams drawn at build time, no script in the page" [0.70, 0.20]
```
