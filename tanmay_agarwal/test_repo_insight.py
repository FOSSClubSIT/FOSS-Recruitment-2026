import os
from pathlib import Path
from repo_insight import hash_file, get_ignore_spec

def test_hash_file(tmp_path: Path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello world")
    
    # SHA-256 of "hello world"
    expected_hash = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    assert hash_file(test_file) == expected_hash

def test_get_ignore_spec(tmp_path: Path):
    gitignore = tmp_path / ".gitignore"
    gitignore.write_text("*.log\ntemp/\n")
    
    spec = get_ignore_spec(tmp_path)
    
    assert spec is not None
    assert spec.match_file("error.log") == True
    assert spec.match_file("main.py") == False
    assert spec.match_file("temp/data.txt") == True

def test_empty_gitignore(tmp_path: Path):
    spec = get_ignore_spec(tmp_path)
    assert spec is None
