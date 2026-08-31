import pytest
from typer.testing import CliRunner
from repolens.cli import app
import json
from unittest.mock import patch

runner = CliRunner()

def test_cli_invalid_repo_format():
    result = runner.invoke(app, ["invalid-repo-format"])
    assert result.exit_code == 1
    assert "Repository must be in 'owner/name' format" in result.output

@patch("repolens.cli.GitHubClient")
def test_cli_json_mode(mock_github_client, mock_repo_data, mock_commits, mock_prs, mock_issues, mock_contents):
    # Setup mock
    mock_instance = mock_github_client.return_value.__enter__.return_value
    mock_instance.get_repo.return_value = mock_repo_data
    mock_instance.get_commits.return_value = mock_commits
    mock_instance.get_pulls.return_value = mock_prs
    mock_instance.get_issues.return_value = mock_issues
    mock_instance.get_contributors.return_value = [{"login": "test", "contributions": 5}]
    mock_instance.get_contents.return_value = mock_contents
    
    result = runner.invoke(app, ["owner/repo", "--json"])
    assert result.exit_code == 0
    
    # Verify it's valid JSON
    data = json.loads(result.output)
    assert "repository" in data
    assert data["repository"]["name"] == "test-repo"
    assert "health_score" in data

@patch("repolens.cli.GitHubClient")
def test_cli_rich_mode(mock_github_client, mock_repo_data, mock_commits, mock_prs, mock_issues, mock_contents):
    # Setup mock
    mock_instance = mock_github_client.return_value.__enter__.return_value
    mock_instance.get_repo.return_value = mock_repo_data
    mock_instance.get_commits.return_value = mock_commits
    mock_instance.get_pulls.return_value = mock_prs
    mock_instance.get_issues.return_value = mock_issues
    mock_instance.get_contributors.return_value = [{"login": "test", "contributions": 5}]
    mock_instance.get_contents.return_value = mock_contents
    
    result = runner.invoke(app, ["owner/repo"])
    assert result.exit_code == 0
    
    assert "RepoLens — Repository Health Report" in result.output
    assert "test-repo" in result.output
    assert "Health Score" in result.output
