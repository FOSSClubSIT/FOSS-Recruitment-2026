from typing import Tuple, List
from repolens.models import (
    HealthReport,
    RepositoryInfo,
    ActivityMetrics,
    PullRequestMetrics,
    IssueMetrics,
    DocumentationStatus
)

def calculate_score(
    activity: ActivityMetrics,
    prs: PullRequestMetrics,
    issues: IssueMetrics,
    docs: DocumentationStatus
) -> Tuple[int, List[str], List[str]]:
    score = 100
    strengths = []
    reviews = []

    # Activity Evaluation
    total_recent_activity = activity.commits + activity.prs_opened + activity.issues_opened
    if total_recent_activity == 0:
        score -= 15
        reviews.append("No recent activity (commits, PRs, or issues) in the selected timeframe.")
    elif total_recent_activity > 20:
        strengths.append("Active recent development.")
    elif total_recent_activity > 5:
        strengths.append("Some recent activity.")

    # PR Health
    if prs.open_prs > 0:
        if prs.average_open_age_days is not None:
            if prs.average_open_age_days > 90:
                score -= 10
                reviews.append(f"Average open PR age is very high ({prs.average_open_age_days:.0f} days).")
            elif prs.average_open_age_days > 30:
                score -= 5
                reviews.append(f"Average open PR age is slightly high ({prs.average_open_age_days:.0f} days).")
            else:
                strengths.append("PRs are being resolved relatively quickly.")
        
        if prs.stale_prs > 0:
            score -= 5
            reviews.append(f"{prs.stale_prs} PR(s) have been open for more than 30 days.")
            
        if prs.unreviewed_prs > 0:
            score -= 2
            reviews.append(f"{prs.unreviewed_prs} open PR(s) appear to lack reviewers or assignees.")
    else:
        strengths.append("No pending open Pull Requests.")

    if activity.prs_merged > 0:
        strengths.append("PR activity is healthy (recent merges).")

    # Issue Health
    if issues.open_issues > 0:
        if issues.average_open_issue_age_days is not None:
            if issues.average_open_issue_age_days > 180:
                score -= 10
                reviews.append(f"Average open issue age is very high ({issues.average_open_issue_age_days:.0f} days).")
            elif issues.average_open_issue_age_days > 60:
                score -= 5
                reviews.append(f"Average open issue age is high ({issues.average_open_issue_age_days:.0f} days).")

        if issues.stale_issues > 0:
            score -= 5
            reviews.append(f"{issues.stale_issues} issue(s) have been open for more than 60 days.")
            
        if issues.unassigned_issues > 0:
            reviews.append(f"Several issues ({issues.unassigned_issues}) have no assignee.")
    else:
        strengths.append("No open issues.")

    # Documentation Hygiene
    missing_docs = []
    if not docs.has_readme:
        score -= 10
        missing_docs.append("README")
    if not docs.has_license:
        score -= 10
        missing_docs.append("LICENSE")
    if not docs.has_contributing:
        score -= 2
        missing_docs.append("CONTRIBUTING")
    if not docs.has_code_of_conduct:
        score -= 2
        missing_docs.append("CODE_OF_CONDUCT")
    if not docs.has_security:
        score -= 2
        missing_docs.append("SECURITY")

    if missing_docs:
        reviews.append(f"Missing documentation: {', '.join(missing_docs)}.")
    if docs.has_readme and docs.has_license:
        strengths.append("README and license are present.")

    # Clamp score
    score = max(0, min(100, score))
    
    return score, strengths, reviews
