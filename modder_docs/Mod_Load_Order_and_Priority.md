Below is the **authoritative load-order and resolution model** used by Project Zomboid when mods exist in **all three locations**. This reflects current Build 42 behavior and is critical for avoiding duplicate loads, ghost mods, and MP desync.

---

## 1. Mod Discovery Order (Where the Game Looks)

At startup, Project Zomboid scans mod sources in this order:

1. **Steam Workshop subscriptions**

   ```
   Steam/steamapps/workshop/content/108600/
   ```
2. **Local Workshop development folder**

   ```
   Zomboid/Workshop/
   ```
3. **Legacy local mods folder**

   ```
   Zomboid/mods/
   ```

All discovered mods are added to the **global mod registry**.

Important:

* Discovery ≠ activation
* All three locations are merged into a **single mod namespace**

---

## 2. Mod Identity Resolution (Critical)

Each mod is identified **only** by:

```
mod.info → id=
```

Not by:

* Folder name
* Location
* Workshop ID

### Collision Rule

If **multiple mods share the same `id`**, the game will:

* Keep **only one**
* Prefer the **highest-priority source**
* Silently ignore the others

### Source Priority (Highest → Lowest)

1. **Steam Workshop**
2. **Zomboid/Workshop**
3. **Zomboid/mods**

This means:

* A subscribed Workshop mod **overrides** a local dev copy with the same `id`
* A local dev mod overrides a legacy `Zomboid/mods` copy
* There is **no warning or error** in logs

---

## 3. Version Folder Resolution (Inside One Mod)

After a mod is selected, the loader resolves version folders:

Resolution order:

1. `common/`
2. Best matching version folder (e.g. `42.13`)
3. Fallback to nearest compatible folder (e.g. `42`, then older)

This resolution happens **after** the mod source is chosen.

---

## 4. Activation Rules (What Actually Loads)

A mod only loads if:

* It appears in the **Mods UI**
* It is **enabled in the save**
* In MP: it is **required by the server**

### Singleplayer

* Uses local mod list
* Workshop + local mods can mix

### Multiplayer (Server Authority)

* Server sends **authoritative mod list**
* Client-only mods are ignored
* Mismatched mod sets → kick or desync

---

## 5. Common Failure Scenarios

### 1. “My changes don’t apply”

Cause:

* You are editing `Zomboid/mods`
* Steam Workshop version with same `id` is loaded instead

Fix:

* Unsubscribe from the Workshop version
* Or change the `id` in `mod.info`

---

### 2. Duplicate mod appears once

Cause:

* Same `id` in multiple locations

Expected behavior:

* Only one instance is kept
* Lower-priority copies are discarded silently

---

### 3. MP desync or instant kick

Cause:

* Client has extra mods
* Different mod versions under same `id`

Fix:

* Ensure server and client resolve to **identical source + version**

---

## 6. Best-Practice Rules (Strongly Recommended)

### Development

* Use **`Zomboid/Workshop/`**
* Never test serious mods from `Zomboid/mods`
* Keep **unique `id`s** for dev vs release

Example:

```
MyMod_Dev
MyMod
```

---

### Release

* Publish only from `Zomboid/Workshop`
* Delete or archive legacy `Zomboid/mods` copies
* Never keep both subscribed and dev versions active

---

### Debugging Checklist

If behavior is unexpected:

1. Check `mod.info → id`
2. Search logs for:

   ```
   loading mod
   ```
3. Unsubscribe from Workshop duplicates
4. Restart the game (hot reload does not clear registry cache)

---

## 7. One-Line Mental Model

> **Mod ID wins over folder.
> Workshop wins over local.
> Server wins over client.**
