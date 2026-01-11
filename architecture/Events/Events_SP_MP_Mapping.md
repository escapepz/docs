Below is the **Single Player (SP) vs Multiplayer (MP) execution map for Build 42**, written as a **mental model + practical mapping table**.
This is the reference you use to decide **where code lives and which Events fire**.

---

# Project Zomboid B42 — SP / MP Execution Map

---

## 1. The One Rule That Explains Everything

> **Single Player is NOT “server-only”.**
> **Single Player = Client + Server in the same Lua VM.**

Multiplayer simply **splits those roles into different VMs**.

---

## 2. High-Level Architecture

### Single Player (SP)

```
┌────────────────────────────┐
│        ONE LUA VM          │
│                            │
│  Client context (UI)       │
│  ─ OnRenderTick            │
│  ─ OnFillContextMenu       │
│  ─ ISBuildingObject        │
│                            │
│  Server context (authority)│
│  ─ OnClientCommand         │
│  ─ World mutation          │
│                            │
└────────────────────────────┘
```

### Multiplayer (MP)

```
CLIENT LUA VM                SERVER LUA VM
┌──────────────────┐         ┌──────────────────┐
│ UI / Input       │         │ Authority        │
│ OnRenderTick     │         │ OnClientCommand  │
│ OnGameStart      │         │ OnServerStarted  │
│ ISBuildingObject │         │ World mutation   │
└──────────────────┘         └──────────────────┘
```

**Key takeaway:**
SP runs both sides together, but **events still behave as if split**.

---

## 3. Event Firing Map (Critical)

| Event                          | SP Fires? | MP Client | MP Server |
| ------------------------------ | --------- | --------- | --------- |
| `OnGameBoot`                   | ✅         | ✅         | ✅         |
| `OnGameStart`                  | ✅         | ✅         | ❌         |
| `OnServerStarted`              | ❌         | ❌         | ✅         |
| `OnRenderTick`                 | ✅         | ✅         | ❌         |
| `OnClientCommand`              | ✅         | ❌         | ✅         |
| `OnServerCommand`              | ✅         | ✅         | ❌         |
| `OnFillWorldObjectContextMenu` | ✅         | ✅         | ❌         |
| `OnTick`                       | ✅         | ❌         | ✅         |

---

## 4. File Placement Rules (Non-Negotiable)

| Folder             | Loaded In | SP | MP          |
| ------------------ | --------- | -- | ----------- |
| `media/lua/client` | Client VM | ✅  | Client only |
| `media/lua/server` | Server VM | ✅  | Server only |
| `media/lua/shared` | Both      | ✅  | Both        |

🚫 **Client files must never be required by server/shared files**

---

## 5. Command Flow Map

### Single Player

```
sendClientCommand()
        ↓
OnClientCommand (same VM)
        ↓
World mutation
        ↓
sendServerCommand()
        ↓
OnServerCommand (same VM)
```

### Multiplayer

```
CLIENT VM                        SERVER VM
sendClientCommand()   ─────────▶ OnClientCommand
                                      ↓
                                 World mutation
                                      ↓
sendServerCommand()   ◀───────── OnServerCommand
```

**Rule:**
Code must work **even if client and server are different machines**.

---

## 6. Initialization Map (Correct Pattern)

### Client (SP + MP client)

```lua
OnGameBoot   → register handlers
OnGameStart  → init UI, request server data
```

### Server (SP + MP server)

```lua
Immediate    → register OnClientCommand
OnServerStarted (MP) / OnGameStart (SP) → init world data
```

---

## 7. What Breaks When You Get This Wrong

| Symptom                    | Cause                                              |
| -------------------------- | -------------------------------------------------- |
| Works in SP, crashes in MP | Client code loaded on server                       |
| `derive of non-table`      | UI class required in server/shared                 |
| Nothing happens in MP      | Logic stuck in `OnGameStart` server-side           |
| Double execution in SP     | No guard + dual context                            |
| Massive lag                | Using `OnPlayerUpdate` or `OnRenderTick` for logic |

---

## 8. Practical Decision Table

**Ask this question every time you write code:**

### “Does this need UI, mouse, rendering, or cursors?”

→ **Client only**

### “Does this change the world, items, portals, zombies?”

→ **Server only**

### “Is this just math, config, validation?”

→ **Shared**

---

## 9. Teleportal-Specific Mapping (Your Case)

| Feature                         | Correct Context |
| ------------------------------- | --------------- |
| Cursor preview (drag highlight) | Client          |
| Context menu                    | Client          |
| Portal creation                 | Server          |
| Portal storage                  | Server          |
| Portal snapshot                 | Server → Client |
| Admin UI                        | Client          |
| Trigger detection               | Client          |
| Teleport execution              | Server          |

This is why your architecture is now stabilizing.

---

## 10. One-Sentence Mental Model

> **SP behaves like MP running on localhost.
> If it would break over the network, it is already wrong.**

---
