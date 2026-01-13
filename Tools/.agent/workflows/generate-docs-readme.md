---
description: Generate a navigation README.md for a documentation directory.
---

This workflow guides the process of creating a `README.md` file to serve as a landing page for a documentation directory.

1.  **Preparation & Analysis**
    -   Identify the target directory (e.g., `01_Official`, `02_Community_Unofficial`, or a specific version folder).
    -   List **only** the immediate children of the target directory. Do NOT recursively list all files.
    -   **Sub-directory Check**: For each subdirectory, check if it contains a `README.md` file.

2.  **Content Construction**
    -   **Title**: Use a clear, human-readable title based on the directory name (e.g., "Official Documentation", "Community Wiki").
    -   **Description**: Briefly explain the source and purpose of the documents in this folder.
    -   **Normative Warning** (Optional): If the directory is `01_Official`, include the "Normative" alert:
        ```markdown
        > [!IMPORTANT]
        > These documents are **normative**. In cases of conflict... information here takes precedence...
        ```
    -   **Directory Structure**: Create a section listing the subdirectories.
        -   **Format**: `### [SubDirName]/`
        -   **Linking**:
            -   **IF** `SubDir/README.md` exists: Link the header to it. Example: `### [42.13_Unstable](42.13_Unstable/README.md)`
            -   **ELSE**: Do not link the header. Instead, you **MUST** list the Markdown files contained within that subdirectory.
                -   List each `.md` file as a bullet point with a direct relative link.
                -   Format: `- [Filename](SubDirectory/Filename.md) - [Brief description if available]` OR just `- [Filename](SubDirectory/Filename.md)`
                -   *Example*:
                    - `[Random.md](42.1/Random.md)`
                    - `[Game_time.md](Common/Game_time.md)`
        -   **Description**: Add a short description of the subdirectory context (e.g., "Migration guides", "Lua APIs").
    -   **Key Files**: If there are critical files at the root of this directory (like `Migration_Guide.md`), list them under a "Key Files" or "Usage" section with direct relative links.

3.  **Formatting Rules**
    -   Use **Relative Links** for all internal navigation.
    -   Use **Sentence Case** for headers.
    -   Keep descriptions concise.
