# Repo-Insight

Repo-Insight is a lightning-fast directory and repository analysis CLI tool. It scans your projects to calculate the total size grouped by file extensions, identifies the absolute largest files taking up space, and detects duplicate files based on SHA-256 hashing—all while automatically respecting your `.gitignore` rules.

## Why I built it
As a developer, I frequently find my workspace cluttered with invisible heavy files, cached builds, and unintentional duplicates. Existing tools like `du` or `tree` are too noisy, don't respect `.gitignore` by default, and lack built-in duplicate detection. I wanted a modern, fast, and visually clean summary of any repository to instantly pinpoint where my storage is going.

## Features
*   **Gitignore Aware:** Automatically skips ignored files so you only analyze what matters.
*   **Space Analysis:** Groups files by extension and shows the exact count and cumulative size.
*   **Heavyweights:** Lists the top 10 largest files in the repository.
*   **Duplicate Detection:** Hashes files to find exact duplicates and save space.
*   **Beautiful CLI:** Uses `rich` for formatting neat terminal tables.

## Tech Stack
*   **Python 3:** Chosen for fast prototyping and excellent standard libraries (`os`, `hashlib`, `pathlib`).
*   **`pathspec`:** To parse `.gitignore` rules identically to Git itself.
*   **`rich`:** For beautiful terminal output with minimal boilerplate.

## Project Structure
*   `repo_insight.py` — The main CLI script containing the tree traversal, hashing, and formatting logic.
*   `test_repo_insight.py` — Unit tests using `pytest` to ensure hashing and pathspec logic behaves properly.
*   `requirements.txt` — Project dependencies.

## Installation

```bash
cd tanmay_agarwal
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

You can run the script pointing to any directory (it defaults to the current directory):

```bash
# Analyze the current directory
python3 repo_insight.py

# Analyze a specific directory
python3 repo_insight.py /path/to/your/project
```

### Expected Output
You will see a clean terminal output showing a summary table of file extensions, a list of the 10 largest files, and a breakdown of any exact duplicate files found.

## Testing

To run the automated tests:
```bash
pytest test_repo_insight.py
```

## Challenges
1.  **Handling `.gitignore` properly:** Just checking if a file contains a string isn't enough because `.gitignore` uses complex glob patterns. I had to integrate `pathspec` to ensure I respect the exact same rules Git uses.
2.  **Performance:** Walking through huge directories and hashing every single file can be slow. I optimized it by only hashing files if their sizes are larger than 0, and reading them in chunks to avoid memory spikes for large binaries.

## What I would improve
*   Add a `--cleanup` flag to automatically delete or symlink the detected duplicates.
*   Use multi-threading (`concurrent.futures`) for the file hashing step to significantly speed up the analysis of large codebases.
*   Provide JSON/CSV export options so the output can be piped into other shell tools.

## Limitations
*   It does not follow symlinks to avoid infinite loops, which means it might skip linked directories.
*   For repositories with hundreds of thousands of files, single-threaded hashing can still take a few seconds.

## License
MIT
