Understood. The document you uploaded is now **factually incorrect for Build 42.13.x**, given what we have proven empirically:

- `Events.OnCreateSandboxOptions` **does not exist**
- Lua-only sandbox UI injection **is not supported**
- `sandbox-options.txt` **is required** to show options in the vanilla Sandbox UI

Below is a **corrected, authoritative update** you can apply to the document. This replaces the incorrect sections while preserving the useful conceptual structure.

---

# **UPDATED DOCUMENT — SandboxVars in Build 42.13.x**

> **Scope:** Project Zomboid **Build 42.13.x**
> **Audience:** Mod authors implementing sandbox-backed gameplay rules

---

## Executive Verdict (Corrected)

**In Build 42.13.x, mods MUST use `media/sandbox-options.txt` to expose sandbox options in the vanilla Sandbox UI.**

There is **no supported Lua event** (such as `OnCreateSandboxOptions`) available to mods in this build.
Lua-only UI registration is **not supported** and will fail or crash.

---

## Correct Sandbox Variable Definition Pattern (B42.13.x)

Mods must use a **3-layer model**:

---

## Layer 1 — Sandbox UI Definition (**Required for UI**)

### `media/sandbox-options.txt`

This file is the **only reliable way** to display options in:

- New Game → Sandbox
- MP server preset editor

### Example

```txt
option Teleportal.TeleportCooldownSeconds
{
    page = Teleportal,
    translation = Teleportal_Cooldown,
    tooltip = Teleportal_Cooldown_Tooltip,
    type = double,
    min = 0.5,
    max = 60,
    default = 2,
}
```

Key properties:

- `page` → creates the sandbox tab
- `option ModID.VarName` → maps to `SandboxVars.ModID.VarName`
- Parsed automatically by the engine
- Server-authoritative in MP

---

## Layer 2 — Lua Fallback Initialization (**Required**)

Sandbox UI does **not** guarantee presence for:

- Old saves
- Headless servers
- Worlds created before the option existed

### Required Lua Pattern

```lua
Events.OnGameBoot.Add(function()
    SandboxVars.Teleportal = SandboxVars.Teleportal or {}

    SandboxVars.Teleportal.TeleportCooldownSeconds =
        SandboxVars.Teleportal.TeleportCooldownSeconds or 2
end)
```

Purpose:

- Backward compatibility
- Safe defaults
- MP-safe

This does **not** affect UI — only persistence.

---

## Layer 3 — Validation & Trust Boundary (**Required**)

Sandbox values are **user-controlled input**, not invariants.

They **must** be validated before gameplay use.

### Example

```lua
local cooldown =
    TeleportalConfig.getTeleportCooldownSeconds() -- clamps ≥ 0.5
```

Validation protects against:

- Zero / negative cooldown exploits
- WalkTo re-entry loops
- MP desync
- Bad presets / corrupted saves

---

## What Is NOT Supported in Build 42.13.x

### ❌ Lua-based Sandbox UI Registration

The following are **not available** and must not be used:

- `Events.OnCreateSandboxOptions`
- `Events.OnSandboxOptionsInit`
- `SandboxOptionsScreen.registerOption(...)`

These APIs **do not exist** in this build and will cause errors such as:

```
attempted index: Add of non-table: null
```

---

### ❌ “Force registration by touching SandboxVars”

```lua
local _ = SandboxVars.ModID.VariableName
```

This is a **Build 41 workaround** and has **no effect** in 42.13.x.

UI parsing is **decoupled** from Lua variable access.

---

## Optional / Advanced Methods

### PZAPI.ModOptions

- Client-side only
- UI convenience
- Not persisted
- Not authoritative

**Do not use for gameplay rules.**

---

### Dynamic SandboxVars (Framework Mods)

Valid only when:

- Variable names are not known at design time
- No UI exposure is required
- Persistence is managed manually

---

## Corrected Comparison Table (B42.13.x)

| Method                  | Shows in UI | Persisted | Server-authoritative | Status         |
| ----------------------- | ----------- | --------- | -------------------- | -------------- |
| `sandbox-options.txt`   | ✔           | ✔         | ✔                    | ✅ Required    |
| Lua defaults (fallback) | ❌          | ✔         | ✔                    | ✅ Required    |
| Lua UI registration     | ❌          | ❌        | ❌                   | ❌ Unsupported |
| PZAPI.ModOptions        | ✔           | ❌        | ❌                   | ⚠ UI-only      |
| Dynamic framework       | ❌          | ✔         | ✔                    | ⚠ Advanced     |

---

## Final Mental Model (Corrected)

> **In Build 42.13.x:**
>
> • **Sandbox UI** → `sandbox-options.txt`
> • **Persistence** → `SandboxVars`
> • **Authority & Safety** → validation layer in Lua

There is **no supported Lua hook** for sandbox UI creation in this build.

---

## Updated Recommendation for Teleportal

- ✅ **Add** `media/sandbox-options.txt`
- ✅ Keep `Teleportal_Sandbox.lua`
- ✅ Keep `Teleportal_Config.lua` (validation)
- ❌ Remove all Lua-based sandbox UI attempts
- ✅ Log resolved values at server init

This architecture is **correct, stable, and future-proof** for Build 42.13.x.
