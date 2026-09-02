import os
import hashlib
import argparse
from collections import defaultdict
from pathlib import Path

try:
    import pathspec
except ImportError:
    pathspec = None

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    console = Console()
except ImportError:
    console = None


def get_ignore_spec(repo_path: Path):
    """Loads .gitignore and creates a pathspec object for filtering."""
    gitignore_path = repo_path / ".gitignore"
    if gitignore_path.exists() and pathspec:
        with open(gitignore_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        return pathspec.PathSpec.from_lines(pathspec.patterns.GitWildMatchPattern, lines)
    return None


def hash_file(filepath: Path, chunk_size=8192) -> str:
    """Computes SHA-256 hash of a file for duplicate detection."""
    hasher = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(chunk_size), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except (OSError, IOError):
        return ""


def analyze_repo(repo_path: str, max_files=10000):
    """
    Analyzes the repository for:
    - File count and total size per extension
    - Largest files
    - Duplicate files
    """
    root_path = Path(repo_path).resolve()
    if not root_path.exists() or not root_path.is_dir():
        raise ValueError(f"Invalid directory path: {repo_path}")

    spec = get_ignore_spec(root_path)

    stats_by_ext = defaultdict(lambda: {"count": 0, "size": 0})
    file_hashes = defaultdict(list)
    all_files = []

    files_processed = 0

    for dirpath, dirnames, filenames in os.walk(root_path):
        # Exclude .git directory completely
        if ".git" in dirnames:
            dirnames.remove(".git")

        rel_dir = Path(dirpath).relative_to(root_path)

        for filename in filenames:
            files_processed += 1
            if files_processed > max_files:
                break

            filepath = Path(dirpath) / filename
            rel_file = rel_dir / filename

            # Ignore files matching .gitignore
            if spec and spec.match_file(str(rel_file)):
                continue

            # Ignore symlinks or non-files
            if not filepath.is_file() or filepath.is_symlink():
                continue

            try:
                size = filepath.stat().st_size
            except OSError:
                continue

            ext = filepath.suffix.lower() or "no_extension"
            
            stats_by_ext[ext]["count"] += 1
            stats_by_ext[ext]["size"] += size
            
            all_files.append((size, str(rel_file), filepath))

    # Sort files by size
    all_files.sort(reverse=True, key=lambda x: x[0])
    largest_files = all_files[:10]

    # Find duplicates among non-empty files
    for size, rel_file, filepath in all_files:
        if size > 0:
            file_hash = hash_file(filepath)
            if file_hash:
                file_hashes[file_hash].append(rel_file)

    duplicates = {h: paths for h, paths in file_hashes.items() if len(paths) > 1}

    return {
        "stats_by_ext": stats_by_ext,
        "largest_files": largest_files,
        "duplicates": duplicates,
        "total_files": len(all_files),
        "total_size": sum(f[0] for f in all_files)
    }

def format_size(size_bytes: int) -> str:
    """Converts bytes to human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:3.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} PB"

def print_report(results, repo_path):
    """Prints the analysis report using rich if available, else plain text."""
    if console:
        console.print(Panel(f"[bold green]Repository Analysis for:[/bold green] [cyan]{repo_path}[/cyan]"))
        
        # Extensions Table
        ext_table = Table(title="File Types Summary (Sorted by Size)")
        ext_table.add_column("Extension", style="cyan")
        ext_table.add_column("Count", justify="right", style="magenta")
        ext_table.add_column("Total Size", justify="right", style="green")

        sorted_exts = sorted(results["stats_by_ext"].items(), key=lambda x: x[1]["size"], reverse=True)
        for ext, stats in sorted_exts[:15]:
            ext_table.add_row(ext, str(stats["count"]), format_size(stats["size"]))
        
        console.print(ext_table)

        # Largest Files Table
        large_table = Table(title="Top 10 Largest Files")
        large_table.add_column("Size", justify="right", style="green")
        large_table.add_column("File Path", style="cyan")
        
        for size, rel_file, _ in results["largest_files"]:
            large_table.add_row(format_size(size), rel_file)
            
        console.print(large_table)

        # Duplicates
        if results["duplicates"]:
            console.print(f"\n[bold yellow]Found {len(results['duplicates'])} duplicate file groups:[/bold yellow]")
            dup_count = 0
            for h, paths in results["duplicates"].items():
                if dup_count >= 5:
                    console.print("... (and more)")
                    break
                console.print(f"- [red]{len(paths)} identical files:[/red] {', '.join(paths)}")
                dup_count += 1
        else:
            console.print("\n[bold green]No duplicate files found![/bold green]")
            
        console.print(f"\n[bold]Total Analyzed:[/bold] {results['total_files']} files, {format_size(results['total_size'])}")

    else:
        # Fallback to plain text
        print(f"Repository Analysis for: {repo_path}")
        print("="*40)
        print("File Types Summary (Sorted by Size):")
        sorted_exts = sorted(results["stats_by_ext"].items(), key=lambda x: x[1]["size"], reverse=True)
        for ext, stats in sorted_exts[:15]:
            print(f"{ext}: {stats['count']} files, {format_size(stats['size'])}")
            
        print("\nTop 10 Largest Files:")
        for size, rel_file, _ in results["largest_files"]:
            print(f"{format_size(size)} - {rel_file}")
            
        if results["duplicates"]:
            print(f"\nFound {len(results['duplicates'])} duplicate file groups (showing up to 5):")
            dup_count = 0
            for h, paths in results["duplicates"].items():
                if dup_count >= 5:
                    break
                print(f"- {len(paths)} identical files: {', '.join(paths)}")
                dup_count += 1
        else:
            print("\nNo duplicate files found!")
            
        print(f"\nTotal Analyzed: {results['total_files']} files, {format_size(results['total_size'])}")

def main():
    parser = argparse.ArgumentParser(description="Analyze a local repository for sizes, types, and duplicates.")
    parser.add_argument("path", nargs="?", default=".", help="Path to the repository (default: current directory)")
    
    args = parser.parse_args()
    
    try:
        results = analyze_repo(args.path)
        print_report(results, args.path)
    except Exception as e:
        if console:
            console.print(f"[bold red]Error:[/bold red] {e}")
        else:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
