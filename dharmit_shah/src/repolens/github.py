import os
import httpx
from typing import Dict, Any, List, Optional
from repolens.exceptions import (
    RepoNotFoundError,
    RateLimitError,
    NetworkError,
    GitHubAPIError
)

class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.environ.get("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoLens-CLI"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"
        
        self.client = httpx.Client(headers=self.headers, timeout=15.0)

    def _handle_response(self, response: httpx.Response) -> Any:
        if response.status_code == 404:
            raise RepoNotFoundError("Repository not found. Make sure it exists and is public.")
        if response.status_code in (403, 429):
            if "X-RateLimit-Remaining" in response.headers and response.headers["X-RateLimit-Remaining"] == "0":
                raise RateLimitError("GitHub API rate limit reached.")
            if "API rate limit exceeded" in response.text:
                raise RateLimitError("GitHub API rate limit reached.")
        if response.status_code != 200:
            raise GitHubAPIError(f"GitHub API returned status {response.status_code}: {response.text}")
        
        return response.json()

    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        try:
            response = self.client.get(url, params=params)
            return self._handle_response(response)
        except httpx.RequestError as e:
            raise NetworkError(f"Network error while communicating with GitHub: {e}")

    def get_repo(self, owner: str, repo: str) -> Dict[str, Any]:
        return self.get(f"/repos/{owner}/{repo}")
    
    def get_commits(self, owner: str, repo: str, since: str) -> List[Dict[str, Any]]:
        # For simplicity, we just fetch one page to avoid excessive requests if not strictly needed
        # Or we can iterate pages if we want full counts, but for a 30-day window, 100 might be enough
        # The requirements say: "If complete historical information would require excessive API requests, use a reasonable approximation and document it."
        # We'll fetch up to 100 recent commits.
        params = {"since": since, "per_page": 100}
        return self.get(f"/repos/{owner}/{repo}/commits", params=params)
    
    def get_pulls(self, owner: str, repo: str, state: str = "all", sort: str = "updated", direction: str = "desc", per_page: int = 100) -> List[Dict[str, Any]]:
        params = {"state": state, "sort": sort, "direction": direction, "per_page": per_page}
        return self.get(f"/repos/{owner}/{repo}/pulls", params=params)

    def get_issues(self, owner: str, repo: str, state: str = "all", sort: str = "updated", direction: str = "desc", per_page: int = 100) -> List[Dict[str, Any]]:
        # GitHub's /issues API returns both issues and pull requests.
        # We need to filter out pull requests later.
        params = {"state": state, "sort": sort, "direction": direction, "per_page": per_page}
        return self.get(f"/repos/{owner}/{repo}/issues", params=params)

    def get_contributors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        return self.get(f"/repos/{owner}/{repo}/contributors", params={"per_page": 100})
    
    def get_contents(self, owner: str, repo: str, path: str = "") -> List[Dict[str, Any]]:
        try:
            return self.get(f"/repos/{owner}/{repo}/contents/{path}")
        except RepoNotFoundError:
            return [] # Directory doesn't exist
        except GitHubAPIError:
            return [] # Fallback for unexpected errors getting contents

    def close(self):
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
