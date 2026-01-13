Below is a **Build 42–correct reference diagram** describing **Global ModData lifecycle, persistence, and networking** in Project Zomboid.
This reflects **actual engine behavior in B42**, not legacy assumptions.

---

## Build 42 — Global ModData Reference Diagram (Authoritative)

![Image](https://projectzomboid.com/blog/content/uploads/2022/08/stoneworking.png)

![Image](https://images.steamusercontent.com/ugc/23181678748681815/59493437A097E8F27001A817C1EA915CADFCFFF0/?ima=fit&imcolor=%23000000&imh=268&impolicy=Letterbox&imw=268&letterbox=true)

![Image](https://images.surferseo.art/8ae36b5a-fca3-40ce-9b4a-880e627c7d28.png)

![Image](https://cybrancee.com/learn/wp-content/uploads/2025/09/Sandbox-options-outlined-in-the-admin-panel-edited.png)

---

### 1. World Persistence Layer (Server Authority)

```
┌─────────────────────────────┐
│        WORLD SAVE           │
│  map_modData.bin (disk)     │
└─────────────▲───────────────┘
              │ auto-save
┌─────────────┴───────────────┐
│   Server ModData Registry   │
│  (in-memory Lua tables)     │
└─────────────▲───────────────┘
              │
      ModData.add(tag, table)
```

**Key facts (Build 42):**

- Only data registered via `ModData.add()` is persisted
- Saving occurs during normal world save cycles
- `ModData.transmit()` is **never involved in saving**

---

### 2. Server Runtime Layer

```
Server Logic
│
├─ ModData.getOrCreate(tag)
│
├─ mutate table (authoritative)
│
├─ ModData.add(tag, table)     ← REQUIRED for persistence
│
└─ ModData.transmit(tag)       ← OPTIONAL (network only)
```

**Important constraints:**

- Server does **not** auto-transmit on change
- Server does **not** auto-transmit on player join
- Transmission is explicit and manual

---

### 3. Network Transport Layer (No Persistence)

```
┌───────────────┐      transmit/request      ┌───────────────┐
│   SERVER      │  ───────────────────────▶  │    CLIENT     │
│ ModData table │                            │ receives blob │
└───────────────┘      (full serialization)  └───────────────┘
```

- Entire table is serialized every time
- No diffing
- No sender identity in ModData events
- No permission enforcement by engine

---

### 4. Client Runtime Layer

```
┌─────────────────────────────┐
│ OnReceiveGlobalModData      │
│ (event callback)            │
└─────────────▲───────────────┘
              │
        (manual decision)
              │
     ModData.add(tag, data)
              │
┌─────────────┴───────────────┐
│ Client Local ModData        │
│ (optional persistence)     │
└─────────────────────────────┘
```

**Client-side truths:**

- Incoming data is **NOT auto-registered**
- If you do nothing → data is discarded
- `ModData.add()` on client only affects that client’s local save
- Client persistence is irrelevant in multiplayer authority terms

---

### 5. Join / Initial Sync Sequence (Canonical)

```
CLIENT JOIN
   │
   ├─ OnInitGlobalModData
   │     └─ ModData.request(tag)
   │
SERVER
   │
   ├─ OnReceiveGlobalModData (request)
   │     └─ permission check (manual!)
   │
   └─ ModData.transmit(tag)
         │
CLIENT
   │
   └─ OnReceiveGlobalModData
         └─ ModData.add(tag, data)
```

**Nothing in this chain is automatic except event firing.**

---

### 6. What ModData Is _Not_ (Build 42)

| Assumption             | Reality |
| ---------------------- | ------- |
| Auto-synced on join    | ❌ No   |
| Auto-saved on transmit | ❌ No   |
| Secure by default      | ❌ No   |
| Sender-aware           | ❌ No   |
| Partial updates        | ❌ No   |

---

### 7. Recommended Architecture Overlay (Best Practice)

```
GLOBAL STATE (persistent, slow-changing)
└─ ModData.add + occasional transmit

RUNTIME / FREQUENT / SENSITIVE
└─ sendClientCommand
   └─ OnClientCommand
       └─ validate player:getAccessLevel()
       └─ mutate server state
       └─ targeted sync back
```

This hybrid model is what most **Build 42–stable mods** use in 2026.

---

### 8. One-Sentence Mental Model (Correct)

> **ModData.add() anchors data to disk, ModData.transmit() throws a snapshot over the network, and nothing happens unless your mod explicitly wires every step.**

---
