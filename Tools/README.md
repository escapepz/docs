# PDF to Markdown Extraction Pipeline

Converts PDF documents to clean, readable Markdown using semantic text extraction.

## Overview

This pipeline extracts PDFs via **plain text** (reading order), not HTML (visual layout).

**Why this matters:**
- PDFs store visual layout, not semantic structure
- HTML extraction from PDFs produces fragmented, positioned glyphs
- Plain text extraction preserves reading order and text continuity
- Result: Markdown that is readable, maintainable, and correct

## Installation

```bash
npm install
```

Installs node-poppler v9.1.0 and Poppler binaries (Windows) or requires system installation (Linux/macOS).

### Platform Requirements

**Windows**: Automatic via `node-poppler-win32`

**Linux (Debian/Ubuntu)**:
```bash
sudo apt-get install poppler-utils
```

**macOS**:
```bash
brew install poppler
```

## Pipeline

```
PDF → Plain Text (extract-text.js) → Markdown (text-to-md.js)
```

## Scripts

### extract-text.js

Extracts plain text from PDFs in reading order.

**Key feature**: Disables layout preservation, preserving semantic structure instead of visual layout.

```bash
# Single file
node extract-text.js document.pdf

# Batch extract all PDFs in directory
node extract-text.js --batch ./pdf-directory
```

**Output**: `document.txt` with clean, linear text.

### text-to-md.js

Converts plain text to Markdown with minimal transformation.

**Key feature**: Intelligently detects code blocks, preserves structure.

```bash
# Single file
node text-to-md.js document.txt

# Batch convert all text files in directory
node text-to-md.js --batch ./text-directory
```

**Output**: `document.md` with proper Markdown formatting.

## Complete Pipeline

### One-command extraction

```bash
# Windows
extract-all.bat path/to/pdf-directory

# Linux/macOS
bash extract-all.sh path/to/pdf-directory
```

This runs both steps:
1. PDF → Text
2. Text → Markdown

### Manual pipeline

```bash
# Step 1: Extract text
node extract-text.js --batch ./source_files

# Step 2: Convert to Markdown
node text-to-md.js --batch ./source_files
```

Output files appear in the same directory:
- `document.pdf` → `document.txt` → `document.md`

## Output Quality

Expected Markdown:

✅ **Correct reading order**
✅ **Preserved paragraphs**
✅ **Contiguous code blocks**
✅ **Intact list structures**
✅ **Proper heading hierarchy**

Example:
```lua
function ISPlaceTrap:new(character, weapon)
    local o = ISBaseTimedAction.new(self, character)
    o.square = character:getCurrentSquare()
    o.weapon = weapon
    o.maxTime = o:getDuration()
    return o
end
```

## Limitations and Manual Cleanup

The pipeline produces **correct structure**, but may require:

- Adjusting list formatting in complex documents
- Splitting merged paragraphs (rare)
- Verifying table layouts (if present)
- Adding section markers as needed

**Typical**: <5 minutes per 50-page document.

## Why NOT HTML extraction

Do **not** use:
- `pdfToHtml` for Markdown conversion
- HTML-to-Markdown converters on PDF HTML
- Visual layout reconstruction heuristics

These approaches fail because:
- PDF HTML contains absolute-positioned glyphs
- Text is fragmented: `C haracterTrait` instead of `CharacterTrait`
- Structure is destroyed and unrecoverable
- No post-processing can fix broken source structure

## Dependencies

- **node-poppler** v9.1.0 - Poppler wrapper for Node.js
- **Poppler** - PDF processing library (installed automatically on Windows, requires system install on Linux/macOS)

## License

MIT
