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
        fs::write(&self.logs, "--- VCS Logs ---\n").expect("Failed to create and write log file!");
        println!("Initialized empty VCS repository in {:?}!", self.dir);
        println!("This project is ready to begin tracking changes.");
    }

    fn commit(&self, message: &str) {
        if !self.dir.exists() {
            println!("Error: Not a VCS repository, run the init command first.");
            return;
        }

        let entries = fs::read_dir(&self.snapshots).expect("Failed to read snapshots.");
        let version_id = entries.count() + 1;
        let new_commit_dir = self.snapshots.join(format!("v{}", version_id));
        fs::create_dir(&new_commit_dir).expect("Failed to create new commit dir.");

        let current_dir = env::current_dir().expect("Failed to get working directory.");
        let dir_items = fs::read_dir(&current_dir).expect("Failed to read dir files.");

        for file in dir_items {
            let file = file.expect("Failed to read file.").path();

            if file.file_name().unwrap_or_default() == ".vcs" {
                continue;
            }

            if file.is_file() {
                let file_name = file.file_name().unwrap();
                let dest = new_commit_dir.join(file_name);
                fs::copy(&file, &dest).expect("Failed to copyh file.");
            }
        }

        let log_entry = format!("v{}: {}\n", version_id, message);
        fs::OpenOptions::new()
            .append(true)
            .open(&self.logs)
            .unwrap()
            .write_all(log_entry.as_bytes())
            .expect("Failed to update log file.");
        
        println!("Committed v{} - {}", version_id, message);
    }

    fn log(&self) {
        if !self.dir.exists() {
            println!("Error: VCS repository not found.");
            return;
        }

        match fs::read_to_string(&self.logs) {
            Ok(content) => {
                println!("Snapshot history: ");

                let lines: Vec<&str> = content.lines()
                    .skip(1)
                    .filter(|line| !line.is_empty())
                    .collect();

                if lines.is_empty() {
                    println!("  -x No commits recorded.");
                    return;
                }

                for line in lines.iter() {
                    println!("  - {}", line);
                }
            },
            Err(_) => println!("Error reading log file."),
        };
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Usage:");
        println!("- vcs init");
        println!("- vcs log");
        println!("- vcs commit <msg>");
        return;
    }

    let engine = VCSEngine::new();
    match args[1].as_str() {
        "init" => engine.init(),
        "log" => engine.log(),
        "commit" => {
            if args.len() < 3 {
                println!("Error: Commit command requires a commit message.");
                println!("Usage: vsc commit <msg>");
            } else {
                engine.commit(&args[2]);
            }
        }
        _ => println!("Unrecognised command, use init or commit."),
    }
}