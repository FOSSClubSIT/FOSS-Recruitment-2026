# Interview Prep Notes - Repo-Insight

## 30-Second Explanation
"I built Repo-Insight, a CLI tool that quickly analyzes local repositories. It reads your `.gitignore` to skip junk, groups files by extension to show where space is being used, flags the top 10 largest files, and hashes files to detect exact duplicates. It’s designed to help developers clean up their local workspaces easily."

## 2-Minute Explanation
"My project is Repo-Insight. As developers, we often run out of disk space without realizing what’s taking it up—like large build artifacts, uncompressed assets, or duplicate dependencies. Existing tools like `du` or `tree` can be too noisy and don't natively understand `.gitignore`. 
I wrote a Python script that traverses the directory tree while actively skipping anything in `.gitignore` using the `pathspec` library. It aggregates file sizes by extension, keeps a running list of the largest files, and securely hashes file contents using SHA-256 to find true duplicates. Finally, I used the `rich` library to render this data into clean, readable terminal tables. It’s small, fast, and solves a real annoyance I face locally."

## Architecture / How It Works
1.  **Traversal:** Uses `os.walk` to traverse the directory structure.
2.  **Filtering:** It immediately parses `.gitignore` at the root and checks each path against these rules using `pathspec`.
3.  **Aggregation:** Uses `collections.defaultdict` to track count and sizes of files by extension `pathlib.Path.suffix`.
4.  **Hashing:** It reads files in chunks (8192 bytes) and uses `hashlib.sha256` to create a hash. If two files have the same hash, they are exact duplicates.
5.  **Formatting:** Passes the results dict to a formatting function that uses `rich` for CLI presentation.

## Why this tech stack?
*   **Python:** Ideal for file system operations, text processing, and rapid prototyping.
*   **`pathspec`:** Because writing a custom `.gitignore` parser is notoriously difficult (globs, negations, directory rules). Using `pathspec` ensures it behaves exactly like Git.
*   **`rich`:** It’s the modern standard for beautiful Python terminal output without writing complex ANSI escape codes.

## Most Important Function
`analyze_repo(repo_path)`: It ties everything together. It handles the `os.walk`, integrates the ignore spec, updates the dictionaries for extensions, and tracks the largest files and hashes.

## Biggest Technical Challenge
Handling large files during the duplicate detection phase. If I read a 2GB video file entirely into memory to hash it, the script would crash or freeze. I solved this by writing the `hash_file` function to read files in 8KB chunks.

## Edge Cases Handled
*   **Empty files:** Hashes of empty files aren't useful, so I only hash files where `size > 0`.
*   **Symlinks:** I actively check `filepath.is_symlink()` and skip them to avoid infinite loops in the file system.
*   **Missing `.gitignore`:** If no `.gitignore` is present, it gracefully proceeds without filtering.
*   **Missing `rich` dependency:** I added fallback print logic in case `rich` isn't installed.

## What happens if X fails?
*   **If a file is locked/unreadable:** The `try-except` block catches `OSError`/`IOError` and skips the file gracefully instead of crashing the whole tool.

## What I would change with more time
*   **Multi-threading:** I’d use `concurrent.futures.ThreadPoolExecutor` to hash files in parallel, as disk I/O and hashing are the main bottlenecks.
*   **Interactive Deletion:** I'd add a prompt to let users delete duplicates immediately from the UI.

## Possible Questions & Answers
**Q: Why not just use `fdupes` or `ncdu`?**
A: Those are great general-purpose tools, but they don't respect `.gitignore`. Repo-Insight is specifically tailored for developer repositories where we want to ignore things like `node_modules` or `.venv` automatically.

**Q: Why SHA-256 instead of MD5?**
A: While MD5 is slightly faster, SHA-256 is the modern standard and practically immune to collisions. The performance difference is negligible for typical repository sizes.

**Q: How do you handle deep directory structures?**
A: `os.walk` handles arbitrary depth, and I added a `max_files` limit (default 10,000) as a safeguard so it doesn't run forever on accidentally massive directories (like the entire hard drive).
