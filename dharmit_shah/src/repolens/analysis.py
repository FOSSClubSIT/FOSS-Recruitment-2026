from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple
from repolens.models import (
    RepositoryInfo,
    ActivityMetrics,
    PullRequestMetrics,
    IssueMetrics,
    Contributor,
    DocumentationStatus
)

def parse_gh_time(time_str: str) -> datetime:
    """Parse GitHub ISO 8601 string to datetime."""
    return datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

def extract_repo_info(data: Dict[str, Any]) -> RepositoryInfo:
    return RepositoryInfo(
        name=data.get("name", "Unknown"),
        owner=data.get("owner", {}).get("login", "Unknown"),
        description=data.get("description"),
        primary_language=data.get("language"),
        stars=data.get("stargazers_count", 0),
        forks=data.get("forks_count", 0),
        open_issues=data.get("open_issues_count", 0),
        created_at=parse_gh_time(data["created_at"]),
        updated_at=parse_gh_time(data["updated_at"]),
        default_branch=data.get("default_branch", "main")
    )

def extract_activity_metrics(
    commits: List[Dict[str, Any]],
    prs: List[Dict[str, Any]],
    issues: List[Dict[str, Any]],
    days: int
) -> ActivityMetrics:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    recent_commits = len([c for c in commits if parse_gh_time(c["commit"]["author"]["date"]) >= cutoff])
    
    recent_prs_opened = len([pr for pr in prs if parse_gh_time(pr["created_at"]) >= cutoff])
    recent_prs_merged = len([pr for pr in prs if pr.get("merged_at") and parse_gh_time(pr["merged_at"]) >= cutoff])
    
    # Filter issues from pulls because GitHub /issues returns both
    pure_issues = [i for i in issues if "pull_request" not in i]
    recent_issues_opened = len([i for i in pure_issues if parse_gh_time(i["created_at"]) >= cutoff])
    recent_issues_closed = len([i for i in pure_issues if i.get("closed_at") and parse_gh_time(i["closed_at"]) >= cutoff])
    
    return ActivityMetrics(
        commits=recent_commits,
        prs_opened=recent_prs_opened,
        prs_merged=recent_prs_merged,
        issues_opened=recent_issues_opened,
        issues_closed=recent_issues_closed
    )

def extract_pr_metrics(prs: List[Dict[str, Any]], days: int) -> PullRequestMetrics:
    open_prs_list = [pr for pr in prs if pr["state"] == "open"]
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    recent_merged = len([pr for pr in prs if pr.get("merged_at") and parse_gh_time(pr["merged_at"]) >= cutoff])
    
    now = datetime.now(timezone.utc)
    open_ages = [(now - parse_gh_time(pr["created_at"])).days for pr in open_prs_list]
    
    avg_age = sum(open_ages) / len(open_ages) if open_ages else None
    oldest_age = max(open_ages) if open_ages else None
    
    stale_prs = len([age for age in open_ages if age > 30])
    
    unreviewed_prs = 0
    for pr in open_prs_list:
        # Simple heuristic: no requested reviewers and not assigned
        if not pr.get("requested_reviewers") and not pr.get("assignees"):
            unreviewed_prs += 1

    return PullRequestMetrics(
        open_prs=len(open_prs_list),
        recent_merged_prs=recent_merged,
        average_open_age_days=avg_age,
        oldest_open_pr_age_days=oldest_age,
        stale_prs=stale_prs,
        unreviewed_prs=unreviewed_prs
    )

def extract_issue_metrics(issues: List[Dict[str, Any]], days: int) -> IssueMetrics:
    pure_issues = [i for i in issues if "pull_request" not in i]
    open_issues_list = [i for i in pure_issues if i["state"] == "open"]
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    recent_opened = len([i for i in pure_issues if parse_gh_time(i["created_at"]) >= cutoff])
    recent_closed = len([i for i in pure_issues if i.get("closed_at") and parse_gh_time(i["closed_at"]) >= cutoff])
    
    now = datetime.now(timezone.utc)
    open_ages = [(now - parse_gh_time(i["created_at"])).days for i in open_issues_list]
    
    avg_age = sum(open_ages) / len(open_ages) if open_ages else None
    oldest_age = max(open_ages) if open_ages else None
    
    stale_issues = len([age for age in open_ages if age > 60])
    
    unassigned = len([i for i in open_issues_list if not i.get("assignees")])
    
    return IssueMetrics(
        open_issues=len(open_issues_list),
        recent_opened_issues=recent_opened,
        recent_closed_issues=recent_closed,
        oldest_open_issue_age_days=oldest_age,
        average_open_issue_age_days=avg_age,
        stale_issues=stale_issues,
        unassigned_issues=unassigned
    )

def extract_contributors(contributors_data: List[Dict[str, Any]]) -> List[Contributor]:
    contributors = []
    for c in contributors_data[:10]: # Top 10 contributors
        login = c.get("login", "Unknown")
        count = c.get("contributions", 0)
        contributors.append(Contributor(login=login, contributions=count))
    return contributors

def extract_documentation_status(contents: List[Dict[str, Any]]) -> DocumentationStatus:
    files = [item["name"].lower() for item in contents if isinstance(item, dict) and "name" in item]
    
    has_readme = any("readme" in f for f in files)
    has_contributing = any("contributing" in f for f in files)
    has_license = any("license" in f for f in files)
    has_code_of_conduct = any("code_of_conduct" in f for f in files)
    has_security = any("security" in f for f in files)
    has_gitignore = any(".gitignore" in f for f in files)
    
    return DocumentationStatus(
        has_readme=has_readme,
        has_contributing=has_contributing,
        has_license=has_license,
        has_code_of_conduct=has_code_of_conduct,
        has_security=has_security,
        has_gitignore=has_gitignore
    )
