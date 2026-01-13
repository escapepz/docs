> [!WARNING]
> **Draft / Unverified Content**
> This document is based on experimental content, architectural assumptions, or reverse engineering notes. Information may not be formally confirmed by developers.

Your statement is **correct for Build 42+**, and it usefully resolves a point of confusion that still catches many modders: **`LoadChunk` is now the most reliable and lowest-level chunk lifecycle event**, especially when `OnGridStackLoaded` behaves inconsistently across sub-versions or MP contexts.

Below is a **clean consolidation and clarification**, with practical guidance on _when and why_ to use `LoadChunk` versus the other events.

---

## 1. `Events.LoadChunk` — The New Primary Chunk Signal (Build 42+)

### What it represents

`LoadChunk` fires **every time a single 10×10 IsoChunk is instantiated in memory**.

- Parameter: `IsoChunk`
- Fires:
  - On client (as the player streams the world)
  - On server (during world management / streaming)

- Deterministic and reliable in Build 42+

This makes it the **closest replacement for the old “chunk load” mental model**.

### Correct usage (your example is correct)

```lua
local function myOnLoadChunk(chunk)
    local wx = chunk:getX() -- chunk coordinate
    local wy = chunk:getY()

    local tileX = wx * 10
    local tileY = wy * 10

    print("Chunk loaded at tile: " .. tileX .. ", " .. tileY)
end

Events.LoadChunk.Add(myOnLoadChunk)
```

Important clarification you already noted:

- `chunk:getX()` / `getY()` are **chunk-space**, not tile-space
- Multiply by `10` to convert to grid-square coordinates

---

## 2. How `LoadChunk` Compares to Other Events (Build 42)

### Event comparison table (corrected and contextualized)

| Event                 | Parameter       | Fires How Often        | Best Use Case                                  | Risk              |
| --------------------- | --------------- | ---------------------- | ---------------------------------------------- | ----------------- |
| **LoadChunk**         | `IsoChunk`      | Once per 10×10 chunk   | World logic, markers, spawning, gating retries | Low               |
| LoadGridsquare        | `IsoGridSquare` | Once per tile          | Very specific tile logic only                  | **Very High**     |
| OnGridStackLoaded     | `GridStack`     | Once per stack (all Z) | Multi-floor logic                              | Version-dependent |
| OnPostFloorSquareDraw | None            | Every frame            | Visual/UI detection                            | Performance       |

**Key conclusion**
In Build 42+, if you need a **reliable, version-stable signal that world data exists**, `LoadChunk` is the safest choice.

---

## 3. Why `OnGridStackLoaded` May “Not Work” Reliably

This is not user error.

In Build 42+:

- Chunk streaming is **more granular**
- Grid stacks may be created:
  - Lazily
  - Out of order
  - After individual chunks

- In MP, some stacks are never fully materialized client-side

Result:

- `OnGridStackLoaded` may fire:
  - Later than expected
  - Not at all for edge Z-levels
  - Only server-side in some cases

That is why **`LoadChunk` is now preferred** for most mod logic.

---

## 4. Multiplayer Semantics (Critical)

Your MP notes are correct; the distinction matters.

### Server-side `LoadChunk`

Use for:

- Spawning synced objects
- Environmental mutation
- Zombie or item placement
- Anything that must persist and replicate

**Must include guards** to avoid duplication:

```lua
if isServer() then
    -- check modData / flags before spawning
end
```

### Client-side `LoadChunk`

Use for:

- Visual markers
- UI overlays
- Retry resolution (e.g. Teleportal markers)
- Local caching

Never mutate authoritative world state from client `LoadChunk`.

---

## 5. Relationship to `retryFailedMarkers()` (Teleportal Context)

For your Teleportal system, the correct hierarchy in **Build 42+** is now:

1. **Primary trigger:** `Events.LoadChunk`
2. **Secondary fallback:** bounded retry (`retryFailedMarkers`)
3. **Never:** render-tick polling alone

Example integration:

```lua
Events.LoadChunk.Add(function(chunk)
    retryFailedMarkers()
end)
```

This ensures:

- Immediate marker creation when the chunk arrives
- No unnecessary per-frame polling
- Compatibility with async streaming and MP

---

## 6. Final Assessment

Your conclusion is **accurate and current**:

- Build 42+ does **not** rely on a single “chunk load” concept
- `LoadChunk` is now the **primary, dependable event**
- `OnGridStackLoaded` is optional and situational
- `LoadGridsquare` should be avoided except for edge cases
- MP behavior requires strict client/server separation
