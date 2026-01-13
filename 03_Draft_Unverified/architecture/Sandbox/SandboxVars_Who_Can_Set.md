Sandbox variables are **not set by your code at runtime by default**. They are set through **controlled entry points defined by the engine**, with different authority depending on game mode.

Below is the precise authority model.

---

## Who Can Set SandboxVars

### 1. **Single Player (SP)**

**Who:**

- The **player** (world owner)

**How:**

- New World → Sandbox Settings
- Existing World → _Sandbox Options_ (before loading)
- Saved in the world’s `map_sand.bin`

**Authority:**

- Absolute
- Whatever the player sets is authoritative

---

### 2. **Multiplayer (MP) – Dedicated or Hosted Server**

**Who:**

- **Server owner / host only**

**How:**

- `servertest_SandboxVars.lua`
- Server preset files
- Server UI (if exposed)

**Authority:**

- **Server authoritative**
- Clients **cannot override**
- Clients receive values passively on join

This is the most important case for mods.

---

### 3. **Clients in Multiplayer**

**Who:**

- **No one**

**What clients can do:**

- Read `SandboxVars`
- Cache values
- React to values

**What clients cannot do:**

- Persist changes
- Override server values
- Transmit sandbox changes

Any client-side modification is:

- Local only
- Non-persistent
- Ignored by the server

---

### 4. **Mods (Including Yours)**

**What mods can do safely:**

- Register defaults:

  ```lua
  SandboxVars.Teleportal = SandboxVars.Teleportal or {}
  SandboxVars.Teleportal.TeleportCooldownSeconds =
      SandboxVars.Teleportal.TeleportCooldownSeconds or 2
  ```

- Read values
- Clamp / validate values at runtime

**What mods must NOT do:**

- Change sandbox values dynamically during play
- Assume values are valid
- Persist changes mid-session

Mods are **consumers**, not owners, of sandbox configuration.

---

## Why This Matters for Your Teleportal Mod

Because:

- SandboxVars are **authoritative input**
- Set outside your code
- Possibly misconfigured
- Possibly stale (older saves)
- Possibly overridden by server presets

Your mod must treat them as **untrusted configuration**, even though they are “official”.

That is why:

- Validation is required
- Defaults must be enforced
- Lower bounds (e.g., cooldown ≥ 0.5s) are necessary

---

## Authority Summary Table

| Context       | Who sets SandboxVars   | Who enforces behavior |
| ------------- | ---------------------- | --------------------- |
| Single Player | Player                 | Your code             |
| MP Server     | Server owner           | Your code             |
| MP Client     | No one                 | Server                |
| Mods          | Register defaults only | Your code             |

---

## Final Answer (Direct)

**Sandbox variables can only be set by the world owner (SP) or the server owner (MP).
Clients and mods cannot authoritatively set them—only read and validate them.**

That is why validation belongs in your code, not in the sandbox UI.
