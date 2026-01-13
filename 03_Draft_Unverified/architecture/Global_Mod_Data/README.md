# Project Z Documentation

This repository contains comprehensive technical documentation for **Project Z**, with a focus on **Global ModData architecture** and safe implementation patterns for the **Project Zomboid** modding framework (Build 42+).

## Overview

Project Z provides detailed guidance on implementing Global ModData correctly in both Single Player (SP) and Multiplayer (MP) environments, including:

- Single Player vs Multiplayer behavior differences
- Authority models and persistence strategies
- Network synchronization patterns
- SP/MP-safe implementation templates
- Common pitfalls and solutions

## Contents

### Architecture Documentation

#### Global ModData Guides

- **[Global_Mod_Data_SP_MP_Mapping.md](Global_Mod_Data_SP_MP_Mapping.md)** — Complete mapping of ModData behavior differences between Single Player and Multiplayer, including authority models, persistence paths, and common bugs.

- **[Gloabl_Mod_Data_SP_MP_Safe_Template.md](Gloabl_Mod_Data_SP_MP_Safe_Template.md)** — Production-grade SP/MP-safe ModData template with code examples and a minimal checklist for correct implementations.

- **[Global_Mod_Data_B41_B42.md](Global_Mod_Data_B41_B42.md)** — Version-specific changes and compatibility notes between Build 41 and Build 42.

- **[Global_Mod_Data_B42.md](Global_Mod_Data_B42.md)** — Build 42-specific ModData implementation details and updates.

- **[Global_Mod_Data_MP_Network_Issue.md](Global_Mod_Data_MP_Network_Issue.md)** — Multiplayer network-related issues and debugging strategies.

- **[Global_Mod_Data_MP_Network_Efficient.md](Global_Mod_Data_MP_Network_Efficient.md)** — Best practices for efficient network communication and bandwidth optimization in Multiplayer.

## Key Concepts

### Single Player vs Multiplayer Authority

**Single Player:**

- Unified client = server model
- Single Lua VM and shared ModData registry
- Changes are immediately visible everywhere
- `ModData.transmit()` is effectively a no-op

**Multiplayer:**

- Server-only authority
- Separate client and server Lua VMs
- Clients never see server ModData unless explicitly transmitted
- Requires explicit request → validate → transmit workflow

### Critical Rule

> **If it must survive restart or resist cheating, it must be written on the server and saved with `ModData.add()`—never from the client.**

### Quick Decision Table

| Goal                 | SP Approach     | MP-Correct Approach    |
| -------------------- | --------------- | ---------------------- |
| Persist global state | `ModData.add()` | Server `ModData.add()` |
| Update UI            | Read ModData    | Request + transmit     |
| Admin-only changes   | Direct write    | `sendClientCommand()`  |
| Frequent updates     | OK              | Avoid ModData          |
| Save on exit         | Automatic       | Server only            |

## Common Pitfalls

1. **"Works in SP, breaks in MP after restart"** — Client-side `ModData.add()` never persists to server save
2. **"Client sees nil ModData"** — Missing `ModData.request()` or `ModData.transmit()`
3. **"Everyone can request admin data"** — No access control on `ModData.request()` (use `sendClientCommand` instead)
4. **"Transmit but data not saved"** — Using `ModData.transmit()` instead of `ModData.add()`

## Getting Started

1. Read **[Global_Mod_Data_SP_MP_Mapping.md](Global_Mod_Data_SP_MP_Mapping.md)** to understand the authority model
2. Review **[Gloabl_Mod_Data_SP_MP_Safe_Template.md](Gloabl_Mod_Data_SP_MP_Safe_Template.md)** for a working implementation template
3. Use the minimal checklist provided in the template for every implementation

## License

MIT License — see [LICENSE](LICENSE) for details.

Copyright © 2026 escapepz

## Contributing

For improvements or corrections to this documentation, please refer to the repository guidelines.
