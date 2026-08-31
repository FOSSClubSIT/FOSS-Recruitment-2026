class RepoLensError(Exception):
    """Base exception for RepoLens."""
    pass

class RepoNotFoundError(RepoLensError):
    """Raised when a repository cannot be found (404)."""
    pass

class RateLimitError(RepoLensError):
    """Raised when GitHub API rate limits are hit."""
    pass

class NetworkError(RepoLensError):
    """Raised when a network or timeout error occurs."""
    pass

class InvalidRepoFormatError(RepoLensError):
    """Raised when the repository argument format is invalid."""
    pass

class GitHubAPIError(RepoLensError):
    """Raised when GitHub returns an unexpected API error."""
    pass
