<div align="center">
    <h1>VCS</h1>
    <p>A lightweight toy version control system written entirely in <b>Rust</b> for fun.</p>

![Time Tracking](https://img.shields.io/badge/VCS-1h%2046min-critical?logo=rust&style=plastic)
</div>


## Features
- **Local changes**: Creates and stores snapshots (commits) locally.
- **Logs**: Logs all snapshots so they can browsed through.

## Commands
- `vcs init`: Initialises the version control engine. Enables VCS functionality.
- `vcs commit message`: Creates a snapshot in `./vcs/snapshots/` and also adds a log to `./vcs/log.txt` with the commit message.
- `vcs log`: Shows all the logged snapshots with their messages.

`vcs` is the binary for your target platform.

## Explanation
First snapshot is saved as:

`./vcs/snapshots/v1/`

Second snapshot is saved as:

`./vcs/snapshots/v2/`

And so on.

The log file is saved in the format:
```text
--- VCS Logs ---
v1: commit1message
v2: commit2message
v3: commit3message
```

## Source Code
Can be compiled locally with:
`cargo build --release`

## Current Limitations
Given the time constraints, the scope of this project is really small.
- Engine duplicates all files while snapshotting. There's obviously better alternatives.
- No directory support. Directories are outright ignored.
- Several others that I haven't yet thought of.