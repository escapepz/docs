# Mod data - PZwiki

Source: https://pzwiki.net/wiki/Mod_data

This page has been updated to the current _unstable_ beta version ([42.13.1](https://pzwiki.net/wiki/Build_42.13.1 "Build 42.13.1")).

**Mod data** tables are used to persistently store Lua data. Mod data tables are regular Lua tables; they do not have any special semantics or functionality. Only plain old data (strings, booleans, numbers, and tables) can be stored persistently.

In other games, to have persistent data it is often required that you manually save your data when the save gets closed, but in Project Zomboid, you **should not do that** because the game handles the saving of the mod data. You should simply use the mod data as a [table](<https://pzwiki.net/wiki/Lua_(language)#Tables> "Lua (language)") that will persist between sessions. If data you are using doesn't need to be persistent, you can simply use a [module](<https://pzwiki.net/wiki/Lua_(language)#Modules> "Lua (language)").

> [!NOTE]
> Accessing mod data during the event [OnSave](https://pzwiki.net/wiki/OnSave "OnSave") will not access the save mod data but the next session mod data. This means if you store anything during the [OnSave](https://pzwiki.net/wiki/OnSave "OnSave") event, these data will possibly be there in the next session, as long as you don't close the game.

## Object mod data

[Community] [LuaAPI] [Reference]

Any IsoObject has mod data, typically referred to as _object mod data_ for disambiguation. Object mod data belongs to an instance of an object, such as a specific player or tile. Object mod data can be retrieved using `object:getModData()`.

```lua
local player = getPlayer()
local modData = player:getModData()
modData.myString = "Hello World"
modData.myNumber = 42
modData.myTable = {1, 2, 3}
modData.myBoolean = true
```

## Global mod data

[Community] [LuaAPI] [Reference]

Global mod data is similar to object mod data, but does not belong to a specific object. Instead, global mod data tables are accessed with a unique string key through the [ModData](https://projectzomboid.com/modding/zombie/world/moddata/ModData.html) class.

```lua
local modData = ModData.getOrCreate("MyModDataID")
modData.myString = "Hello World"
modData.myNumber = 42
modData.myTable = {1, 2, 3}
modData.myBoolean = true
```

To improve [performance](https://pzwiki.net/wiki/Mod_optimization "Mod optimization"), mod data can be cached, as the reference will not change throughout the course of a session:

```lua
local modData

-- cache the current save mod data when the save launches
Events.OnInitGlobalModData.Add(function()
    modData = ModData.getOrCreate("MyModDataID")
end)

-- example usage
Events.OnWeaponHitCharacter.Add(function(attacker, target, weapon, damage)
    modData.lastUsedWeapon = weapon:getFullType() -- persistently store the last used weapon
end)
```

## Networking

[Community] [MP] [Sync]

Global and object mod data is **not** automatically synchronized between server and clients in multiplayer games. This is actually a good thing, as it allows for more control over what data is sent over the network by allowing for network optimization, as well as client-side persistent data. This can however be a source of potential cheating if important data is only stored in client-side global mod data, and thus you need [networking](https://pzwiki.net/wiki/Networking "Networking") solutions.

The [networking](https://pzwiki.net/wiki/Networking "Networking") page covers part of the solutions available, but there exists an native solution for mod data, which however has some limitations. [ModData](https://projectzomboid.com/modding/zombie/world/moddata/ModData.html) has a function `transmit`, which can be used to send the entire mod data table for a specific `"MyModDataID"` from the client to the server, or vice versa. However, you have to manually intercept the transmited data with the use of [OnReceiveGlobalModData](https://pzwiki.net/wiki/OnReceiveGlobalModData "OnReceiveGlobalModData"). This networking solution is limited to small amounts of data, as the entire table is serialized and sent over the network at once, which was shown to be problematic and costly. Instead, use other [networking](https://pzwiki.net/wiki/Networking "Networking") solutions for larger amounts of data.

## External links

[Community] [Reference]

- [Global mod data guide](../Common/PZ-Mod---Doc/How%20to%20use%20global%20modData.md) - notably explains more in details the available functions and the networking aspects.
