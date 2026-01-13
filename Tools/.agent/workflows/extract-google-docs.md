---
description: Extract raw text content from a Google Doc
---

1. Call the `browser_subagent` tool with a task description that includes:
   - "Navigate to [URL]"
   - "Extract the raw text content from the Google Doc."
   - "Google Docs uses a Canvas-based rendering engine, so standard scraping 'innerText' may fail."
   - "STRATEGY 1 (Raw Data): Look for `<script>` tags containing `DOCS_modelChunk`. Extract the `s` fields from these chunks, unescape them, and concatenate them. This is the most reliable way to get the exact raw text."
   - "STRATEGY 2 (Accessibility DOM): Press `Ctrl+Alt+Z` to enable Screen Reader support, then extract text from the DOM elements (often `kix-lineview` classes or `[role="region"]` areas)."
   - "Return the concatenated raw text."

2. The subagent should return the extracted text string.
3. Save the returned text to a file as requested by the user.
