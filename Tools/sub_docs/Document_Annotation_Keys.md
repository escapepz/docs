# Annotation Keys (Tagging System)

## Core Provenance & Trust Level

* `[Official]` – Directly sourced from The Indie Stone or bundled game documentation
* `[Decompiled]` – Derived from decompiled Java bytecode
* `[Community]` – Community-authored guides, wiki content, forum posts
* `[Unofficial]` – Not endorsed; may rely on reverse engineering
* `[Draft]` – In-progress or incomplete documentation
* `[Unverified]` – Not yet validated against live builds
* `[Speculative]` – Inferred behavior; subject to change

---

## Versioning & Compatibility

* `[B41]` – Applies to Build 41
* `[B42]` – Applies to Build 42 (general)
* `[B42.13+]` – Requires registries / post-42.13 changes
* `[MP]` – Multiplayer-specific behavior
* `[SP]` – Singleplayer-only behavior
* `[Client]` – Client-side execution
* `[Server]` – Server-side execution
* `[Shared]` – Runs in both client and server contexts

---

## API & Technical Scope

* `[LuaAPI]` – Lua API usage
* `[JavaAPI]` – Java-side API or engine internals
* `[TimedAction]` – Timed Action architecture
* `[Inventory]` – Inventory item manipulation
* `[Sync]` – Network synchronisation concerns
* `[AntiCheat]` – Server validation / exploit prevention
* `[Registry]` – B42 registry system (`registries.lua`)
* `[Command]` – `sendClientCommand` / command handlers
* `[Event]` – Lua or Java event hooks

---

## Risk & Stability Indicators

* `[BreakingChange]` – Known to break older mods
* `[BehaviorChange]` – Same API, different runtime behavior
* `[Unsafe]` – Can desync, dupe, or corrupt state if misused
* `[ExploitVector]` – Relevant to cheating or abuse
* `[Performance]` – Has measurable performance impact

---

## Documentation Intent

* `[Reference]` – Factual, minimal interpretation
* `[Guide]` – Step-by-step instructional content
* `[Example]` – Demonstrative snippet or pattern
* `[BestPractice]` – Recommended approach
* `[AntiPattern]` – What **not** to do
* `[Migration]` – Upgrade path between versions
* `[Checklist]` – Validation or compliance list

---

## Project-Specific / Internal (Optional)

* `[PZ-Strict]` – Intended for strict or hardened servers
* `[ModInterop]` – Cross-mod compatibility notes
* `[TSTL]` – TypeScript-to-Lua integration
* `[Types]` – Typing / schema / interface concerns
* `[Tooling]` – Build scripts, linters, generators

---

### Recommendation

Use **2–4 keys per section maximum** to avoid annotation noise, for example:

```md
## Timed Action `complete()` Execution
[Official] [B42.13+] [Server] [AntiCheat]
```
