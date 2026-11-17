# Diagram gallery

How a publish travels from a commit to the Pages site, drawn as Mermaid diagrams that follow the reader's theme.

## Flowchart

```mermaid
flowchart LR
  commit[Commit to main] --> workflow{Artifacts changed?}
  workflow -- yes --> build[Build the site with Bun]
  workflow -- no --> skip([Nothing to do])
  build --> upload[Upload the Pages artifact]
  upload --> deploy[(Pages deployment)]
  click deploy "https://pages.github.com" "GitHub Pages"
```

## Sequence

```mermaid
sequenceDiagram
  accTitle: Publishing an artifact
  participant A as Agent
  participant G as Git
  participant W as Workflow
  participant P as Pages
  A->>G: commit artifacts/report/
  G-->>W: push to main
  W->>W: bun build-site.ts site
  W->>P: deploy
  P-->>A: https://owner.github.io/repo/report/
  Note over W,P: about a minute
```

## State

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Preview: build locally
  Preview --> Draft: fix
  Preview --> Published: push
  Published --> Draft: edit
  Published --> [*]
```

## Pie

```mermaid
pie title Where build time goes
  "Checkout" : 12
  "Install Bun" : 8
  "Build site" : 3
  "Upload" : 9
  "Deploy" : 21
```

## Class

```mermaid
classDiagram
  class Artifact {
    +string name
    +string title
    +string? description
    +render() string
  }
  class Theme {
    +string id
    +Palette light
    +Palette dark
  }
  Artifact --> Theme : styled by
```

## A wide one

```mermaid
flowchart LR
  a[Read office.yaml] --> b[Resolve packages] --> c[Clone each repository] --> d[Copy package files] --> e[Hash every file] --> f[Write records] --> g[Link plugins] --> h[Write settings] --> i[Done]
```

## A wide sequence

```mermaid
sequenceDiagram
  participant Reader
  participant Browser
  participant Pages
  participant CDN
  participant Workflow
  participant Bun
  participant Git
  participant Agent
  Agent->>Git: commit
  Git->>Workflow: push
  Workflow->>Bun: build
  Bun-->>Workflow: site
  Workflow->>Pages: deploy
  Pages->>CDN: publish
  Reader->>Browser: open link
  Browser->>CDN: GET /report/
  CDN-->>Browser: page with diagrams
```
