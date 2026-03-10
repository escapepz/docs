# Modding changelog (42.15)
[Official] [B42.15+] [Shared]

## Changelog
[Official] [B42.15+] [Shared]

- The format for storing translation files has been changed. Now it's `.json` files in UTF-8. All mods that have translation files **must** update them.

- Added support for translation `mod.info`. Now it's possible to add translation for the name and description of the mod. This translation **will** be loaded even if mod is disabled. Also fixed translation for `map.info`.

    > To add translation for `mod.info`, you **must** create a `Mod.json` file with translations for the name and description (check the mod example).

- Fixed bugs with connecting to servers with mods.

- Fixed a bug with mod folder detection. Now only 1 subfolder with `mod.info` is required. It can be a `common` or `VERSION` folder. Also fixed a bug with empty `common` / `VERSION` folders.

- Added support for Translation mods. This is a special kind of mod that contains ONLY translation files in the `media` directory (`.json` or `.txt` files in `media/lua/shared/Translate/`). With this kind of mod, it is possible to connect to any server (even to a server without mods). Check the mod example.

- Added `.glb` format for the file watcher (dynamic detection of changes in files).

- Fixed a bug with Workshop description ID duplication.

- Added support for a 512x512 preview image for Workshop items.

- Changed the `ModID` system (now it is in the format `MOD_ID` (like in 41), not `WORKSHOP_ID\MOD_ID`). - Added backward compatibility for `\MOD_ID` values (`require`, `incompatible`, `ActiveMods`, etc.), but we recommend updating the ID format in your mods.

- Fixed `WorkshopID` bug.

- Updated the Mod Info Panel in `ModManager`. Added mod source detection (`Mods`/`Workshop`/`Steam`).

- Changed allowed URLs in `mod.info`.

- Fixed a bug with filenames for poster/icon in `mod.info` on Linux (like `icon.png`).

---

## Migration guide
[Official] [B42.15+] [Migration] [BreakingChange]

### Updating translation files
[Official] [B42.15+] [Migration] [BreakingChange]

The format for storing translation files has been changed. Now it's `.json` files in UTF-8. All mods that have translation files **must** update translation files (old `.txt` translation files are **must not** be used as they are not supported).

#### How to update translation files
[Reference] [Guide]

- Convert files to UTF-8 encoding (if needed).
- Transfer data to `.json` format (manually or by script). Examples can be found in the game files or in the Example Translation Mod.

---

## Mod/Workshop IDs
[Official] [B42.15+] [Migration] [BreakingChange]

Changed the `ModID` system (now it is in the format `MOD_ID` (like in 41), not `WORKSHOP_ID\MOD_ID`). Added backward compatibility for `\MOD_ID` values (`require`, `incompatible`, `ActiveMods`, etc.), but you **should** update the ID format in your modifications.

### How to update
[Reference] [Guide]

In `require`, `incompatible`, `loadModAfter`, `loadModBefore`, you **must** update values. It **must** be just `PARAM=MOD_ID1,MOD_ID2,MOD_ID3,...`, WITHOUT `\` and WITHOUT `WORKSHOP_ID`.

In server settings, the parameter `Mods=` **must** be updated in the same way.

---

## Tips
[Official] [B42.15+] [BestPractice]

### How to change mod source priority (Workshop, Mods, Steam)
[Guide] [Shared]

For example, you have the same mod in 3 different folders: `.../Zomboid/mods/`, `.../Zomboid/Workshop/...` and `.../workshop/content/108600/...`). The game **will** load only 1 version of this mod because they have the same `MOD_ID`. By default, the game checks folders in this order: `workshop`, `steam`, `mods`. So, the version from the `Workshop` folder **will** be loaded.

You **can** change this order and remove some sources. To do this, you only need to add an argument `-modfolders mods,workshop,steam` when launching the game (like a debug arg). You **can** do it in Steam game options or you **can** create an app shortcut and add this argument in shortcut options (you **can** create multiple shortcuts with different options).

Examples:
- `-modfolders mods,workshop,steam`
- `-modfolders workshop,steam,mods`
- `-modfolders mods,workshop`
- `-modfolders workshop`
