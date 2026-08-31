# RepoLens

RepoLens is a command-line tool that analyzes a public GitHub repository and produces a useful repository-health report.

## Why RepoLens?
Maintaining and contributing to open-source software can be challenging without visibility into project health. RepoLens solves this by providing a simple, fast CLI tool to gauge the activity, PR/issue hygiene, and documentation completeness of any public GitHub repository, outputting a beautiful terminal report or structured JSON.

## Features
- Fetches overview metadata (stars, forks, open issues).
- Calculates activity metrics for a configurable timeframe (default: 30 days).
- Evaluates Pull Request health (average open PR age, oldest open PR).
- Evaluates Issue health.
- Identifies top contributors and activity levels.
- Checks repository hygiene (presence of README, LICENSE, SECURITY, etc.).
- Computes a deterministic repository health score (0-100).
- Supports JSON output for automated integrations.

## Demo
*(Representative Output)*
```text
╭────────────────────────────────────────────╮
│ RepoLens — Repository Health Report        │
╰────────────────────────────────────────────╯

Repository
  FOSSClubSIT/FOSS-Recruitment-2026
  Python

Overview
  ★ Stars       128
  Forks          24
  Open Issues     7
  Open PRs        3

Activity — Last 30 Days
  Commits        18
  PRs Opened      6
  PRs Merged      5
  Issues Opened   4
  Issues Closed   8

Health Score
  78 / 100
```

## Installation

```bash
git clone https://github.com/yourusername/repolens.git
cd repolens
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**Linux/macOS:**
```bash
source .venv/bin/activate
```

Then install the package locally:
```bash
pip install -e .
```

## Usage

Basic usage:
```bash
repolens owner/repository
```

Specify a custom timeframe for activity metrics:
```bash
repolens owner/repository --days 30
```

Output as JSON:
```bash
repolens owner/repository --json
```

## GitHub Token
RepoLens works without a token for public repositories, but you might hit GitHub's unauthenticated API rate limits. To prevent this, you can set an optional GitHub token as an environment variable:

```bash
GITHUB_TOKEN=your_personal_access_token repolens owner/repository
```

## Architecture
The CLI is built using **Typer** and formatted with **Rich**.
Data flow:
1. `cli.py` handles user input.
2. `github.py` fetches data via the GitHub REST API (using `httpx`).
3. `analysis.py` computes metrics.
4. `scoring.py` determines the health score based on rules.
5. `report.py` renders the final output.

## Health Score
The scoring starts at 100. Deductions are applied for:
- Missing documentation files (e.g., -5 for missing README, -5 for missing LICENSE, -2 for others).
- Inactivity: If no recent activity (commits/PRs) in the selected timeframe (-10).
- Stale PRs: If average open PR age > 30 days (-5) or > 90 days (-10).
- Stale Issues: If average open Issue age > 60 days (-5) or > 180 days (-10).

The score is clamped between 0 and 100.

## API Limitations
RepoLens uses the public GitHub REST API. Some metrics (like full historical commits) are approximated or limited by pagination to avoid excessive requests and rate limiting. 

## Testing
Run the test suite with:
```bash
pytest
```

## Design Decisions
- **Why CLI?** Fast, easy to pipe to other tools, and natural for developer workflows.
- **Why Rich?** Provides excellent terminal aesthetics out of the box.
- **Why REST API?** Simpler and more predictable than GraphQL for these specific metric queries.
- **Why no database/ML?** Keep the architecture deterministic, simple, and dependency-light.

## Future Improvements
- GraphQL integration for more complex nested queries.
- Historical snapshots and trend visualization.
- GitHub Actions integration.
- Configurable scoring rules via a `.repolens.yaml` file.

## License
MIT License.
