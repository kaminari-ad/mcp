---
name: Feature request
about: Suggest a new tool, transport feature, or DX improvement
labels: enhancement
---

## What you would like

<!-- Concrete description. If you are proposing a new tool, name the `/api/v1` endpoint it wraps. -->

## Why

<!-- The agent workflow this enables. Example: "Currently I can list scans but not bulk-cancel them; this forces me to call cancel once per scan-id." -->

## Sketch

<!-- Optional: rough tool schema / API shape. -->

```ts
// Example tool input:
const Input = z.object({
  scan_ids: z.array(z.string().uuid()).max(100),
});
```

## Out of scope

<!-- What this feature explicitly does NOT include. -->
