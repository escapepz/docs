Short answer: **the event handler itself does not cause the spike; broadcasts do**.
However, with a naïve ModData design, **every join/rejoin can indeed spike all connected players** on a 32-slot server.

Below is the precise Build 42 explanation.

---

## What Actually Causes the Spike (Build 42)

### 1. `Events.OnReceiveGlobalModData` Is Passive

Registering this on the client:

```lua
Events.OnReceiveGlobalModData.Add(handler)
```

does **nothing by itself**.

- It allocates no packets
- It runs only when data is delivered
- It is per-client, not global

**So:**

> ❌ The existence of the event handler is not the problem.

---

## 2. The Real Spike Source: `ModData.transmit(tag)`

### Default behavior (critical)

```lua
ModData.transmit(tag)
```

On a multiplayer server:

- Serializes the **entire table**
- Sends it to **all connected clients**
- Uses RakNet broadcast
- Triggers `OnReceiveGlobalModData` on **every client**

---

## 3. Join / Rejoin Scenario (32 Players)

### Naïve pattern (very common, very bad)

```lua
-- server
Events.OnReceiveGlobalModData.Add(function(tag)
    ModData.transmit(tag)
end)
```

### What happens when ONE player joins

1. Player 32 joins
2. Client calls `ModData.request(tag)`
3. Server receives request
4. Server calls `ModData.transmit(tag)`
5. **All 32 clients receive full table**
6. **All 32 clients run `OnReceiveGlobalModData`**
7. **All 32 deserialize the table**

✅ Yes — **every join/rejoin causes a spike for everyone**.

This scales linearly with:

- Player count
- Table size
- Join frequency

---

## 4. Why This Is Especially Bad in Build 42

- No delta encoding
- No compression tuning
- No sender targeting
- No sender identity
- Lua deserialization on main thread

So spikes manifest as:

- Micro-freezes
- Animation hitching
- UI stalls
- “Lag spike on join” complaints

---

## 5. What Does _Not_ Spike Everyone

### Using `sendClientCommand` / `sendServerCommand`

```lua
sendServerCommand(player, "MyMod", "StateSnapshot", payload)
```

- One recipient
- Partial payload
- Known sender
- No broadcast
- No `OnReceiveGlobalModData`

Result:

> ✅ Zero impact on other 31 players

---

## 6. Correct Mental Model

| Mechanism                  | Scope            | Cost     |
| -------------------------- | ---------------- | -------- |
| Event handler registration | Local            | None     |
| `ModData.request`          | Client → Server  | Minimal  |
| `ModData.transmit`         | Server → **ALL** | **High** |
| `sendServerCommand`        | Server → One     | Low      |

---

## 7. Build 42 Best Practice (Authoritative)

> **Never answer `ModData.request()` with `ModData.transmit()` on a populated MP server.**

Instead:

- Use `sendClientCommand` to request
- Use `sendServerCommand` to respond
- Use `ModData` only for persistence

---

## 8. When `ModData.transmit()` Is Still Acceptable

All must be true:

- ≤ once per session
- Table is small (< a few KB)
- All players need it
- Join storms are unlikely

Examples:

- Static world metadata
- Seed info
- Rare global events

---

## 9. Direct Answer to Your Question

> **“Every player join/rejoin causing spike for all joined?”**

✔ **Yes — if your server responds with `ModData.transmit()`**
✘ **No — if you use targeted commands**

The spike is **architectural**, not accidental.

---
