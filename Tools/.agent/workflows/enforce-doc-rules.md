---
description: Enforce correct documentation standards (Style Guide) including typography, structure, normative language, and provenance tags.
---

1. Read the target document.

2. **Enforce Emphasis & Typography (Mandatory):**
   - **Bold (`**text**`)**: Use ONLY for hard requirements, security/anti-cheat, load-order, breaking changes, and "must/must not".
     - *Prohibited*: Function names, file paths, IDs, variables.
   - **Italic (`*text*`)**: Use for soft notes, non-normative clarification.
   - **Underscores (`_text_`)**: **STRICTLY PROHIBITED**. Replace with asterisks `*` or `**`.
   - **Backticks (``` `text` ```)**: **MANDATORY** for function names, classes, files, paths, registry IDs, and commands.

3. **Enforce Structural Conventions:**
   - **Headings**: Use sentence case. NO bold inside headings. No code in headings unless absolutely necessary.
   - **Lists**: Use hyphens `-`.

4. **Enforce Normative Language:**
   - `must` / `must not`: Mandatory/Prohibited.
   - `should`: Strong recommendation.
   - `may`: Optional.
   - `will`: Guaranteed behavior.
   - Do not mix these meanings.

5. **Apply Annotation Keys (Tagging System):**
   - For each major section (or header), select **2–4 keys** maximum from the following:

   **Core Provenance & Trust Level**
   * `[Official]` – Sourced from TIS/HelpDocs.
   * `[Decompiled]` – From Java bytecode.
   * `[Community]` – Community guides/wiki.
   * `[Unofficial]` – Reverse engineered/Not endorsed.
   * `[Draft]` – In-progress.
   * `[Unverified]` – Not validated.
   * `[Speculative]` – Inferred.

   **Versioning & Compatibility**
   * `[B41]`, `[B42]`, `[B42.13+]` (Post-42.13 registries).
   * `[MP]` (Multiplayer), `[SP]` (Singleplayer).
   * `[Client]`, `[Server]`, `[Shared]`.

   **API & Scope**
   * `[LuaAPI]`, `[JavaAPI]`.
   * `[TimedAction]`, `[Inventory]`, `[Sync]`, `[AntiCheat]`.
   * `[Registry]`, `[Command]`, `[Event]`.

   **Risk & Stability**
   * `[BreakingChange]`, `[BehaviorChange]`.
   * `[Unsafe]` (Desync/Corruption risk), `[ExploitVector]`, `[Performance]`.

   **Intent**
   * `[Reference]`, `[Guide]`, `[Example]`, `[BestPractice]`, `[AntiPattern]`, `[Migration]`.

   **Project/Internal**
   * `[PZ-Strict]`, `[ModInterop]`, `[TSTL]`, `[Types]`, `[Tooling]`.

   - **Formatting**: Insert tags immediately after the section header.
     Example:
     ```md
     ## Timed Action `complete()` Execution
     [Official] [B42.13+] [Server] [AntiCheat]
     ```

6. Ensure no content is removed unless strictly necessary for formatting/compliance.
