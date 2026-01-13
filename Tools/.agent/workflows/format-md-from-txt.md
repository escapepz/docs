---
description: Format a raw Markdown file derived from a text source (e.g., via extract-text.js)
---

This workflow outlines the steps to clean up and format a raw Markdown file that was generated from a source text file (typically a PDF extraction).

1.  **Analyze Input Files**
    *   Read the raw `.md` file to understand its current state and identify artifacts.
    *   Read the source `.txt` file (usually in a `Source_Files` subdirectory) to establish the ground truth for content.

2.  **Rename File**
    *   Rename the `.md` file to use `snake_case` (replace spaces with underscores) to ensure file system compatibility and consistency.
    *   Example: `Project Zomboid API.md` -> `Project_Zomboid_API.md`.

3.  **Clean Up Artifacts**
    *   **Page Numbers**: Remove lines that contain only numbers (e.g., "1", "17") which are artifacts from PDF pagination.
    *   **Page Headers/Footers**: Remove repetitive headers or footers like "Contents", "Introduction" (if repeated at page breaks), or file names printed on pages.
    *   **Form Feeds**: Remove form feed characters (`^L` / `\f`) or "Page Break" markers.
    *   **Broken Lines**: Fix sentences that are broken across lines unnecessarily.

4.  **Format Content**
    *   **Headers**: Ensure section titles use proper Markdown headers (`#`, `##`, `###`).
    *   **Code Blocks**:
        *   Wrap code in triple backticks with the correct language identifier (e.g., ` ```lua `).
        *   Consolidate lines of code that were split during extraction.
        *   Remove redundant "Code piece X" labels or convert them into italicized comments/captions below the block.
    *   **Lists**: Ensure bullet points (`-` or `*`) and numbered lists are properly indented.

5.  **Verify Content**
    *   Compare the formatted Markdown against the source `.txt` file.
    *   Ensure no text was accidentally deleted during cleanup.
    *   Verify that all code blocks are syntactically correct and readable.
