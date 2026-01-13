# Project Zomboid Documentation Archive (The LUA Part)

Central repository for Project Zomboid Lua technical documentation, improvements, and documentation tools.

## Directory Structure

### [01_Official](01_Official/README.md)

Official documentation sourced directly from **The Indie Stone**, internal tooling, or decompiled artifacts verified against the game's source code.

- **Normative**: Information here takes precedence in cases of conflict.
- Contains Migration Guides (B41 → B42) and API documentation.

> [!CAUTION]
> Content generated from `Source_Files` reflects the state at the time of file creation. These documents are snapshots and may become outdated (expired) compared to future branch updates.

### [02_Community_Unofficial](02_Community_Unofficial/README.md)

Unofficial community-maintained documentation, guides, and wiki exports.

- **Speculative**: May contain observations and best practices that differ from official sources.
- Includes Mod Structure, Optimization guides, and general wiki articles.

#### Included Submodules

This repository incorporates the following community repositories as submodules:

- **PZ-Mod---Doc** (`02_Community_Unofficial/Common/PZ-Mod---Doc`)
  - Upstream: [https://github.com/MrBounty/PZ-Mod---Doc.git](https://github.com/MrBounty/PZ-Mod---Doc.git)
- **PZModdingGuides** (`02_Community_Unofficial/Common/PZModdingGuides`)
  - Upstream: [https://github.com/demiurgeQuantified/PZModdingGuides.git](https://github.com/demiurgeQuantified/PZModdingGuides.git)

> [!CAUTION]
>
> 1. Content generated from `Source_Files` reflects the state at the time of file creation and may become outdated.
> 2. Submodule data relies entirely on **upstream** updates. You must pull latest changes to keep them in sync.

### [Tools](Tools/README.md)

Utility scripts for maintaining and generating documentation.

- **PDF Extraction**: Pipeline for converting official PDF documentation to Markdown.
- **Automation**: Scripts for content extraction and formatting.

## Usage

### Installation

To clone the repository along with all community submodules:

```bash
git clone --recurse-submodules https://github.com/escapepz/docs
```

### Updating

To pull the latest changes and ensure submodules are synced:

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

### NPM Scripts

For convenience, these commands are aliased in `package.json`:

- `npm run update`: Updates the repository and all submodules.

## License

MIT License — see [LICENSE](LICENSE) for details.

Copyright © 2026 escapepz
