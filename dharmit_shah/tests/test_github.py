import pytest
import httpx
from repolens.github import GitHubClient
from repolens.exceptions import RepoNotFoundError, RateLimitError, GitHubAPIError

class MockResponse:
    def __init__(self, status_code, json_data=None, text="", headers=None):
        self.status_code = status_code
        self._json = json_data
        self.text = text
        self.headers = headers or {}
        
    def json(self):
        return self._json

def test_github_client_404(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(404)
    
    monkeypatch.setattr(httpx.Client, "get", mock_get)
    
    with GitHubClient() as client:
        with pytest.raises(RepoNotFoundError):
            client.get_repo("not-exist", "not-exist")

def test_github_client_rate_limit(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(403, headers={"X-RateLimit-Remaining": "0"})
    
    monkeypatch.setattr(httpx.Client, "get", mock_get)
    
    with GitHubClient() as client:
        with pytest.raises(RateLimitError):
            client.get_repo("owner", "repo")
            
def test_github_client_success(monkeypatch, mock_repo_data):
    def mock_get(*args, **kwargs):
        return MockResponse(200, json_data=mock_repo_data)
    
    monkeypatch.setattr(httpx.Client, "get", mock_get)
    
    with GitHubClient() as client:
        repo = client.get_repo("owner", "repo")
        assert repo["name"] == "test-repo"
