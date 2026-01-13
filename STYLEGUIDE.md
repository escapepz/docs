# Project Zomboid Documentation Style Guide

**Scope:** B42+, Multiplayer, Lua / Java API, Modding & Migration Docs

---

## 1. Purpose & Audience

This guide defines **mandatory conventions** for writing, formatting, and annotating technical documentation related to:

- Lua API
- Timed Actions
- Inventory / registry systems
- Multiplayer & anti-cheat behavior
- Migration between versions (B41 → B42+)

**Primary audience:**
Advanced modders, server operators, and tooling authors.

---

## 2. Emphasis & Typography (Normative)

### 2.1 Bold — `**text**` (MANDATORY RULES)

**Use bold ONLY for:**

- **Hard requirements**
- **Security or anti-cheat guarantees**
- **Load-order constraints**
- **Version-breaking changes**
- **Must / must not statements**

**Examples (correct):**

```md
This file **must** be named `registries.lua`.
```

```md
All inventory items **must be created on the server side**.
```

```md
This behavior **will break existing mods**.
```

**Prohibited uses:**

- Function names
- File paths
- Registry IDs
- Variable names

(Use backticks instead.)

---

### 2.2 Italic — `*text*` (LIMITED USE)

**Use italics ONLY for:**

- Soft notes
- Conditional behavior
- Non-normative clarification
- Contextual emphasis

**Examples:**

```md
_This function may also be executed in singleplayer._
```

```md
_This value is ignored when TimedActionInstant is enabled._
```

**Do NOT use italics for:**

- Requirements
- Warnings
- API names

---

### 2.3 Underscores `_ _` (DISALLOWED)

**Rule:**
Do **not** use `_italic_` or `__bold__`.

**Reason:**

- Conflicts with:
  - Lua identifiers
  - Registry keys
  - Constants

- Reduces readability in technical contexts

**Enforced Standard:**

| Purpose             | Allowed    |
| ------------------- | ---------- |
| Bold                | `**text**` |
| Italic              | `*text*`   |
| Underscore emphasis | ❌         |

---

## 3. Code, Identifiers & Paths (STRICT)

### 3.1 Backticks — `` `code` ``

**Always use backticks for:**

- Function names
- Class names
- File names
- Paths
- Registry IDs
- Commands

**Examples:**

```md
Use `sendClientCommand` to invoke the handler.
```

```md
The file must be located at `media/registries.lua`.
```

```md
Register the ID using `ItemType.register`.
```

---

### 3.2 Code Blocks

- Always specify language when applicable
- Use fenced blocks only

````md
```lua
function ISPlaceTrap:getDuration()
    return 50
end
```
````

````

---

## 4. Structural Conventions

### 4.1 Headings

- Use sentence case
- Do not embed code in headings unless necessary
- No bold inside headings

**Correct:**

```md
## Timed Action execution model
````

**Incorrect:**

```md
## **TimedAction** Execution
```

---

### 4.2 Lists

- Use hyphens `-`
- Keep items concise
- Avoid full paragraphs in lists

---

## 5. Annotation Keys (Tagging System)

Use **bracketed keys**, quoted with backticks when referenced inline.

### 5.1 Allowed Categories

> [!NOTE]
> For a complete list of valid keys and their definitions, see [Document_Annotation_Keys.md](Tools/sub_docs/Document_Annotation_Keys.md).

- Provenance
- Versioning
- Execution context
- Risk / stability
- Intent

**Example (section header):**

```md
## Timed Action `complete()` Execution

[Official] [B42.13+] [Server] [AntiCheat]
```

**Rule:**
Use **no more than 4 keys per section**.

---

## 6. Normative Language

### 6.1 Enforced Vocabulary

| Term         | Meaning                   |
| ------------ | ------------------------- |
| **must**     | Mandatory, enforced       |
| **must not** | Prohibited                |
| **should**   | Strong recommendation     |
| **may**      | Optional                  |
| **will**     | Guaranteed behavior       |
| **can**      | Capability, not guarantee |

**Do not mix meanings.**

---

## 7. Warnings & Breaking Changes

### 7.1 Breaking Change Pattern

```md
**Breaking change:**  
This behavior will invalidate client-side item creation.
```

### 7.2 Security / Anti-Cheat Pattern

```md
**Security requirement:**  
All inventory mutations must occur on the server.
```

---

## 8. Versioning & Migration Sections

- Always name the target version
- Explicitly state what breaks
- Provide replacement patterns

**Example:**

```md
## Migration from B41 to B42.13+

**Breaking change:** `Type` has been renamed to `ItemType`.

**Action required:**  
Register the type using `ItemType.register` in `registries.lua`.
```

---

## 9. Consistency Rules (ENFORCEABLE)

- One term → one meaning
- One API name → one spelling
- No mixed emphasis styles
- No emphasis on identifiers
- No underscores for emphasis

---

## 10. Recommended Tooling (Optional)

- Markdown lint with custom rules:
  - Disallow `_italic_`
  - Disallow bolded backticked text
  - Limit tag count per header

- Pre-commit checks for:
  - Version keys
  - `[Official]` vs `[Unofficial]`

---

## 11. Canonical Example (Fully Compliant)

```md
## Inventory Item Creation

[Official] [B42.13+] [Server] [AntiCheat]

All inventory items **must be created on the server side**.

Client-side creation _may appear to succeed_, but such items will be
deleted after relogin.

Use `sendClientCommand` or a Timed Action `complete()` method to
create and synchronise items correctly.
```
