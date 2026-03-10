# Procedural Loot Distribution Guide for Modders

## Overview

The procedural distribution system controls what items spawn in containers throughout the game world. When containers are loaded or respawn, the loot system generates items based on distribution tables, allowing you to add custom items and control their spawn rates.

Each distribution has a set amount of **rolls**, and each item entry has a **chance value** (which is neither a weight nor a percentage). Every item entry in a distribution will be rolled the amount of times the distribution specifies, with spawn chance modified by criteria such as sandbox loot spawn settings and zombie population.

### Key Concept

When loot spawns in a container, the event **OnFillContainer** triggers, allowing you to modify or add items to containers before they appear to the player.

---

## Distribution Structure

Vanilla loot distributions are defined in:

```
ProjectZomboid/
└── media/
    └── lua/
        └── server/
            └── Items/
                └── ProceduralDistributions.lua
```

Each distribution is added to the table `ProceduralDistributions.list` in the following form:

```lua
ProceduralDistributions.list = {
    distributionName = {
        -- Optional tags
        isShop = true,
        ignoreZombieDensity = false,
        
        rolls = 3,  -- number of times items are rolled
        
        items = {
            "Item1", 10,  -- item name, then chance value
            "Item2", 5,
            "Item3", 3,
        },
        
        junk = {  -- ignores zombie density, 1.4x chance multiplier
            rolls = 1,
            items = {
                "JunkItem1", 10,
                "JunkItem2", 5,
            }
        }
    },
    anotherDistribution = {
        ...
    }
}
```

### Real Example

```lua
ProceduralDistributions.list = {
    ...
    ComicStoreShelfComics = {
        isShop = true,
        rolls = 4,
        items = {
            "ComicBook_Retail", 50,
            "ComicBook_Retail", 20,
            "ComicBook_Retail", 20,
            "ComicBook_Retail", 10,
            "ComicBook_Retail", 10,
        },
        junk = {
            rolls = 1,
            items = {
                "ComicBook_Retail", 10,
            }
        }
    },
    ...
}
```

---

## Understanding Chance Values

**IMPORTANT**: Chance values are **NOT weights** and **NOT percentages**!

To choose your chance values, base yourself on **existing vanilla distributions and vanilla item chances**. Look at similar items in the game and match their chance values.

For example:
- Common items: 50-100
- Uncommon items: 10-30
- Rare items: 2-10
- Very rare items: 0.5-2
- Extremely rare items: 0.001-0.5

The game uses these values internally to calculate spawn probability based on multiple factors including zombie population and sandbox settings.

---

## Distribution Tags

Beyond the `rolls` tag, you can add the following tags to modify how items spawn:

### Core Tags

- **ignoreZombieDensity** - Ignores zombie density impact on spawn chance
- **isShop** - When set to true, prevents several negative conditions:
  - Items won't become stashes (loot containers)
  - DrainableComboItem won't get random uses
  - HandWeapon won't have lower condition
  - Items won't get reduced condition/sharpness/head condition
  - Bags won't spawn with items inside
  - Food won't be cooked/burnt

### Condition Tags

- **isWorn** - Items spawn with lower condition:
  - HandWeapon: reduced condition
  - Clothing: reduced condition, 25% chance to be dirty, 1% chance to be bloody, 25% chance to have holes
  - Items with head/sharpness condition: reduced values

- **isTrash** - Items spawn heavily degraded:
  - HandWeapon: reduced condition
  - Clothing: reduced condition, 25% chance to be wet, 95% chance to be dirty, 10% chance to be bloody, 75% chance to have holes
  - DrainableComboItem: reduced uses
  - Food: 50% cooked/burnt, 75% rotten or aged

- **isRotten** - Food only: 75% chance rotten or increased age

- **canBurn** - Food can be burnt (25% chance) or cooked

### Specialized Tags

- **stashChance** - Chance for container to be a stash
- **bags** - Adds bags to container (unclear behavior, use with caution)
- **maxMap** (integer) - Limits same item to max amount
- **onlyOne** - DEPRECATED (found in some distributions but no longer used)

---

## How to Add Items to Distributions

### Bad Method (DON'T DO THIS)

```lua
table.insert(ProceduralDistributions.list["DistributionName"].items, "YourItem")
table.insert(ProceduralDistributions.list["DistributionName"].items, 0.5)
```

This method is inefficient and hard to maintain.

### Good Method (RECOMMENDED)

Create a local table with your distributions, then insert them all at once using a loop:

```lua
-- File: mymod/media/lua/server/Items/MyModDistributions.lua

local myDistributions = {
    GigamartPots = {
        items = {
            "GlassWine", 6,
            "Fork", 10,
            "Mug", 10,
            "Whetstone", 10,
            "Teacup", 10,
            "CDplayer", 10,
        },
        junk = {
            "Mov_CoffeeMaker", 4,
            "HandTorch", 8,
        },
    },
    
    LibraryMilitaryHistory = {
        items = {
            "Book_Music", 20,
            "Book_Music", 10,
            "Doodle", 0.001,
        },
    },
    
    MechanicShelfElectric = {
        items = {
            "Battery", 10,
            "BatteryBox", 10,
            "Brochure", 2,
            "Broom", 10,
            "Bucket", 10,
        },
    },
}

-- Performance optimization: cache table references
local ProceduralDistributions_list = ProceduralDistributions.list
local table_insert = table.insert

local function insertInDistribution(distrib)
    -- Iterate through each distribution
    for k, v in pairs(distrib) do
        local ProceduralDistributions_list_k = ProceduralDistributions_list[k]

        -- Insert items
        local items = v.items
        local ProceduralDistributions_list_k_items = ProceduralDistributions_list_k.items
        if items then
            for i = 1, #items do
                table_insert(ProceduralDistributions_list_k_items, items[i])
            end
        end

        -- Insert junk
        local junk = v.junk
        local ProceduralDistributions_list_k_junk = ProceduralDistributions_list_k.junk
        if junk then
            for i = 1, #junk do
                table_insert(ProceduralDistributions_list_k_junk, junk[i])
            end
        end
    end
end

insertInDistribution(myDistributions)
```

### Module Prefixes

If your item is defined in a different module than Base, you must include the module name:

```lua
-- Item "MyItem" in "MyMod" module
"MyMod.MyItem", 10,

-- Item "Sword" in "ISNOTXP" module
"ISNOTXP.Sword", 15,
```

---

## Reference Tables (ClutterTables)

Some vanilla distributions reference generic items defined in ClutterTables. These files contain reusable item collections:

```
lua/
└── server/
    ├── Items/
    │   ├── Distribution_BinJunk.lua
    │   ├── Distribution_ClosetJunk.lua
    │   ├── Distribution_CounterJunk.lua
    │   ├── Distribution_DeskJunk.lua
    │   ├── Distribution_ShelfJunk.lua
    │   └── Distribution_SideTableJunk.lua
    └── Vehicles/
        ├── VehicleDistribution_GloveBoxJunk.lua
        ├── VehicleDistribution_SeatJunk.lua
        └── VehicleDistribution_TrunkJunk.lua
```

Backpacks and containers are defined in:

```
lua/
└── server/
    └── Items/
        └── Distribution_BagsAndContainers.lua
```

You can add items to these tables using the same method as above.

---

## Rooms and Containers (Distributions)

While ProceduralDistributions defines the items, the `Distributions` table maps rooms and containers to these distributions.

**CRITICAL**: Use proper nested structure:

```lua
Distributions = Distributions or {}

local distributionTable = {
    roomName = {
        isShop = true,  -- optional
        
        containerType = {
            procedural = true,
            procList = {
                {name="DistributionKey", min=0, max=99},
            }
        }
    }
}

-- Merge with existing distributions
for room, containers in pairs(distributionTable) do
    Distributions[room] = Distributions[room] or {}
    for container, config in pairs(containers) do
        Distributions[room][container] = config
    end
end
```

### Structure Rules

- **First level**: Room names (e.g., `stonewarehouse`, `foresthut`)
- **Second level**: Container types (e.g., `metal_shelves`, `crate`, `knifeshelf`)
- Do NOT flatten these into single keys like `stonewarehouse_metal_shelves`

### Room/Container Mapping Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Key from ProceduralDistributions.list |
| `min` | Number | Minimum zoom level (0-99) |
| `max` | Number | Maximum zoom level (0-99) |
| `weightChance` | Number | Selection weight (higher = more likely) |
| `forceForTiles` | String | Semicolon-separated tile IDs to force selection |
| `forceForZones` | String | Semicolon-separated zone types to force selection |

---

## Testing Your Distributions

### Using LootZed

In-game, you can use the **LootZed** debug tool to:
- Check distribution lists for any container
- List all items in a distribution
- View spawn chances for each item
- Verify your changes are working

### Common Issues

1. **Items don't appear**
   - Check that the distribution key exists in ProceduralDistributions.list
   - Verify room and container names match your definitions
   - Ensure item names are spelled correctly (case-sensitive)
   - Check that the room/container mapping exists in Distributions

2. **Wrong item counts**
   - Verify `rolls` value is set correctly
   - Check that chance values aren't set too low
   - Confirm zombie density settings aren't affecting spawn

3. **Items have wrong condition**
   - Check isShop, isWorn, isTrash, isRotten tags
   - Verify the distribution isn't marked as a stash

---

## Container Bloating Problem

**WARNING**: Adding many items to a single distribution list increases the mean amount of items in that container.

Popular mods that add many items (large gun mods, clothing packs, music mods) can bloat containers by:
- Adding multiple small items that accumulate
- Ignoring container encumbrance limits
- Creating unequal loot distribution between container types

### Solutions

#### 1. Item Variants (BEST)

Create one item with multiple variants instead of dozens of separate items:

```lua
-- Instead of 100 separate card items:
-- Card_Spades, Card_Hearts, Card_Diamonds, Card_Clubs... etc

-- Create ONE item with dynamic properties:
ProceduralDistributions.list.GameCards = {
    rolls = 2,
    items = {
        "GameCard", 50,  -- Single item
    }
}

-- Then use OnFillContainer to randomly set variant:
local function onFillContainer(container)
    for i = 0, container:getItemCount() - 1 do
        local item = container:getItemByIndex(i)
        if item:getType() == "GameCard" then
            local cardType = {"Spades", "Hearts", "Diamonds", "Clubs"}[ZombRand(1, 5)]
            item:setTexture("item_" .. cardType)
            item:setName("Game Card - " .. cardType)
        end
    end
end
```

#### 2. Dummy Items

Create dummy items and use OnFillContainer to replace them:

```lua
-- In distribution:
items = {
    "DummyCard", 50,
}

-- In OnFillContainer:
local cardTypes = {
    "Card_Spades", "Card_Hearts", "Card_Diamonds", "Card_Clubs"
}

local function onFillContainer(container)
    for i = 0, container:getItemCount() - 1 do
        local item = container:getItemByIndex(i)
        if item:getType() == "DummyCard" then
            local randomCard = cardTypes[ZombRand(1, #cardTypes + 1)]
            container:Remove(item)
            container:addItem(randomCard)
        end
    end
end
```

#### 3. Accept Bloat (NOT RECOMMENDED)

Decrease spawn chances for all your items, but this creates balance issues where your items spawn at different rates than similar vanilla items.

---

## Complete Example

### Step 1: Create Distribution File

```lua
-- File: mymod/media/lua/server/Items/MyModDistributions.lua

local myDistributions = {
    CustomWeaponShop = {
        isShop = true,
        items = {
            "Machete", 40,
            "Axe", 30,
            "Hammer", 20,
            "Crowbar", 10,
        }
    },
    
    CustomRareGuns = {
        isShop = true,
        items = {
            "AssaultRifle2", 5,
            "Revolver_Long", 3,
            "Shotgun2", 4,
            "Bullets9mmBox", 20,
        }
    },
}

-- Insert into ProceduralDistributions
local ProceduralDistributions_list = ProceduralDistributions.list
local table_insert = table.insert

local function insertInDistribution(distrib)
    for k, v in pairs(distrib) do
        local ProceduralDistributions_list_k = ProceduralDistributions_list[k]
        local items = v.items
        local ProceduralDistributions_list_k_items = ProceduralDistributions_list_k.items
        if items then
            for i = 1, #items do
                table_insert(ProceduralDistributions_list_k_items, items[i])
            end
        end
    end
end

insertInDistribution(myDistributions)
```

### Step 2: Create Room/Container Mapping

```lua
-- File: mymod/media/lua/server/Items/MyModRooms.lua

Distributions = Distributions or {}

local distributionTable = {
    myweaponstore = {
        isShop = true,
        counter = {
            procedural = true,
            procList = {
                {name="CustomWeaponShop", min=0, max=99},
            }
        },
        shelves = {
            procedural = true,
            procList = {
                {name="CustomRareGuns", min=0, max=99, weightChance=100},
            }
        },
    },
}

-- Merge with existing distributions
for room, containers in pairs(distributionTable) do
    Distributions[room] = Distributions[room] or {}
    for container, config in pairs(containers) do
        Distributions[room][container] = config
    end
end
```

### Step 3: Create mod.info

```ini
[modinfo]
name=My Custom Distributions
description=Adds custom loot to new rooms
version=1.0
modID=MyCustomDistributions

dependencies=Base

[patchfile]
distribution=/server/Items/MyModDistributions.lua
distribution=/server/Items/MyModRooms.lua
```

---

## Summary

1. **Understand the system**: Rolls determine how many items are picked; chance values control probability
2. **Base chance values on vanilla**: Don't invent your own—use existing vanilla as reference
3. **Use local tables + loops**: Better than individual table.insert calls
4. **Proper nesting structure**: Room → Container → Config
5. **Prevent bloating**: Use item variants or dummy items instead of many separate entries
6. **Test with LootZed**: Verify distributions work correctly in-game
7. **Include module prefix**: For items from non-Base modules (e.g., "MyMod.MyItem")

