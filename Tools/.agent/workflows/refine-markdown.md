---
description: Refine Markdown files generated from HTML, focusing on table conversion, cleanup, and code block formatting.
---

This workflow guides the process of refining a Markdown file that has been crudely converted from HTML.

1.  **Preparation**
    -   Identify the source HTML file and the target Markdown file.
    -   Read both files to understand the current state and discrepancies.

2.  **Content Cleanup**
    -   Remove unwanted HTML artifacts like `<img>` tags, `<div` wrappers, and distinct sections if requested (e.g., "See also", "Navigation").
    -   Ensure all links are absolute or correctly formatted for the context.

3.  **Table Conversion**
    -   Identify raw HTML tables (`<table>...</table>`).
    -   Convert them to Markdown syntax:
        ```markdown
        | Header 1 | Header 2 |
        | :--- | :--- |
        | Cell 1 | Cell 2 |
        ```
    -   Handling complex cell content (lists, breaks):
        -   Use `<br>` for line breaks within cells.
        -   Use HTML list tags (`<ul><li>...</li></ul>`) inside cells if a Markdown list breaks the table structure.

4.  **Code Block Refinement**
    -   **Identify Single-Line Blocks**: finding fenced code blocks typically used for file paths or short commands.
        ```markdown
        ```
        path/to/file
        ```
        ```
    -   **Convert to Inline**: Change them to inline backticks.
        `path/to/file`
    -   **Merge Paragraphs**:
        -   // turbo
        -   Check for broken lines surrounding the newly converted inline code.
        -   Merge them into a single coherent paragraph.
        -   *Example*:
            *Before*:
            ```text
            The
            `folder`
            is used for...
            ```
            *After*:
            ```text
            The `folder` is used for...
            ```

5.  **Final Verification**
    -   Compare the text content of the refined Markdown file against the source HTML to ensure fidelity.
    -   Check for any remaining raw HTML tags using `grep` or search.
