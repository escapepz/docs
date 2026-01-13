# Chunk-Batched Marker Retry System – Best Practices & Examples

## Overview

This guide covers the **chunk-batched O(1) retry architecture** for handling markers that fail to create due to unloaded chunks in Project Zomboid Build 42+.

---

## Why Chunk Batching?

### The Problem

Without batching:

- Every frame, scan **all failed markers** against loaded chunks
- Repeatedly divide tile coords by 10 without flooring
- Create decimal chunk indices (`997.6`)
- Massive CPU cost in multiplayer with many failed markers

### The Solution

With batching:

- Markers are pre-bucketed by chunk: `["chunkX,chunkY"] = {markers}`
- When a chunk loads, **O(1) lookup** to its bucket
- Only retry markers for **that chunk**, not all
- No decimal coordinates ever
- Safe hybrid: LoadChunk event (primary) + tick-throttled fallback (safety net for already-loaded chunks)

---

## Architecture

### Data Structure

```lua
SelectionState.failedMarkersByChunk = {
    -- ["100,200"] = { markerData, markerData, ... }
    -- ["101,200"] = { markerData, ... }
}
```

Each chunk key holds a **list of markers** that belong to it.

### Utility Functions

#### 1. Tile → Chunk Conversion

```lua
local function tileToChunk(x, y)
    return math.floor(x / 10), math.floor(y / 10)
end
```

**Key rule:** Always `math.floor()` before comparing chunk indices.

**Example:**

```lua
local cx, cy = tileToChunk(1088, 9976)
-- cx = 108, cy = 997 (never 108.8, 997.6)
```

#### 2. Chunk Key Generation

```lua
local function chunkKey(chunkX, chunkY)
    return chunkX .. "," .. chunkY
end
```

**Creates:** `"100,200"` from chunk coords `100, 200`.

#### 3. Queue Failed Marker

```lua
local function queueFailedMarker(markerData)
    local cx, cy = tileToChunk(markerData.x, markerData.y)
    local key = chunkKey(cx, cy)

    SelectionState.failedMarkersByChunk[key] =
        SelectionState.failedMarkersByChunk[key] or {}

    table.insert(SelectionState.failedMarkersByChunk[key], markerData)
end
```

**Called when:** A marker fails to create (chunk not loaded).

---

## Hybrid Event-Driven + Fallback Architecture

The **correct** approach uses two complementary paths:

### Primary Path: `Events.LoadChunk`

- Fires when chunk streams into memory
- **O(1)** lookup to marker bucket for that chunk
- Immediate retry
- Most deterministic

### Fallback Path: Render Tick (Throttled)

- Runs every 60 ticks (~1 second)
- Checks if any pending markers have chunks already loaded
- Catches edge case: chunk was loaded before queueing happened
- Minimal performance cost (counter-based, not time-based)
- **Guard flag** prevents concurrent execution (cheap, no event churn)

```lua
local fallbackRetryTickCounter = 0
local FALLBACK_RETRY_INTERVAL_TICKS = 60
local isFallbackRetrying = false  -- Guard: prevent concurrent/stacked execution

local function fallbackRetryVisibleChunks()
    -- Guard: if already retrying, skip (prevents stacking if event fires again)
    if isFallbackRetrying then
        return
    end

    fallbackRetryTickCounter = fallbackRetryTickCounter + 1
    if fallbackRetryTickCounter < FALLBACK_RETRY_INTERVAL_TICKS then
        return  -- Skip until 60 ticks have passed
    end
    fallbackRetryTickCounter = 0

    if not getCell() then
        return
    end

    isFallbackRetrying = true  -- Mark: batch in progress

    -- Iterate pending buckets and retry already-loaded chunks
    for key, batch in pairs(SelectionState.failedMarkersByChunk) do
        local md = batch[1]
        local sq = getCell():getGridSquare(md.x, md.y, md.z)
        if sq then
            -- Chunk is loaded, retry this batch
            -- (same logic as LoadChunk retry)
        end
    end

    isFallbackRetrying = false  -- Release guard: batch complete
end
```

---

## Guard Flag Pattern (Concurrency Control)

When running expensive operations in render ticks, use a simple boolean guard to prevent concurrent/stacked execution:

**Problem (without guard):**

```lua
-- BAD: Event removed/re-added every tick = expensive allocation churn
Events.OnRenderTick.Add(function()
    Events.OnRenderTick.Remove(expensiveFunc)
    expensiveFunc()  -- Run once
    Events.OnRenderTick.Add(expensiveFunc)  -- Re-register
end)
```

**Solution (with guard):**

```lua
-- GOOD: Simple flag check, no event manipulation
local isProcessing = false

local function expensiveFunc()
    if isProcessing then
        return  -- Already running, skip stacked call
    end
    isProcessing = true

    -- Do expensive work

    isProcessing = false  -- Done
end

Events.OnRenderTick.Add(function()
    expensiveFunc()  -- Safe: guard prevents re-entry
end)
```

**Benefits:**

- No event listener allocation/deallocation per tick
- Simple, easy to understand
- Prevents stacked execution if function takes multiple ticks
- Works perfectly with throttling (counter) + guard combined

---

## Best Practices

### 1. Always Floor Tile-to-Chunk Division

**❌ WRONG:**

```lua
local chunkX = sq:getX() / 10  -- 108.8 (decimal!)
if markerChunkX == chunkX then  -- Unreliable comparison
```

**✅ CORRECT:**

```lua
local chunkX = math.floor(sq:getX() / 10)  -- 108 (integer)
if markerChunkX == chunkX then  -- Deterministic
```

### 2. Derive Chunk Position from Grid Squares

**❌ WRONG:**

```lua
local chunkX = chunk:getX()  -- Does not exist in Build 42
```

**✅ CORRECT:**

```lua
local sq = chunk:getGridSquare(0, 0, 0)
local chunkX = math.floor(sq:getX() / 10)
```

### 3. Queue Immediately After Every Failure

**Must queue ALL marker creation failures**, including:

- Source/destination markers from server confirmation
- Portal markers in the render-tick sync loop
- Any dynamic marker creation

```lua
-- Source marker
local marker = createStaticMarker(args.x, args.y, args.z, colorSrc.r, colorSrc.g, colorSrc.b)
if not marker then
    queueFailedMarker({
        x = args.x, y = args.y, z = args.z,
        r = colorSrc.r, g = colorSrc.g, b = colorSrc.b,
        markerType = "source"
    })
end

-- Portal markers in loop
local sourceMarker = createStaticMarker(portal.source.x, ...)
if not sourceMarker then
    queueFailedMarker({
        x = portal.source.x, y = portal.source.y, z = portal.source.z,
        r = colorSrc.r, g = colorSrc.g, b = colorSrc.b,
        markerType = "portal_source",
        portalId = portalId
    })
end
```

### 4. Never Retry Outside LoadChunk

**❌ WRONG:**

```lua
Events.OnRenderTick.Add(function()
    retryFailedMarkers()  -- Scans ALL markers every frame!
end)
```

**✅ CORRECT:**

```lua
Events.LoadChunk.Add(function(chunk)
    retryFailedMarkersForChunk(chunk)  -- O(1) per chunk load
end)
```

### 5. Handle Still-Failed Markers

**Pattern:**

```lua
local stillFailed = {}
for _, markerData in ipairs(batch) do
    local marker = createStaticMarker(...)
    if not marker then
        table.insert(stillFailed, markerData)  -- Keep for next attempt
    end
end

if #stillFailed > 0 then
    SelectionState.failedMarkersByChunk[key] = stillFailed
else
    SelectionState.failedMarkersByChunk[key] = nil  -- Clean up
end
```

---

## Complete Examples

### Example 1: Creating Source Marker with Fallback

```lua
function onSourceConfirmed(args)
    local colorSrc, _ = TeleportalConfig.getColors()

    -- Try immediate creation
    local marker = createStaticMarker(
        args.x, args.y, args.z,
        colorSrc.r, colorSrc.g, colorSrc.b
    )

    if marker then
        SelectionState.sourceFinalMarker = marker
    else
        -- Queue for retry when chunk loads
        queueFailedMarker({
            x = args.x,
            y = args.y,
            z = args.z,
            r = colorSrc.r,
            g = colorSrc.g,
            b = colorSrc.b,
            markerType = "source"
        })
    end
end
```

### Example 2: Batch Retry for Loaded Chunk

```lua
local function retryFailedMarkersForChunk(chunk)
    -- Step 1: Derive chunk position safely
    local sq = chunk:getGridSquare(0, 0, 0)
    if not sq then
        return  -- Safety check
    end

    local chunkX = math.floor(sq:getX() / 10)
    local chunkY = math.floor(sq:getY() / 10)
    local key = chunkKey(chunkX, chunkY)

    -- Step 2: O(1) lookup for markers in this chunk
    local batch = SelectionState.failedMarkersByChunk[key]
    if not batch then
        return  -- Nothing waiting for this chunk
    end

    -- Step 3: Log and retry
    SharedLogger.log(
        "Teleportal",
        "Visual: Chunk " .. key .. " loaded, retrying " .. #batch .. " markers"
    )

    -- Step 4: Process all markers
    local stillFailed = {}
    for _, markerData in ipairs(batch) do
        local marker = createStaticMarker(
            markerData.x, markerData.y, markerData.z,
            markerData.r, markerData.g, markerData.b
        )

        if not marker then
            table.insert(stillFailed, markerData)
        end
    end

    -- Step 5: Update or clean up
    if #stillFailed > 0 then
        SelectionState.failedMarkersByChunk[key] = stillFailed
    else
        SelectionState.failedMarkersByChunk[key] = nil
    end
end
```

### Example 3: Hybrid Event Wiring (LoadChunk + Guarded Fallback)

```lua
Events.OnGameBoot.Add(function()
    -- Primary: Chunk load triggers instant retry (O(1))
    Events.LoadChunk.Add(function(chunk)
        if chunk then
            retryFailedMarkersForChunk(chunk)
        end
    end)

    -- Secondary: Render tick handles portal sync + guarded fallback retry
    -- Guard flag (isFallbackRetrying) prevents concurrent execution
    Events.OnRenderTick.Add(function()
        updatePortalMarkers()           -- Sync server data every tick
        fallbackRetryVisibleChunks()    -- Throttled, guarded fallback
    end)

    SharedLogger.log("Teleportal", "Visual: LoadChunk (primary) + guarded fallback (safety) registered")
end)
```

**How it works:**

1. **LoadChunk** fires when new chunks stream in → immediate O(1) retry
2. **Render tick** runs every frame, but:
   - `fallbackRetryVisibleChunks()` throttled to 60-tick intervals
   - Guard flag `isFallbackRetrying` prevents concurrent batches
   - No event listener churn (no Remove/Add per tick)
3. **Fallback detects** chunks loaded before markers were queued
4. **Together** they catch all scenarios (new load, already-loaded, still-unloaded)

### Example 4: Clearing All Failed Markers

```lua
local function clearAllFailedMarkers()
    SelectionState.failedMarkersByChunk = {}
    SharedLogger.log("Teleportal", "Visual: Cleared all failed marker queues")
end
```

### Example 5: Checking Queue Status

```lua
local function getFailedMarkerCount()
    local total = 0
    for _, batch in pairs(SelectionState.failedMarkersByChunk) do
        total = total + #batch
    end
    return total
end

-- Usage
local count = getFailedMarkerCount()
if count > 0 then
    SharedLogger.log("Teleportal", "Visual: " .. count .. " markers still queued")
end
```

---

## Common Patterns

### Pattern: Multi-Marker Batch Creation with Queueing

When creating multiple markers in a loop (e.g., from server portal data), handle failures inline:

```lua
-- In updatePortalMarkers() render loop
for portalId, portal in pairs(portals) do
    if portal and portal.source and portal.dest then
        if not SelectionState.portalMarkers[portalId] then
            -- Try source
            local sourceMarker = createStaticMarker(
                portal.source.x,
                portal.source.y,
                portal.source.z,
                colorSrc.r,
                colorSrc.g,
                colorSrc.b
            )

            -- Try destination
            local destMarker = createStaticMarker(
                portal.dest.x,
                portal.dest.y,
                portal.dest.z,
                colorDest.r,
                colorDest.g,
                colorDest.b
            )

            SelectionState.portalMarkers[portalId] = {
                source = sourceMarker,
                dest = destMarker,
            }

            -- Queue failures
            if not sourceMarker then
                queueFailedMarker({
                    x = portal.source.x,
                    y = portal.source.y,
                    z = portal.source.z,
                    r = colorSrc.r,
                    g = colorSrc.g,
                    b = colorSrc.b,
                    markerType = "portal_source",
                    portalId = portalId
                })
            end

            if not destMarker then
                queueFailedMarker({
                    x = portal.dest.x,
                    y = portal.dest.y,
                    z = portal.dest.z,
                    r = colorDest.r,
                    g = colorDest.g,
                    b = colorDest.b,
                    markerType = "portal_dest",
                    portalId = portalId
                })
            end
        end
    end
end
```

### Pattern: Chunk-Aware Marker Removal

```lua
local function removeMarkersInChunk(chunkX, chunkY)
    local key = chunkKey(chunkX, chunkY)

    -- Remove from queue
    SelectionState.failedMarkersByChunk[key] = nil

    SharedLogger.log(
        "Teleportal",
        "Visual: Removed queued markers for chunk " .. key
    )
end
```

---

## Pitfalls to Avoid

### ❌ Pitfall 1: Forgetting math.floor()

```lua
-- BAD
local cx = sq:getX() / 10
local cy = sq:getY() / 10
-- cx = 108.8, cy = 997.6 (decimals in logs!)
```

### ❌ Pitfall 2: Unthrottled Render Tick + No Guard

```lua
-- BAD: Expensive operation every frame, with event churn
Events.OnRenderTick.Add(function()
    Events.OnRenderTick.Remove(expensiveFunc)  -- Event churn!
    retryAllFailedMarkers()  -- CPU death!
    Events.OnRenderTick.Add(expensiveFunc)  -- Event churn!
end)

-- GOOD: Throttled (60 ticks) + guarded (flag check)
local retryTickCounter = 0
local isRetrying = false

local function retryMarkers()
    if isRetrying then return end  -- Guard
    retryTickCounter = retryTickCounter + 1
    if retryTickCounter < 60 then return end  -- Throttle
    retryTickCounter = 0

    isRetrying = true
    -- Do work here
    isRetrying = false
end

Events.OnRenderTick.Add(retryMarkers)  -- Safe, cheap
```

### ❌ Pitfall 3: Using Non-Existent chunk:getX()

```lua
-- BAD
local chunkX = chunk:getX()  -- Doesn't exist in Lua
```

### ❌ Pitfall 4: Not Cleaning Up Completed Buckets

```lua
-- BAD
SelectionState.failedMarkersByChunk[key] = stillFailed
-- If stillFailed is empty, bucket stays forever
```

### ❌ Pitfall 5: Logging Decimal Coordinates

```lua
-- BAD
SharedLogger.log("Chunk at " .. (sq:getX() / 10) .. "," .. (sq:getY() / 10))
-- Output: "Chunk at 108.8, 997.6"
```

---

## Complexity Analysis

| Operation      | Complexity | Cost                 |
| -------------- | ---------- | -------------------- |
| Queue marker   | O(1)       | Constant             |
| Lookup bucket  | O(1)       | Hash table lookup    |
| Process chunk  | O(n)       | n = markers in chunk |
| Per frame      | O(1)       | No scanning          |
| Per chunk load | O(n)       | Only affected chunk  |

**Result:** From O(m) per frame to O(1), where m = total failed markers.

---

## Testing Checklist

### Queue & Bucket

- [ ] Queue marker with unloaded chunk → logs "Queued failed marker ... into bucket X,Y"
- [ ] Marker ends up in correct bucket (`math.floor(x/10), math.floor(y/10)`)
- [ ] Multiple markers in same chunk → same bucket
- [ ] Multiple chunks → independent buckets

### LoadChunk Path (Primary)

- [ ] Load chunk → calls `retryFailedMarkersForChunk()`
- [ ] Retries only markers in that loaded chunk
- [ ] Successful creation → removed from bucket
- [ ] Failed creation → stays in bucket, logged as "Still failed"
- [ ] Empty bucket → deleted (set to `nil`)

### Fallback Retry (Safety)

- [ ] Fallback logs "checking X pending markers in Y chunks" (every 60 ticks)
- [ ] Already-loaded chunks detected and retried
- [ ] Per-marker success/failure logged
- [ ] Counter-based throttling (not time-based)

### General

- [ ] No fractional chunk coords in logs (no `1088.8`)
- [ ] "Queued" logs for all three marker sources
- [ ] Portal markers from sync loop also get queued
- [ ] Multiplayer safe (works SP and MP)

---

## References

- **Tile Space:** X, Y coordinates on the game map (1-indexed, world size)
- **Chunk Space:** 10×10 tile divisions (integer coordinates only)
- **Grid Square:** Individual cell, has `getX()`, `getY()`, `getZ()`
- **IsoChunk:** Container of 10×10 grid squares, accessed via cell

---

## Summary

Use this architecture when:

- Markers fail due to unloaded chunks
- You need deterministic retry behavior
- Performance matters (multiplayer)
- Build 42+ compatibility required

Key rules:

1. **Always floor tile-to-chunk division**
2. **Derive chunk position from grid squares**
3. **Queue immediately on failure**
4. **Trigger retry only on LoadChunk**
5. **Clean up completed buckets**
