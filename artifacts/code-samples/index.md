# Code samples

Highlighted code in several languages, a diff, and a block in a language the highlighter doesn't know, to check the site's syntax colours.

## TypeScript

```ts
// Each theme maps onto the site's variables.
export function coverTones(name: string): [number, number] {
  let hash = 0x811c9dc5;

  for (const character of name) hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193);

  return [hash % 6, (hash >>> 8) % 6];
}

type Hex = `#${string}`;
const paper: Hex = "#f6f3ec";
```

## Python

```python
from dataclasses import dataclass

@dataclass
class Artifact:
    """One folder in artifacts/."""
    name: str
    title: str | None = None

    def url(self, base: str) -> str:
        return f"{base.rstrip('/')}/{self.name}/"  # trailing slash matters

print(Artifact("report").url("https://example.com/"), 42, True)
```

## Shell

```sh
#!/bin/sh
set -eu
for dir in artifacts/*/; do
  name=$(basename "$dir")
  [ "$name" = themes ] && continue
  echo "found $name"   # one per artifact
done
bun packages/artifact-share/scripts/build-site.ts "${RUNNER_TEMP:-/tmp}/site"
```

## SQL

```sql
-- Artifacts updated this month, newest first
SELECT name, title, MAX(committed_at) AS updated
FROM artifacts
WHERE committed_at >= DATE '2026-11-01' AND name <> 'themes'
GROUP BY name, title
ORDER BY updated DESC
LIMIT 10;
```

## JSON

```json
{
  "id": "harbour",
  "name": "Harbour",
  "light": { "palette": { "neutral": "#f4f1ea", "ink": "#1b2430" } },
  "dark": null,
  "count": 2,
  "public": true
}
```

## Diff

```diff
diff --git a/packages/artifact-share/scripts/style.css b/packages/artifact-share/scripts/style.css
index 1a2b3c4..5d6e7f8 100644
--- a/packages/artifact-share/scripts/style.css
+++ b/packages/artifact-share/scripts/style.css
@@ -538,7 +538,9 @@ .page article pre {
   overflow-x: auto;
   padding: 1rem 1.25rem;
-  border: 1px solid #ccc;
+  border: 1px solid var(--rule);
   border-radius: 0.5rem;
-  background: #f5f5f5;
+  background: var(--code);
+  line-height: 1.5;
 }
@@ -600,3 +602,4 @@ .source {
-- a removed line that starts with dashes
+++ an added line that starts with pluses
```

## Unknown language

```brainfuck-ish
>++++[<++++++++>-]<+. this language isn't known, so it stays plain <escaped> & intact
```

## No language

```
plain text, no language at all
```

Inline `code` stays as it was.
