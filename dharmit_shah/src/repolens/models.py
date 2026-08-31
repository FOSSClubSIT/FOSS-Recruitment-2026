import dataclasses
from datetime import datetime
from typing import List, Optional, Dict

@dataclasses.dataclass
class RepositoryInfo:
    name: str
    owner: str
    description: Optional[str]
    primary_language: Optional[str]
    stars: int
    forks: int
    open_issues: int
    created_at: datetime
    updated_at: datetime
    default_branch: str

@dataclasses.dataclass
class ActivityMetrics:
    commits: int
    prs_opened: int
    prs_merged: int
    issues_opened: int
    issues_closed: int

@dataclasses.dataclass
class PullRequestMetrics:
    open_prs: int
    recent_merged_prs: int
    average_open_age_days: Optional[float]
    oldest_open_pr_age_days: Optional[float]
    stale_prs: int
    unreviewed_prs: int

@dataclasses.dataclass
class IssueMetrics:
    open_issues: int
    recent_opened_issues: int
    recent_closed_issues: int
    oldest_open_issue_age_days: Optional[float]
    average_open_issue_age_days: Optional[float]
    stale_issues: int
    unassigned_issues: int

@dataclasses.dataclass
class Contributor:
    login: str
    contributions: int

@dataclasses.dataclass
class DocumentationStatus:
    has_readme: bool
    has_contributing: bool
    has_license: bool
    has_code_of_conduct: bool
    has_security: bool
    has_gitignore: bool

@dataclasses.dataclass
class HealthReport:
    repository: RepositoryInfo
    activity: ActivityMetrics
    pull_requests: PullRequestMetrics
    issues: IssueMetrics
    contributors: List[Contributor]
    documentation: DocumentationStatus
    health_score: int
    strengths: List[str]
    things_to_review: List[str]
    
    def to_dict(self) -> dict:
        return dataclasses.asdict(self)
