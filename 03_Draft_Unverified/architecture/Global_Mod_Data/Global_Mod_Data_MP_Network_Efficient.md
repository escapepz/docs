You are correct.
For **Build 42–grade multiplayer mods**, the **optimal pattern is client-driven, targeted sync using `sendClientCommand`**, not server-side `ModData.transmit()` broadcasts.

Below is the **corrected, bandwidth-efficient SP/MP-safe template**, with **RakNet packet minimization** and **server authority preserved**.

---

## Correct Architecture (Build 42, Network-Efficient)

### Key Principle

> **Global ModData is for persistence, not transport.** > **`sendClientCommand` is for synchronization.**

`ModData.transmit()` is:

- Full-table
- Broadcast
- Sender-blind
- Expensive

Therefore it should be treated as **exceptional**, not normal.

---

## Revised Responsibility Split

| Layer               | Responsibility         |
| ------------------- | ---------------------- |
| `ModData`           | Persistence only       |
| `sendClientCommand` | Requests + responses   |
| Server              | Authority + validation |
| Client              | Cache + UI             |

---

## 1. Persistent Storage (Server Only)

**`media/lua/server/MyMod_State_Server.lua`**

```lua
MyMod_State = {}

MyMod_State.TAG = "MyMod_GlobalState"

local function getOrInit()
    local data = ModData.getOrCreate(MyMod_State.TAG)

    if not data.version then
        data.version = 1
        data.counter = 0
        ModData.add(MyMod_State.TAG, data)
    end

    return data
end

function MyMod_State.increment()
    local data = getOrInit()
    data.counter = data.counter + 1

    -- persistence only
    ModData.add(MyMod_State.TAG, data)
end
```

**No transmit. Ever.**

---

## 2. Client → Server Request (Targeted)

**Client**

```lua
sendClientCommand("MyMod", "RequestState", {})
```

---

## 3. Server Command Handler (Validated)

**`media/lua/server/MyMod_Commands.lua`**

```lua
local Commands = {}

Commands.RequestState = function(player, _)
    local data = ModData.get(MyMod_State.TAG)
    if not data then return end

    -- send only to requester
    sendServerCommand(player, "MyMod", "StateSnapshot", {
        counter = data.counter,
        version = data.version
    })
end

Commands.Increment = function(player, _)
    if player:getAccessLevel() ~= "admin" then return end
    MyMod_State.increment()
end

Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" and Commands[command] then
        Commands[command](player, args)
    end
end)
```

**Benefits**

- Sender identity known
- Access control enforced
- Only one client receives data
- Partial payload (not whole table)

---

## 4. Client Reception (No ModData Write)

**`media/lua/client/MyMod_Client.lua`**

```lua
MyMod_ClientState = {}

local function onServerCommand(module, command, args)
    if module ~= "MyMod" then return end

    if command == "StateSnapshot" then
        MyMod_ClientState.counter = args.counter
        MyMod_ClientState.version = args.version
    end
end

Events.OnServerCommand.Add(onServerCommand)
```

**Client state is ephemeral.**
No persistence.
No cheating risk.
No save pollution.

---

## 5. Single Player Compatibility (Why This Still Works)

In **Single Player**:

- Client and server run in the same process
- `sendClientCommand` / `sendServerCommand` are short-circuited
- Zero RakNet cost
- Same authority semantics

So **do not special-case SP**.

---

## 6. When (If Ever) `ModData.transmit()` Is Acceptable

Use **only if ALL are true**:

- Data is non-sensitive
- Data is rarely changed
- All clients need it
- Table is small
- Simplicity > bandwidth

Examples:

- World seed metadata
- Static world configuration
- Rare global events (once per hour)

Otherwise: **do not use it**.

---

## 7. Network Cost Comparison

| Method              | Scope     | Payload    | RakNet Cost |
| ------------------- | --------- | ---------- | ----------- |
| `ModData.transmit`  | Broadcast | Full table | **High**    |
| `sendServerCommand` | Targeted  | Partial    | **Low**     |
| `sendClientCommand` | Targeted  | Partial    | **Low**     |

---

## 8. Final Rule (Build 42 Correct)

> **Persist with ModData.
> Synchronize with commands.
> Never broadcast unless you truly mean “everyone”.**

---
