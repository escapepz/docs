You can bypass the broken (42.15.0) `GlobalModData` packet system entirely using `sendClientCommand`/`sendServerCommand`, which use the `ClientCommand` packet type - a completely separate, working code path.

## Lua workaround

### Replace `ModData.transmit(key)`

```lua
-- shared module name
local MOD = "GlobalModDataFix"

-- CLIENT -> SERVER transmit
function transmitGlobalModData(key)
    local table = ModData.get(key)
    if not table then return end
    if isClient() then
        sendClientCommand(getPlayer(), MOD, "transmit", { key = key, data = table })
    end
end

-- SERVER -> ALL CLIENTS transmit
function transmitGlobalModDataToClients(key)
    local table = ModData.get(key)
    if not table then return end
    if isServer() then
        sendServerCommand(MOD, "transmit", { key = key, data = table })
    end
end

-- SERVER: receive transmit from client, store it, optionally broadcast
Events.OnClientCommand.Add(function(module, command, player, args)
    if module ~= MOD then return end
    if command == "transmit" then
        local existing = ModData.getOrCreate(args.key)
        copyTable(args.data, existing)
        -- optionally re-broadcast to all clients:
        -- sendServerCommand(MOD, "transmit", { key = args.key, data = args.data })
    elseif command == "request" then
        local table = ModData.get(args.key)
        sendServerCommand(player, MOD, "response", { key = args.key, data = table or false })
    end
end)

-- CLIENT: receive transmit/response from server
Events.OnServerCommand.Add(function(module, command, args)
    if module ~= MOD then return end
    if command == "transmit" or command == "response" then
        if args.data and args.data ~= false then
            local existing = ModData.getOrCreate(args.key)
            copyTable(args.data, existing)
            -- fire the same event mods expect:
            triggerEvent("OnReceiveGlobalModData", args.key, existing)
        else
            triggerEvent("OnReceiveGlobalModData", args.key, false)
        end
    end
end)
```

### Replace `ModData.request(key)`

```lua
function requestGlobalModData(key)
    if isClient() then
        sendClientCommand(getPlayer(), MOD, "request", { key = key })
    end
end
```

### Helper to deep-copy table fields

```lua
function copyTable(src, dst)
    for k, v in pairs(src) do
        if type(v) == "table" then
            if type(dst[k]) ~= "table" then dst[k] = {} end
            copyTable(v, dst[k])
        else
            dst[k] = v
        end
    end
end
```

## Limitations

`TableNetworkUtils` (used by `sendClientCommand`/`sendServerCommand`) only supports these value types for network transfer: `TableNetworkUtils.java:142-156`

- **Keys:** `String`, `Double` (numbers)
- **Values:** `String`, `Double`, `Boolean`, nested `KahluaTable`, `InventoryItem`, `IsoDirections`

Typical mod data (strings, numbers, booleans, nested tables) transfers fine. If your mod data contains Java objects or other exotic types, those entries will be silently dropped.

Also note the nested `data` table adds one layer of nesting. If your mod data is very deep or very large, you might hit buffer limits. For large payloads, consider chunking.
