Below is a **clean, repository-ready Markdown document** derived from the **Project Zomboid Wiki – Mod optimization** page. It is structured for developers, Build 42-era mods, and multiplayer safety, and is suitable for inclusion as `Mod_Optimization.md` or similar.

---

# Project Zomboid Mod Optimization

This document outlines best practices for optimizing Project Zomboid mods to improve performance, stability, and multiplayer reliability. The guidelines are based on the official Project Zomboid Wiki and are applicable to Build 42 and later.

---

## Overview

Poorly optimized mods can cause:

* Client FPS drops
* Server lag and desynchronization
* Excessive memory usage
* Long load times
* Multiplayer instability and kicks

Optimization is especially important in **multiplayer**, where server authority, synchronization, and tick budgets are strict.

---

## General Optimization Principles

### Avoid Heavy Processing in Frequent Events

Some events are called **very often** (every tick or every frame). Code inside these events must be minimal.

High-frequency events include:

* `Events.OnTick`
* `Events.OnPlayerMove`
* `Events.OnPlayerUpdate`
* `Events.OnRenderTick`

**Guidelines:**

* Never perform loops over the entire world or large tables
* Never spawn objects or items directly
* Never perform file I/O
* Avoid string manipulation and table allocations

**Recommended approach:**

* Throttle logic using counters or timestamps
* Cache results instead of recalculating

---

## Event Usage Best Practices

### Prefer Targeted Events

Instead of polling every tick, use events that trigger **only when needed**:

| Instead of       | Prefer                           |
| ---------------- | -------------------------------- |
| `OnTick`         | `OnGameStart`                    |
| `OnTick`         | `OnLoadMapZones`                 |
| `OnTick`         | `OnCreatePlayer`                 |
| `OnPlayerUpdate` | `OnPlayerMove` (with throttling) |

---

### Throttling Example

```lua
local counter = 0

Events.OnTick.Add(function()
    counter = counter + 1
    if counter < 60 then return end -- once per second
    counter = 0

    -- lightweight logic here
end)
```

---

## Lua Performance Considerations

### Cache Globals and Functions

Repeated global lookups are expensive.

**Bad:**

```lua
if getPlayer():isAsleep() then
    -- logic
end
```

**Good:**

```lua
local getPlayer = getPlayer

if getPlayer():isAsleep() then
    -- logic
end
```

---

### Avoid Repeated Table Creation

**Bad:**

```lua
for i=1,1000 do
    local t = { x = i, y = i }
end
```

**Good:**

```lua
local t = {}
for i=1,1000 do
    t.x = i
    t.y = i
end
```

---

## World and Object Optimization

### Avoid Unnecessary IsoObject Creation

* Creating IsoObjects is expensive
* Transmitting them to clients is even more expensive

**Recommendations:**

* Reuse objects where possible
* Avoid creating objects in bulk
* Avoid object creation in high-frequency events

---

### Chunk-Aware Logic

Operate only on **loaded chunks** or **nearby squares**:

* Use player position as an anchor
* Never scan the entire world grid
* Prefer `OnLoadGridSquare` or `OnLoadChunk` events

---

## Multiplayer Optimization

### Server Authority Is Mandatory

In multiplayer:

* Inventory manipulation must be server-side
* Player damage must be server-side
* Object creation/removal must be server-side

Client-side logic should be limited to:

* UI
* Animations
* Sound
* Input handling

---

### Minimize Network Traffic

Avoid:

* Sending frequent `sendClientCommand` calls
* Sending large argument tables
* Sending commands every tick

**Batch or debounce network calls whenever possible.**

---

## File and Asset Optimization

### Textures

* Use power-of-two dimensions where possible
* Avoid large PNG files
* Do not include unused textures

---

### Sounds

* Use compressed formats (`.ogg`)
* Keep sound files short
* Avoid looping sounds unless necessary

---

## Script Organization

### Split Code by Responsibility

Recommended structure:

```
media/lua/
├── client/
│   └── ui logic, visuals
├── server/
│   └── authority logic
└── shared/
    └── data, helpers, enums
```

Avoid large monolithic Lua files.

---

## Common Performance Anti-Patterns

Avoid the following patterns:

* World scans (`for x=0,worldX do`)
* Per-tick file reads or writes
* Repeated `getCell()` or `getWorld()` calls
* Modifying inventories on the client
* Repeated object spawning and removal

---

## Debugging and Profiling Tips

* Enable debug logs and watch for spam
* Temporarily disable mods to isolate performance issues
* Test mods in multiplayer early
* Monitor server tick rate and memory usage

---

## Final Recommendations

* Optimize for **worst-case scenarios**, not ideal conditions
* Assume your mod will run alongside many others
* Treat multiplayer as the default target
* Favor clarity and safety over cleverness

---

## Summary

> Efficient mods are invisible.
> Inefficient mods are felt immediately.

Good optimization ensures:

* Stable multiplayer sessions
* Predictable behavior
* Better player experience

---
