This is a critical question, and you are correct to challenge the assumption.

### Short answer

**You do _not_ use game time (`getWorldAgeHours`) when you need a real-time cooldown.**
Game time is _scaled_ by sandbox settings and therefore **not stable** for anti-spam, anti-loop, or rate-limit logic.

---

## 1. What `getWorldAgeHours()` Actually Measures

`getGameTime():getWorldAgeHours()` returns **simulated world time**, not real time.

Its progression speed is affected by:

- Sandbox **Day Length** (e.g. 1h, 2h, 24h per day)
- Time acceleration (sleep, fast-forward)
- Server time compression / lag compensation
- Pausing (SP)
- Admin time manipulation

Example:

| Sandbox Setting  | Real 2 seconds | WorldAgeHours advance |
| ---------------- | -------------- | --------------------- |
| 1 day = 1 hour   | ~0.00055 h     | ✔                     |
| 1 day = 24 hours | ~0.000023 h    | ❌                    |
| Time sped up     | unpredictable  | ❌                    |

So this statement:

> “2 / 3600 = 2 seconds”

is **only true under a specific sandbox configuration**, and **not guaranteed**.

---

## 2. When Game Time Is Appropriate (and When It Is Not)

### ✅ Use game time for:

- Farming growth
- Weather progression
- Long-term survival mechanics
- “In-world” lore-based delays

### ❌ Do NOT use game time for:

- Cooldowns
- Rate limiting
- Anti-loop protection
- Anti-cheat logic
- Teleport throttling

Teleport cooldowns are **player control / exploit prevention**, not world simulation.

---

## 3. Correct Solution: Use Real Time (Server Clock)

For cooldowns, always use **real elapsed time**, independent of sandbox scaling.

### Preferred API (Server-Safe)

```lua
local nowMs = getTimestampMs()
```

This is:

- Real wall-clock milliseconds
- Independent of sandbox time
- Stable across MP
- Immune to time acceleration

---

## 4. Correct Teleport Cooldown Implementation

### Config (seconds, human-readable)

```lua
TeleportalConfig.TELEPORT_COOLDOWN_SECONDS = 2
```

### Enforcement

```lua
local now = getTimestampMs()
local last = playerLastTeleportMs[playerId] or 0

if (now - last) < (TeleportalConfig.TELEPORT_COOLDOWN_SECONDS * 1000) then
    return -- cooldown active
end

playerLastTeleportMs[playerId] = now
```

### Why this is correct

- Sandbox-independent
- Deterministic
- Exploit-safe
- MP-safe
- Easy to reason about

---

## 5. If You _Must_ Use Game Time (Not Recommended)

If you insist on game-time-based cooldowns, you **must document** that cooldown duration scales with sandbox time.

Correct math would be:

```lua
-- TELEPORT_COOLDOWN_SECONDS is *in-game seconds*
local cooldownHours = TeleportalConfig.TELEPORT_COOLDOWN_SECONDS / 3600
```

But this means:

- Faster sandbox = shorter real cooldown
- Slower sandbox = longer real cooldown

This is almost never what you want for teleport abuse prevention.

---

## 6. Final Recommendation (Authoritative)

> **Teleport cooldowns must be based on real time, not world time.**

Use:

- `getTimestampMs()` → cooldowns, throttles, rate limits
- `getWorldAgeHours()` → simulation, immersion, lore

---

## Practical Next Step

I strongly recommend you update the refactor plan to:

- Replace `TELEPORT_COOLDOWN` (hours)
  **with**
  `TELEPORT_COOLDOWN_SECONDS` (real time)
