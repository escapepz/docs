# B42.12.3 to B42.13 API Migration Notes

**Source:** [Google Doc](https://docs.google.com/document/d/1szxFHaFGcyIUAojnc817b59yPkzpp7Y-8IqxPT9OOk8/edit?tab=t.0#heading=h.g6xe3mid755x)

This document outlines the API changes and migration steps required to move from B42.12.3 to B42.13.

## 1. WeaponType enums

[Community] [BreakingChange] [LuaAPI] [Migration]

WeaponType enums have changed. There are no new enums, but their naming is different so it’s a 1:1 change. You will need to update to new names.

| b42.12.3               | b42.13                  |
| :--------------------- | :---------------------- |
| `WeaponType.barehands` | `WeaponType.UNARMED`    |
| `WeaponType.twohanded` | `WeaponType.TWO_HANDED` |
| `WeaponType.onehanded` | `WeaponType.ONE_HANDED` |
| `WeaponType.heavy`     | `WeaponType.HEAVY`      |
| `WeaponType.knife`     | `WeaponType.KNIFE`      |
| `WeaponType.spear`     | `WeaponType.SPEAR`      |
| `WeaponType.handgun`   | `WeaponType.HANDGUN`    |
| `WeaponType.firearm`   | `WeaponType.FIREARM`    |
| `WeaponType.throwing`  | `WeaponType.THROWING`   |
| `WeaponType.chainsaw`  | `WeaponType.CHAINSAW`   |

## 2. PropertyContainer

[Community] [JavaAPI] [BreakingChange]

PropertyContainer is widely used for handling properties for multiple objects (`IsoObject`, `IsoGridSquare`, `IsoSprite`). There are changes in the naming of methods of this class. Again this is a 1:1 change.

| b42.12.3 | b42.13   |
| :------- | :------- |
| `:Is`    | `:has`   |
| `:Val`   | `:get`   |
| `:Set`   | `:set`   |
| `:UnSet` | `:unset` |

## 3. Stats

[Community] [LuaAPI] [Migration]

Stats object used for manipulating player stats like panic for example works differently. Separate methods for handling particular stat have been replaced by a generic method for updating any of that stats.

So for example, instead of:

```lua
player:getStats():setPanic(0)
```

you now have:

```lua
player:getStats():set(CharacterStat.PANIC, 0)
```

Getter works in a similar manner.

```lua
local panic = player:getStats():get(CharacterStat.PANIC)
```

## 4. Traits

[Community] [Registry] [LuaAPI]

Here, enums are also introduced.

Instead of:

```lua
player:HasTrait("EagleEyed")
```

Now we have:

```lua
player:hasTrait(CharacterTrait.EAGLE_EYED)
```

Creating new traits is covered in the official guide. However one thing to mention is that it is worth keeping a global variable to the created trait in order to have the possibility to access it later.

Example, `registries.lua`:

```lua
MyModRegistries = MyModRegistries or {}
MyModRegistries.CharacterTraits = {}
MyModRegistries.CharacterTraits.GOAT = CharacterTrait.register("BWO:goat")
```

And now anywhere else in the code we can do this:

```lua
if player:hasTrait(MyModRegistries.CharacterTraits.GOAT) then
  -- your code here
end
```

## 5. ItemBodyLocation

[Community] [LuaAPI] [BreakingChange]

Multiple functions used string as a parameter for body location. Now body locations are `ItemBodyLocation` enums.

So for example, instead of:

```lua
player:setWornItem("Dress", item)
```

This has to be used:

```lua
player:setWornItem(ItemBodyLocation.DRESS, item)
```

Additionally, there is a handy way of converting old strings to new enums:

```lua
ItemBodyLocation.get(ResourceLocation.of("Dress"))
```

## 6. Player damage

[Community] [MP] [BehaviorChange]

Player damage is now handled server-side.

That means that various methods that impact player damage (health but also body part damage) will not work if called client-side. That applies to `Hit()` method called directly on the player object, but also all methods like `setScratched()`, `setCut()`, `generateDeepWound()` and many others will not work.

To fix this you will need to call these methods server-side by calling them from the client using `sendClientCommand`.
