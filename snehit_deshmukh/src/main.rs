use std::env;
use std::fs;
use std::path::{Path, PathBuf};

struct VCSEngine {
    dir: PathBuf,
    snapshots: PathBuf,
    logs: PathBuf,
}

impl VCSEngine {
    fn new() -> Self {
        let current_dir = env::current_dir().expect("Failed to get current dir.");
        VCSEngine {
            dir: current_dir.join(".vcs"),
            snapshots: current_dir.join(".vcs/snapshots"),
            logs: current_dir.join(".vcs/log.txt"),
        }
    }
}

fn main() {
    todo!();
}