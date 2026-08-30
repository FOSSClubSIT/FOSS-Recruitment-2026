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

    fn init(&self) {
        if self.dir.exists() {
            println!("Repository already init-ed!");
            return;
        }
        fs::create_dir(&self.dir).expect("Failed to create base directory!");
        fs::create_dir(&self.snapshots).expect("Failed to create snapshots directory!");
        println!("Initialized empty VCS repository in {:?}!", self.dir);
        println!("This project is ready to begin tracking changes.");
    }
}

fn main() {
    todo!();
}