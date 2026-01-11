# Sandbox Variables Guide — Build 42.13.x

## Overview

Sandbox variables are user-configurable settings persisted in saves and server presets. They are the **source of truth** for gameplay rules, accessed through the Sandbox UI during world creation or preset editing.

## Architecture (3 Layers)

### Layer 1: UI Definition (sandbox-options.txt)

**File:** `media/sandbox-options.txt`

Declares options visible in the Sandbox UI. The engine parses this file automatically.

```txt
VERSION = 1,

option Teleportal.TeleportCooldownSeconds
{
	page = Teleportal,
	translation = Teleportal_TeleportCooldownSeconds,
	tooltip = Teleportal_TeleportCooldownSeconds_tooltip,
	type = double,
	min = 0.5,
	max = 60,
	default = 2,
}
```

**Key Points:**
- `VERSION = 1,` is **required** (do not remove)
- `page` → creates sandbox tab grouping
- `translation` → base key (engine prepends `Sandbox_` automatically)
- `tooltip` → optional, but recommended
- `type` → `boolean`, `integer`, `double`, `string`, `enum`
- `default` → fallback if not set in save

---

### Layer 2: Lua Initialization (TeleportalSandboxVars.lua)

**File:** `media/lua/shared/Sandbox/TeleportalSandboxVars.lua`

Ensures SandboxVars exist in old saves and headless servers.

```lua
Events.OnGameBoot.Add(function()
	SandboxVars.Teleportal = SandboxVars.Teleportal or {}

	SandboxVars.Teleportal.TeleportCooldownSeconds =
		SandboxVars.Teleportal.TeleportCooldownSeconds or 2.0

	SandboxVars.Teleportal.MaxPortals =
		SandboxVars.Teleportal.MaxPortals or 50

	SandboxVars.Teleportal.MinDistance =
		SandboxVars.Teleportal.MinDistance or 1

	SandboxVars.Teleportal.TriggerRadius =
		SandboxVars.Teleportal.TriggerRadius or 0.6
end)
```

**Key Points:**
- Runs at **game boot** (earliest safe point)
- Provides **fallback defaults** for old saves
- **Not for UI registration** (that's `sandbox-options.txt`)
- Uses `or {}` pattern to avoid nil errors

---

### Layer 3: Validation & Trust Boundary (Teleportal_Config.lua)

**File:** `media/lua/shared/Teleportal_Config.lua`

Validates sandbox values before gameplay use. Sandboxvars are **user input**, not invariants.

```lua
local function clamp(name, value)
	local limits = LIMITS[name]
	local v = tonumber(value)

	if not v then
		return DEFAULTS[name]
	end

	if limits then
		if v < limits.min then
			return limits.min
		end
		if v > limits.max then
			return limits.max
		end
	end

	return v
end

function TeleportalConfig.getTeleportCooldownSeconds()
	return resolve().TELEPORT_COOLDOWN_SECONDS
end
```

**Key Points:**
- **Always call getters**, never access SandboxVars directly
- Validate against min/max bounds
- Fallback to defaults for invalid values
- MP-safe (server controls all validation)

---

## Translation File (Sandbox_EN.txt)

**File:** `media/lua/shared/translate/en/Sandbox_EN.txt`

Provides UI labels and tooltips.

```lua
Sandbox_EN = {
	Sandbox_Teleportal = "Teleportal",
	Sandbox_Teleportal_TeleportCooldownSeconds = "Teleport Cooldown",
	Sandbox_Teleportal_TeleportCooldownSeconds_tooltip = "Minimum real-time delay (in seconds) between teleports per player. Prevents spam and exploits.",
	Sandbox_Teleportal_MaxPortals = "Max Portals",
	Sandbox_Teleportal_MaxPortals_tooltip = "Maximum number of active teleports allowed in the world. Higher values use more server memory.",
	Sandbox_Teleportal_MinDistance = "Min Distance",
	Sandbox_Teleportal_MinDistance_tooltip = "Minimum distance (in tiles) required between portal source and destination. Prevents teleporting into the same location.",
	Sandbox_Teleportal_TriggerRadius = "Trigger Radius",
	Sandbox_Teleportal_TriggerRadius_tooltip = "Distance (in tiles) for portal activation detection. 0 = exact square only; 0.6 = allows nearby squares to trigger.",
}
```

**Critical Rules:**
- **Use proper Lua table syntax** (commas after entries, quoted values)
- **Key format:** `Sandbox_<ModID>_<OptionName>` (engine prepends `Sandbox_`)
- **Page title key:** `Sandbox_<ModID>` (no suffix)
- **Tooltip key:** Append `_tooltip` to option key
- **Path must be exact:** `media/lua/shared/translate/en/Sandbox_EN.txt`
- If path is wrong, translations **silently fail to load**

---

## Accessing Values in Code

**Never access SandboxVars directly:**
```lua
-- ❌ Wrong
local cooldown = SandboxVars.Teleportal.TeleportCooldownSeconds
```

**Always use getters:**
```lua
-- ✅ Correct
local cooldown = TeleportalConfig.getTeleportCooldownSeconds()
```

---

## Common Pitfalls

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing `VERSION = 1,` | Options don't parse | Add to top of `sandbox-options.txt` |
| Translation key has `Sandbox_` prefix | Double `Sandbox_` in lookup (shows raw key) | Remove prefix from `sandbox-options.txt` |
| Wrong translation path | Translations don't load (blank UI) | Use `media/lua/shared/translate/en/` exactly |
| Invalid Lua table syntax | Error on load | Quote values, add commas, close with `}` |
| Direct SandboxVars access | Bypass validation → exploits | Always use getter functions |
| Missing fallback in Lua | Old saves crash | Initialize in `OnGameBoot` with `or defaults` |

---

## Example: Full Setup

### 1. sandbox-options.txt
```txt
VERSION = 1,

option Teleportal.CooldownSeconds
{
	page = Teleportal,
	translation = CooldownSeconds,
	tooltip = CooldownSeconds_tooltip,
	type = double,
	min = 0.5,
	max = 60,
	default = 2,
}
```

### 2. TeleportalSandboxVars.lua
```lua
Events.OnGameBoot.Add(function()
	SandboxVars.Teleportal = SandboxVars.Teleportal or {}
	SandboxVars.Teleportal.CooldownSeconds =
		SandboxVars.Teleportal.CooldownSeconds or 2
end)
```

### 3. Sandbox_EN.txt
```lua
Sandbox_EN = {
	Sandbox_Teleportal = "Teleportal",
	Sandbox_CooldownSeconds = "Cooldown (seconds)",
	Sandbox_CooldownSeconds_tooltip = "Real-time delay between teleports.",
}
```

### 4. Teleportal_Config.lua
```lua
function TeleportalConfig.getCooldownSeconds()
	return resolve().COOLDOWN_SECONDS
end
```

### 5. In gameplay code
```lua
local cooldown = TeleportalConfig.getCooldownSeconds() -- Always use getter
```

---

## Testing

1. **Create a new world** (not load existing save)
2. **New Game → Sandbox → Teleportal tab**
3. Verify options appear with proper labels + tooltips
4. Change values and create world
5. In game, verify values were saved via console:
   ```lua
   print(SandboxVars.Teleportal.CooldownSeconds)
   ```

---

## Build 42.13.x Specifics

- **No Lua UI registration event** (e.g., `OnCreateSandboxOptions` does NOT exist)
- **`sandbox-options.txt` is the ONLY way** to expose UI
- **Translations must be in a Lua table** (not arbitrary text)
- **Silent failures are common** (bad paths, syntax errors, missing keys)
- **Full game restart required** to reload (hot reload does not work)

---

## Summary

| Component | File | Purpose | Loader |
|-----------|------|---------|--------|
| UI Definition | `sandbox-options.txt` | Declares options + ranges | Engine (automatic) |
| Lua Defaults | `TeleportalSandboxVars.lua` | Fallback for old saves | `OnGameBoot` event |
| Translations | `Sandbox_EN.txt` | UI labels + tooltips | Engine (automatic) |
| Validation | `Teleportal_Config.lua` | Trust boundary + getters | Code (manual calls) |

**The three layers work together: UI declares the option, Lua ensures it exists, Config validates and gates gameplay.**
