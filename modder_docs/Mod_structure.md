Below is a **professional, Markdown-formatted document** based on the canonical **Mod structure** page from the Project Zomboid Wiki. It is suitable for inclusion in a repository (e.g., **README.md**, **Mod_Structure.md**) or documentation system.

---

# Project Zomboid Mod Structure

This document describes the file and folder structure required for creating mods compatible with Project Zomboid Build 42 and later. The structure determines how the game detects, loads, and manages mod content. (Based on the official PZWiki *Mod structure* reference.)

---

## Overview

Project Zomboid mods are recognized in specific folders under the user’s Zomboid directory:

* **`Zomboid/mods/`**
  For manually installed mods (not recommended for development).

* **`Zomboid/Workshop/`**
  Used for development and uploading mods to the Steam Workshop. A Workshop mod has a specific folder layout that the in-game uploader expects.

**Important:** Do not work directly inside workspace folders created by the game when downloading Workshop mods, as they may conflict with your development folder.

---

## Root Layout (Workshop Upload Folder)

```
Zomboid/Workshop/MyMod/
├── Contents/
│   └── mods/
│       └── MyMod1/
│       │   ├── common/          # Mandatory
│       │   │   └── media/
│       │   │       └── ...
│       │   ├── 42/              # Version folder for Build 42.x
│       │   │   ├── media/
│       │   │   │   └── ...
│       │   │   ├── mod.info
│       │   │   └── poster.png
│       │   ├── 42.1/            # Optional additional version folders
│       │   │   └── ...
│       │   └── ...
│       └── OtherMod/
└── workshop.txt
```

**Key points:**

* The **`Contents/mods/`** directory contains all individual mod definitions.
* A mod may include multiple version folders (e.g., `42/`, `42.1/`).
* **`common/`** is required even if it is empty; otherwise the mod is not detected.
* The top-level folder (e.g., `MyMod`) can also hold development-only files that should not be uploaded (e.g., documentation, `.git` folder). These are ignored by the game.

---

## Versioning Folders

Mods should use a versioned folder hierarchy to support compatibility with different game builds:

```
modFolder/
├── common/
├── 42/
├── 42.12/
├── 42.X.Y/
```

* Version folders correspond to **major and minor build numbers** (e.g., `42`, `42.12`).
* The loader resolution order is:

  1. `common/`
  2. Version folder closest to the current game version.

---

## Folder and File Requirements

### `common/`

* Must always be present.
* Typically contains shared assets such as models, textures, or sounds that **are used across multiple version folders**.

### Version Folders (e.g., `42/`, `42.1/`)

Each version folder represents a mod variant for a specific game build:

* **`media/`**
  Contains assets such as scripts, textures, animations, sounds, etc.

* **`mod.info`**
  Required metadata file defining the mod’s identity and load order.

* **`poster.png`**
  Thumbnail shown in the in-game mods UI.

---

## `media` Substructure

Within `media/`, different asset types for a mod are divided into specific subfolders. This structure largely mirrors the game’s own asset structure:

```
media/
├── anims_X/
├── lua/
│   ├── client/
│   ├── server/
│   └── shared/
├── models_X/
├── sounds/
├── textures/
├── ui/
└── scripts/
```

**Assets categories:**

* **Animations (`anims_X`)** — Animation files.
* **Lua (`lua/`)** — Lua scripts for client, server, or shared logic.
* **Models (`models_X`)** — 3D models for objects.
* **Sounds (`sounds`)** — Audio files in `.ogg` or `.wav`.
* **Textures (`textures`)** — PNG textures.
* **UI (`ui`)** — Images for custom UI elements.
* **Scripts (`scripts`)** — Definitions for items, objects, etc.

---

## Example (Windows)

```
%UserProfile%/
└── Zomboid/
    └── Workshop/
        └── MyMod/
            ├── Contents/
            │   └── mods/
            │       └── MyMod1/
            │           ├── common/
            │           │   └── media/
            │           │       ├── textures/
            │           │       └── sounds/
            │           ├── 42/
            │           │   ├── media/
            │           │   │   └── lua/
            │           │   ├── mod.info
            │           │   └── poster.png
            │           └── 42.1/
            │               └── ...
            ├── workshop.txt
            └── preview.png
```

---

## Additional Notes

* **Mod IDs must be unique.** Conflicts can prevent mods from loading.
* When testing locally, workspace mods may clash with workshop subscriptions; ensure only one copy is active.
* The **`mod.info`** file must be correctly formatted and located in the version folder for the mod to appear in the game’s mod list.

---
