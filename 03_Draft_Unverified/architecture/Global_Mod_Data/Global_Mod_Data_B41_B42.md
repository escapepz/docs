Below is a **clean, authoritative explanation of “Mod Data” in Project Zomboid**, consolidating and validating the concepts you outlined, with corrections and clarifications aligned with **Build 41 and Build 42 (2026)** behavior.

---

## Mod Data in Project Zomboid — Complete Explanation

In **Project Zomboid**, the term **“mod data”** has **two distinct meanings** that are often conflated:

1. **Persistent Lua data managed by the ModData system (runtime / save data)**
2. **The physical mod file structure (assets, scripts, definitions)**

They serve very different purposes and have different lifecycle, persistence, and networking rules.

---

## 1. Persistent Mod Data (Lua / Save-System Level)

### What ModData Is

`ModData` is a **Lua-accessible persistence layer** provided by the engine.
It allows mods to store **plain Lua tables** that survive:

- Save / Load
- Server restarts
- World reloads

This data is serialized by the engine and written to the **world save**, not to the mod folder.

---

### Types of Mod Data

#### A. Object-Attached Mod Data

Attached directly to game objects.

Examples:

- `player:getModData()` → per-character persistence
- `item:getModData()` → per-item persistence
- `square:getModData()` → per-world-tile persistence

Characteristics:

- Saved automatically with the owning object
- Automatically synchronized when that object syncs
- Ideal for **stateful gameplay extensions** (skills, flags, cooldowns)

---

#### B. Global Mod Data (World-Wide)

Managed via the `ModData` class (`zombie.world.moddata.ModData`).

Typical use cases:

- Global events
- World progression systems
- Economy / faction state
- Server-wide configuration snapshots

This data is **not attached to any object** and must be handled explicitly.

---

### Global ModData API (Build 41 / 42)

| Function                   | Purpose                            |
| -------------------------- | ---------------------------------- |
| `ModData.getOrCreate(tag)` | Get or create a persistent table   |
| `ModData.get(tag)`         | Get table or `nil`                 |
| `ModData.exists(tag)`      | Check existence                    |
| `ModData.add(tag, table)`  | **Register table for persistence** |
| `ModData.remove(tag)`      | Permanently delete                 |
| `ModData.getTableNames()`  | List all tags                      |
| `ModData.transmit(tag)`    | Send table over network            |
| `ModData.request(tag)`     | Ask remote side to send            |
| `OnReceiveGlobalModData`   | Receive transmitted data           |

---

### Critical Rule (Often Misunderstood)

> **`ModData.transmit()` does NOT save data.**

Persistence only occurs when:

- The table exists in the server’s ModData registry
- It has been registered via `ModData.add(tag, table)`
- The world is saved normally

**Transmit = network only**
**Add = disk persistence**

---

## 2. Mod File Structure (“Mod Data” as Files)

This is **not runtime data**, but the **static content** that defines a mod.

### Locations

- Local mods
  `C:\Users\<User>\Zomboid\mods\`

- Steam Workshop
  `Steam\steamapps\workshop\content\108600\`

---

### Core Files and Folders

| Path                   | Purpose                              |
| ---------------------- | ------------------------------------ |
| `mod.info`             | Mod ID, name, version, dependencies  |
| `media/lua/client/`    | Client-only logic (UI, input)        |
| `media/lua/server/`    | Server-only logic (authority)        |
| `media/lua/shared/`    | Shared logic (MP-safe)               |
| `media/scripts/`       | Items, recipes, vehicles             |
| `media/registries.lua` | **Build 42 identifier registration** |
| `media/textures/`      | Icons, UI assets                     |
| `media/models/`        | 3D assets                            |

These files are **never written to at runtime**.

---

## 3. Multiplayer Synchronization Model (Important)

### What the Engine Does NOT Do

- ❌ Does not auto-sync Global ModData
- ❌ Does not auto-save transmitted data
- ❌ Does not auto-authorize requests

Everything is **explicit and opt-in**.

---

### Correct MP Sync Flow (Global ModData)

#### Client (Join / Init)

```lua
ModData.request("MyModTag")
```

#### Server (Validation + Response)

```lua
Events.OnReceiveGlobalModData.Add(function(tag, data)
    if tag == "MyModTag" then
        ModData.transmit(tag)
    end
end)
```

#### Client (Reception)

```lua
Events.OnReceiveGlobalModData.Add(function(tag, data)
    if tag == "MyModTag" and data then
        ModData.add(tag, data)
    end
end)
```

---

### Security Reality (2026)

- `ModData.request()` **has no built-in permission checks**
- `OnReceiveGlobalModData` **does not provide sender identity**
- Therefore:
  - **Do not expose sensitive data via ModData**
  - **Do not trust incoming tables**
  - **Never blindly call `ModData.add()`**

---

## 4. Guarding ModData (Best Practice)

### Why ModData Is Weak for Security

- Whole-table transmission
- No per-field validation
- No reliable sender context
- Broadcast-based

---

### Recommended Alternative: `sendClientCommand`

For any of the following:

- Admin-only actions
- Economy changes
- World mutations
- Cheating-sensitive logic

Use:

- `sendClientCommand` (client → server)
- `Events.OnClientCommand` (server authority)
- `player:getAccessLevel()` for permission checks

This provides:

- Sender identity
- Fine-grained control
- Lower bandwidth
- Better auditability

---

## 5. Key Takeaways (Authoritative Summary)

- **ModData ≠ mod files**
- `ModData.add()` controls persistence
- `ModData.transmit()` is network-only
- Global ModData is **manual sync**
- Clients must handle `OnReceiveGlobalModData`
- Server never auto-sends data
- ModData is **not secure by default**
- Use `sendClientCommand` for sensitive systems

---
