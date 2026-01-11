Below is the **Build 42 Event Cheat Sheet** for Project Zomboid, structured for **day-to-day mod development** and aligned with the engine rules you have been working against.

This is the version you keep open while coding.

---

# Project Zomboid — Build 42 Event Cheat Sheet

---

## 1. Execution Contexts (Memorize This)

| Context       | Meaning                       |
| ------------- | ----------------------------- |
| Client        | UI, rendering, input, cursors |
| Server        | Authoritative game logic      |
| Single Player | Client + Server in one VM     |
| Shared        | Loaded in both, must branch   |

> **Context is defined by file location**, not intention.

---

## 2. Lifecycle Timeline (Build 42)

```
Lua VM created
│
├─ OnGameBoot        (NO world, NO player)
│
├─ World loads
│
├─ OnGameStart       (World + Player ready)
│
├─ Gameplay loop
│   ├─ OnTick        (Server)
│   └─ OnRenderTick  (Client)
│
└─ Shutdown
```

---

## 3. Client-Only Events (UI / Input / Rendering)

**Files:** `media/lua/client/**`

| Event                        | When            | Use                | Do NOT       |
| ---------------------------- | --------------- | ------------------ | ------------ |
| OnGameBoot                   | Lua ready       | Register handlers  | Access world |
| OnGameStart                  | World ready     | Init client state  | Heavy logic  |
| OnFillWorldObjectContextMenu | Right-click     | Add menu options   | Server logic |
| OnServerCommand              | Server → client | Handle responses   | Mutate world |
| OnRenderTick                 | Every frame     | HUD/debug overlays | Tile cursors |
| OnKeyPressed                 | Input           | Hotkeys            | Network      |
| OnMouseDown                  | Input           | Click handling     | Authority    |

---

## 4. Server-Only Events (Authority)

**Files:** `media/lua/server/**`

| Event              | When            | Use               | Do NOT       |
| ------------------ | --------------- | ----------------- | ------------ |
| OnServerStarted    | World ready     | Init server state | UI           |
| OnClientCommand    | Client → server | Validate & act    | UI           |
| OnTick             | Server tick     | Periodic logic    | Per-frame UI |
| OnPlayerConnect    | Join            | Init per-player   | UI           |
| OnPlayerDisconnect | Leave           | Cleanup           | UI           |
| OnCreatePlayer     | Spawn           | Assign data       | UI           |

---

## 5. Shared-Safe Events (With Branching)

**Files:** `media/lua/shared/**`

| Event       | Allowed | Rule                    |
| ----------- | ------- | ----------------------- |
| OnGameBoot  | Yes     | No world access         |
| OnGameStart | Yes     | Branch `isServer()`     |
| OnTick      | Yes     | Heavy logic server only |

> **Never register UI or cursor events in shared files.**

---

## 6. Cursor & Rendering Rules (Critical)

| Task                       | Correct Mechanism         |
| -------------------------- | ------------------------- |
| Tile highlight / placement | `ISBuildingObject:render` |
| Mouse-follow ghost         | `getCell():setDrag()`     |
| Cancel cursor              | `setDrag(nil)`            |
| HUD overlays               | `OnRenderTick`            |

🚫 Never draw tiles in `OnRenderTick`.

---

## 7. Command Flow Rules

### Client → Server

```lua
sendClientCommand(player, "Module", "Command", args)
```

Handled by:

```lua
Events.OnClientCommand
```

### Server → Client

```lua
sendServerCommand(player, "Module", "Command", args)
```

Handled by:

```lua
Events.OnServerCommand
```

---

## 8. Guarding Against Duplicate Registration

### Correct (module-local)

```lua
local registered = false
if not registered then
    registered = true
    Events.OnFillWorldObjectContextMenu.Add(handler)
end
```

### Incorrect

```lua
_G.myFlag = true  -- ❌
```

---

## 9. Common Failure Symptoms → Cause

| Symptom                   | Cause                         |
| ------------------------- | ----------------------------- |
| `derive of non-table`     | Client class loaded on server |
| `require(...) failed`     | Wrong context or path         |
| Handler fires twice       | No guard                      |
| Works in SP, breaks in MP | Shared misuse                 |
| Nothing happens           | Wrong event                   |

---

## 10. Canonical Templates

### Client Bootstrap

```lua
Events.OnGameBoot.Add(registerHandlers)
Events.OnGameStart.Add(initClient)
Events.OnServerCommand.Add(onServerCommand)
```

### Server Bootstrap

```lua
Events.OnClientCommand.Add(onClientCommand)
Events.OnServerStarted.Add(initServer)
```

---

## 11. Absolute Rules (Non-Negotiable)

* Client events → **client files only**
* Server events → **server files only**
* Shared files → **logic only**
* `OnGameBoot` wires, `OnGameStart` runs
* No globals for guards
* No UI in server context
* No cursors in `OnRenderTick`

---

## One-Line Mental Model

> **File location defines context.
> Event defines timing.
> Mixing either breaks silently.**

---
