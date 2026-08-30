use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::io::Write;

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
    let args: Vec<String> = env::args().collect();
    if args.len() > 2 {
        println!("Usage:");
        println!("- vcs init");
        println!("- vcs commit <msg>");
    }

    let engine = VCSEngine::new();
    match args[1].as_str() {
        "init" => engine.init(),
        "commit" => {
            if args.len() < 3 {
                println!("Error: Commit command requires a commit message.");
                println!("Usage: vsc commit <msg>");
            } else {
                // commit method
                todo!();
            }
        }
        _ => println!("Unrecognised command, use init or commit."),
    }
}