Below is a **Build 42–correct, production-grade SP/MP-safe ModData template**.
This pattern deliberately **works identically in Single Player and Multiplayer**, avoids silent SP-only success, and respects server authority.

---

## SP / MP–Safe Global ModData Template (Build 42)

This template assumes:

- One **authoritative server write path**
- Explicit **request → validate → transmit**
- Client logic is **read-only**
- Works in SP without branching hacks

---

## 1. Constants (Shared)

**`media/lua/shared/MyMod_ModData.lua`**

```lua
MyMod_ModData = {}

MyMod_ModData.TAG = "MyMod_GlobalState"

-- defensive schema versioning
MyMod_ModData.VERSION = 1
```

---

## 2. Server Authority Layer

**`media/lua/server/MyMod_ModData_Server.lua`**

```lua
require "MyMod_ModData"

local function getOrInit()
    local data = ModData.getOrCreate(MyMod_ModData.TAG)

    if not data.__version then
        data.__version = MyMod_ModData.VERSION
        data.counter = 0
        data.flags = {}
        ModData.add(MyMod_ModData.TAG, data) -- persistence anchor
    end

    return data
end

-- authoritative mutation
function MyMod_ModData.incrementCounter()
    local data = getOrInit()
    data.counter = data.counter + 1

    -- ensure persistence
    ModData.add(MyMod_ModData.TAG, data)

    -- optional broadcast
    ModData.transmit(MyMod_ModData.TAG)
end
```

**Why this is safe**

- Initialization occurs only on server
- Schema is versioned
- Persistence is explicit
- No client writes possible

---

## 3. Server Request Handler (Initial Sync)

**`media/lua/server/MyMod_ModData_Network.lua`**

```lua
require "MyMod_ModData"

local function onReceiveGlobalModData(tag, _)
    if tag ~= MyMod_ModData.TAG then return end

    -- optional access control (example)
    -- local player = ... (ModData lacks sender identity!)
    -- For sensitive data: do NOT use ModData, use sendClientCommand

    ModData.transmit(tag)
end

Events.OnReceiveGlobalModData.Add(onReceiveGlobalModData)
```

**Important**

- Server never auto-sends
- This is the only legal response path

---

## 4. Client Reception Layer

**`media/lua/client/MyMod_ModData_Client.lua`**

```lua
require "MyMod_ModData"

local function onReceiveGlobalModData(tag, data)
    if tag ~= MyMod_ModData.TAG then return end
    if not data then return end

    -- accept snapshot
    ModData.add(tag, data)
end

Events.OnReceiveGlobalModData.Add(onReceiveGlobalModData)
```

**Client rules**

- Never mutates
- Never assumes persistence
- Only caches snapshots

---

## 5. Client Initial Request (SP & MP)

**`media/lua/client/MyMod_ModData_Init.lua`**

```lua
require "MyMod_ModData"

local function onInit()
    ModData.request(MyMod_ModData.TAG)
end

Events.OnInitGlobalModData.Add(onInit)
```

**Why this works in SP**

- SP fires the same event
- Server and client share VM
- No branching needed

---

## 6. Reading ModData (Shared Utility)

**`media/lua/shared/MyMod_ModData_Read.lua`**

```lua
require "MyMod_ModData"

function MyMod_ModData.getSnapshot()
    return ModData.get(MyMod_ModData.TAG)
end
```

**Usage**

```lua
local data = MyMod_ModData.getSnapshot()
if data then
    print(data.counter)
end
```

---

## 7. Admin / Sensitive Mutations (REQUIRED ALTERNATIVE)

**Do NOT do this with ModData.**

### Client

```lua
sendClientCommand("MyMod", "IncrementCounter", {})
```

### Server

```lua
local Commands = {}

Commands.IncrementCounter = function(player, _)
    if player:getAccessLevel() ~= "admin" then return end
    MyMod_ModData.incrementCounter()
end

Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" and Commands[command] then
        Commands[command](player, args)
    end
end)
```

---

## 8. Why This Template Is SP/MP-Safe

| Concern        | Addressed            |
| -------------- | -------------------- |
| SP hides bugs  | No client writes     |
| MP authority   | Server-only mutation |
| Persistence    | Explicit ModData.add |
| Initial sync   | Explicit request     |
| Restart safety | Server save only     |
| Schema drift   | Versioned            |
| Security       | ModData not trusted  |

---

## 9. Minimal Checklist (Use This Every Time)

- [ ] `ModData.add()` called on server after mutation
- [ ] No client writes to Global ModData
- [ ] `ModData.request()` on init
- [ ] `ModData.transmit()` only on server
- [ ] Sensitive ops via `sendClientCommand`
- [ ] Version field present

---

## 10. One-Line Rule (Memorize This)

> **If it must survive restart or resist cheating, it must be written on the server and saved with `ModData.add()`—never from the client.**

---
