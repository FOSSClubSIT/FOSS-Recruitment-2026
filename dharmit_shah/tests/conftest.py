import pytest
from datetime import datetime, timezone, timedelta

@pytest.fixture
def mock_now():
    return datetime.now(timezone.utc)

@pytest.fixture
def mock_repo_data(mock_now):
    return {
        "name": "test-repo",
        "owner": {"login": "test-owner"},
        "description": "A test repo",
        "language": "Python",
        "stargazers_count": 100,
        "forks_count": 10,
        "open_issues_count": 5,
        "created_at": (mock_now - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "updated_at": mock_now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "default_branch": "main"
    }

@pytest.fixture
def mock_commits(mock_now):
    return [
        {"commit": {"author": {"date": (mock_now - timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")}}},
        {"commit": {"author": {"date": (mock_now - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ")}}},
        {"commit": {"author": {"date": (mock_now - timedelta(days=40)).strftime("%Y-%m-%dT%H:%M:%SZ")}}} # Older than 30 days
    ]

@pytest.fixture
def mock_prs(mock_now):
    return [
        {
            "state": "open",
            "created_at": (mock_now - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "requested_reviewers": [],
            "assignees": []
        },
        {
            "state": "open",
            "created_at": (mock_now - timedelta(days=40)).strftime("%Y-%m-%dT%H:%M:%SZ"), # Stale
            "requested_reviewers": [{"login": "user1"}],
            "assignees": []
        },
        {
            "state": "closed",
            "created_at": (mock_now - timedelta(days=20)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "merged_at": (mock_now - timedelta(days=15)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    ]

@pytest.fixture
def mock_issues(mock_now):
    return [
        {
            "state": "open",
            "created_at": (mock_now - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "assignees": [{"login": "user1"}]
        },
        {
            "state": "open",
            "created_at": (mock_now - timedelta(days=100)).strftime("%Y-%m-%dT%H:%M:%SZ"), # Stale
            "assignees": [] # Unassigned
        },
        {
            "state": "closed",
            "created_at": (mock_now - timedelta(days=50)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "closed_at": (mock_now - timedelta(days=20)).strftime("%Y-%m-%dT%H:%M:%SZ")
        },
        # PR in issues list (GitHub does this)
        {
            "state": "open",
            "pull_request": {},
            "created_at": (mock_now - timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    ]

@pytest.fixture
def mock_contents():
    return [
        {"name": "README.md"},
        {"name": "LICENSE"},
        {"name": "CONTRIBUTING.md"}
        # Missing CODE_OF_CONDUCT, SECURITY, .gitignore
    ]
