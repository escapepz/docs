Below is the **authoritative rule set for `Events` usage in Project Zomboid Build 42**, distilled to what actually matters in practice and mapped to the problems you just encountered.

This is not generic advice; this is the **engine contract**.

---

# Project Zomboid B42 — Rules for `Events`

---

## 1. Event Scope Is Absolute

Each event exists in **exactly one execution context**.

### Contexts

- **Client** (UI, rendering, input)
- **Server** (authoritative game logic)
- **Shared** (code _loaded_ in both, but logic must branch)

❗ Violating scope is the #1 cause of `nil`, `derive of non-table`, and silent failures.

---

## 2. Canonical Event Matrix (Build 42)

### 🟦 Client-Only Events

| Event                          | Purpose                  | Rules                        |
| ------------------------------ | ------------------------ | ---------------------------- |
| `OnGameBoot`                   | Wire handlers, no world  | No player, no world          |
| `OnGameStart`                  | World + player ready     | Safe for `sendClientCommand` |
| `OnFillWorldObjectContextMenu` | Context menus            | UI only                      |
| `OnRenderTick`                 | Per-frame rendering      | Avoid for cursors            |
| `OnKeyPressed`                 | Input                    | Client only                  |
| `OnMouseDown`                  | Input                    | Client only                  |
| `OnServerCommand`              | Server → client messages | Client only                  |

🚫 **Never referenced by server files**

---

### 🟥 Server-Only Events

| Event                | Purpose             | Rules              |
| -------------------- | ------------------- | ------------------ |
| `OnClientCommand`    | Client → server RPC | Authoritative only |
| `OnServerStarted`    | World loaded (MP)   | Safe for init      |
| `OnTick`             | Server tick         | Throttle logic     |
| `OnPlayerConnect`    | Player joins        | No UI              |
| `OnPlayerDisconnect` | Player leaves       | Cleanup            |
| `OnCreatePlayer`     | Player spawned      | Initial state      |

🚫 **Never referenced by client/UI files**

---

### 🟪 Shared-Safe Events (with branching)

| Event         | Allowed | Restrictions             |
| ------------- | ------- | ------------------------ |
| `OnGameBoot`  | Yes     | No world access          |
| `OnGameStart` | Yes     | Must branch `isServer()` |
| `OnTick`      | Yes     | Heavy logic server-only  |

---

## 3. Golden Rules (Non-Negotiable)

### Rule 1 — Registration Is Context-Local

```lua
-- ❌ WRONG
sharedFile.lua:
Events.OnRenderTick.Add(...)
```

```lua
-- ✅ CORRECT
clientFile.lua:
Events.OnRenderTick.Add(...)
```

---

### Rule 2 — Boot ≠ World

| Event             | Can access world? |
| ----------------- | ----------------- |
| `OnGameBoot`      | ❌ No             |
| `OnGameStart`     | ✅ Yes            |
| `OnServerStarted` | ✅ Yes            |

Never:

- Call `getPlayer()`
- Call `getCell()`
- Send commands

in `OnGameBoot`.

---

### Rule 3 — One Event, One Responsibility

| Event                     | Use For                   |
| ------------------------- | ------------------------- |
| `OnRenderTick`            | HUD/debug overlays only   |
| `ISBuildingObject:render` | Cursor visuals            |
| `OnClientCommand`         | Client → server requests  |
| `OnServerCommand`         | Server → client responses |

Never mix responsibilities.

---

### Rule 4 — No Globals for Event Guards

❌ This is wrong:

```lua
_G.myFlag = true
```

✅ Correct:

```lua
local myFlag = false
```

or a dedicated state module.

---

### Rule 5 — Events Are Not Optional

Do **not** write fallback logic like:

```lua
if Events.OnGameBoot then ...
```

In Build 42:

- Events exist
- If one doesn’t, something is already broken

---

## 4. Correct Lifecycle Template (Use This)

### Client

```lua
-- client bootstrap
Events.OnGameBoot.Add(registerHandlers)
Events.OnGameStart.Add(initClient)
Events.OnServerCommand.Add(onServerCommand)
```

### Server

```lua
-- server bootstrap
Events.OnClientCommand.Add(onClientCommand)
Events.OnServerStarted.Add(initServer)
```

### Shared (only if unavoidable)

```lua
if isServer() then
    Events.OnServerStarted.Add(initServer)
else
    Events.OnGameStart.Add(initClient)
end
```

---

## 5. Common Failure Patterns (You Hit These)

| Symptom                   | Cause                         |
| ------------------------- | ----------------------------- |
| `derive of non-table`     | Client class loaded on server |
| `require(...) failed`     | Wrong context or wrong path   |
| Handler fires twice       | No registration guard         |
| Nothing happens           | Registered in wrong event     |
| Works in SP, breaks in MP | Shared misuse                 |

---

## 6. Mental Model (Remember This)

> **Files define context.
> Events enforce lifecycle.
> Violating either crashes silently.**

---

## Final Summary

- **Client events → client files only**
- **Server events → server files only**
- **Shared files → logic only, no UI, no cursors**
- **Boot wires, Start runs, Tick repeats**
- **Never draw in `OnRenderTick` if a cursor exists**
