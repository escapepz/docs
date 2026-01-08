Below is a **Build 42–accurate mapping of the ModData diagram to Single Player vs Multiplayer behavior**, with explicit call-path differences, persistence rules, and the traps that cause “works in SP, breaks in MP” bugs.

---

## Single Player vs Multiplayer — ModData Behavior Map (Build 42)

![Image](https://cybrancee.com/learn/wp-content/uploads/2025/09/Edit-Item-option-outlined-with-arrow-edited.png)

![Image](https://theindiestone.com/forums/uploads/monthly_2024_01/pz-map.jpg.f364da4d949f47ea296e6865e83f1fe6.jpg)

![Image](https://i.imgur.com/LkqamMG.png)

---

## 1. Authority Model (Root Difference)

| Aspect           | Single Player                 | Multiplayer               |
| ---------------- | ----------------------------- | ------------------------- |
| Authority        | **Unified (Client = Server)** | **Server-only authority** |
| Lua VM           | One VM                        | Two VMs (client + server) |
| ModData registry | One shared registry           | Separate registries       |
| Trust boundary   | None                          | Mandatory                 |

**Consequence:**
In SP, many incorrect patterns appear to “work” because there is no network boundary.

---

## 2. Persistence Path Mapping

### Single Player

```
Lua Code
  │
  ├─ ModData.getOrCreate(tag)
  ├─ mutate table
  ├─ ModData.add(tag, table)
  │
  └─ World Save
        └─ map_modData.bin
```

**Properties**

- Immediate visibility everywhere
- No serialization step
- No transmission
- One registry only

---

### Multiplayer

```
SERVER
  │
  ├─ ModData.getOrCreate(tag)
  ├─ mutate table
  ├─ ModData.add(tag, table)   ← persistence anchor
  │
  └─ World Save
        └─ map_modData.bin

CLIENT (separate)
  └─ No visibility unless transmitted
```

**Key difference:**
Clients **never see server ModData unless explicitly sent**.

---

## 3. Why SP “Auto-Syncs” but MP Does Not

### Single Player Reality

- `ModData.add()` updates the only registry
- Any code reading ModData sees updated values
- `ModData.transmit()` is effectively irrelevant

This creates a **false mental model**.

---

### Multiplayer Reality

| Operation            | SP Result           | MP Result         |
| -------------------- | ------------------- | ----------------- |
| `ModData.add()`      | Everyone sees it    | Server only       |
| `ModData.transmit()` | No-op               | Network broadcast |
| `ModData.request()`  | Usually unnecessary | Mandatory         |
| Read without sync    | Works               | Reads stale / nil |

---

## 4. OnReceiveGlobalModData Event Behavior

### Single Player

- Event fires **locally**
- Same Lua VM receives the data
- Often redundant

### Multiplayer

- Event fires:

  - On **server** when request arrives
  - On **client** when transmit arrives

- Data is **not auto-applied**
- Developer must decide whether to:

  - Persist it
  - Cache it
  - Ignore it

---

## 5. Initial Sync (Join / Load)

### Single Player

```
World Load
  │
  └─ ModData registry already populated
```

No handshake needed.

---

### Multiplayer

```
CLIENT JOIN
  │
  ├─ OnInitGlobalModData
  │     └─ ModData.request(tag)
  │
SERVER
  │
  └─ OnReceiveGlobalModData
         └─ ModData.transmit(tag)
```

**If you forget this, clients start “empty”.**

---

## 6. Save Timing Differences (Critical Trap)

### Single Player

- Save occurs:

  - On quit
  - On auto-save

- Same VM writes ModData

### Multiplayer

- Save occurs:

  - On server auto-save
  - On server shutdown

- Client-side ModData is **never written to server save**

**Client ModData.add() ≠ server persistence**

---

## 7. Security & Validation Differences

| Concern                | SP         | MP                 |
| ---------------------- | ---------- | ------------------ |
| Cheating               | Irrelevant | Mandatory handling |
| Trust incoming ModData | Safe       | **Never safe**     |
| Access control         | Optional   | Required           |
| Validation cost        | Low        | High               |

**Rule:**
Any logic that mutates Global ModData must run **server-side only** in MP.

---

## 8. Common Bugs Explained by the Mapping

### Bug 1 — “Works in SP, resets in MP after restart”

**Cause**

- ModData.add() called on client
- Never called on server

**Fix**

- Move ModData.add() to server code path

---

### Bug 2 — “Client sees nil ModData”

**Cause**

- Missing ModData.request()
- Missing ModData.transmit()

---

### Bug 3 — “Transmit but data not saved”

**Cause**

- ModData.transmit() used instead of ModData.add()

---

### Bug 4 — “Everyone can request admin data”

**Cause**

- ModData.request() has no access control

**Fix**

- Use sendClientCommand instead

---

## 9. Correct Mental Model (SP vs MP)

> **Single Player hides mistakes; Multiplayer exposes them.**

More precisely:

> **In SP, ModData is shared state.
> In MP, ModData is server-owned state that must be explicitly requested, transmitted, validated, and persisted.**

---

## 10. Quick Decision Table

| Goal                 | SP Approach  | MP-Correct Approach |
| -------------------- | ------------ | ------------------- |
| Persist global state | ModData.add  | Server ModData.add  |
| Update UI            | Read ModData | Request + transmit  |
| Admin-only changes   | Direct write | sendClientCommand   |
| Frequent updates     | OK           | Avoid ModData       |
| Save on exit         | Automatic    | Server only         |

---
