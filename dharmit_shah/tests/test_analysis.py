from repolens.analysis import (
    extract_repo_info,
    extract_activity_metrics,
    extract_pr_metrics,
    extract_issue_metrics,
    extract_documentation_status
)

def test_extract_repo_info(mock_repo_data):
    info = extract_repo_info(mock_repo_data)
    assert info.name == "test-repo"
    assert info.owner == "test-owner"
    assert info.stars == 100

def test_extract_activity_metrics(mock_commits, mock_prs, mock_issues):
    metrics = extract_activity_metrics(mock_commits, mock_prs, mock_issues, days=30)
    assert metrics.commits == 2 # 2 recent
    assert metrics.prs_opened == 2 # 5, 20 days ago (40 is not in 30 days) => Wait, in mock_prs we had 5 (open), 40 (open), 20 (closed). 5 and 20 are in 30 days.
    assert metrics.prs_merged == 1 # The one closed 20 days ago merged 15 days ago
    assert metrics.issues_opened == 1 # 10 days open. The closed one opened 50 days ago (not in 30 days). The PR is ignored.
    assert metrics.issues_closed == 1 # Closed 20 days ago

def test_extract_pr_metrics(mock_prs):
    metrics = extract_pr_metrics(mock_prs, days=30)
    assert metrics.open_prs == 2
    assert metrics.recent_merged_prs == 1
    assert metrics.stale_prs == 1
    assert metrics.unreviewed_prs == 1 # The 5-day old one has no reviewers

def test_extract_issue_metrics(mock_issues):
    metrics = extract_issue_metrics(mock_issues, days=30)
    assert metrics.open_issues == 2 # PR is ignored
    assert metrics.recent_opened_issues == 1
    assert metrics.stale_issues == 1 # 100 days old
    assert metrics.unassigned_issues == 1 # The 100 days old one

def test_extract_documentation_status(mock_contents):
    status = extract_documentation_status(mock_contents)
    assert status.has_readme is True
    assert status.has_license is True
    assert status.has_contributing is True
    assert status.has_code_of_conduct is False
