from repolens.scoring import calculate_score
from repolens.models import (
    ActivityMetrics,
    PullRequestMetrics,
    IssueMetrics,
    DocumentationStatus
)

def test_calculate_score_perfect():
    activity = ActivityMetrics(100, 10, 10, 5, 5)
    prs = PullRequestMetrics(5, 5, 10.0, 15.0, 0, 0)
    issues = IssueMetrics(5, 2, 2, 20.0, 10.0, 0, 0)
    docs = DocumentationStatus(True, True, True, True, True, True)
    
    score, strengths, reviews = calculate_score(activity, prs, issues, docs)
    assert score == 100
    assert len(reviews) == 0

def test_calculate_score_inactivity():
    activity = ActivityMetrics(0, 0, 0, 0, 0) # 0 total
    prs = PullRequestMetrics(0, 0, None, None, 0, 0)
    issues = IssueMetrics(0, 0, 0, None, None, 0, 0)
    docs = DocumentationStatus(True, True, True, True, True, True)
    
    score, strengths, reviews = calculate_score(activity, prs, issues, docs)
    assert score == 85 # 100 - 15
    assert any("No recent activity" in r for r in reviews)

def test_calculate_score_missing_docs():
    activity = ActivityMetrics(100, 10, 10, 5, 5)
    prs = PullRequestMetrics(5, 5, 10.0, 15.0, 0, 0)
    issues = IssueMetrics(5, 2, 2, 20.0, 10.0, 0, 0)
    docs = DocumentationStatus(False, False, False, False, False, False)
    
    score, strengths, reviews = calculate_score(activity, prs, issues, docs)
    # 100 - 10 (readme) - 10 (license) - 2 (contributing) - 2 (coc) - 2 (security) = 74
    assert score == 74
    assert any("Missing documentation" in r for r in reviews)

def test_calculate_score_stale_issues_and_prs():
    activity = ActivityMetrics(100, 10, 10, 5, 5)
    prs = PullRequestMetrics(5, 0, 100.0, 200.0, 2, 1) # avg > 90 (-10), stale=2 (-5), unreviewed=1 (-2) = -17
    issues = IssueMetrics(5, 0, 0, 200.0, 190.0, 2, 1) # avg > 180 (-10), stale=2 (-5) = -15
    docs = DocumentationStatus(True, True, True, True, True, True)
    
    score, strengths, reviews = calculate_score(activity, prs, issues, docs)
    assert score == 100 - 17 - 15 # 68
