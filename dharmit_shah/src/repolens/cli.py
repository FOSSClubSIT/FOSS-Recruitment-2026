import typer
from typing import Optional
from datetime import datetime, timezone, timedelta
from rich.console import Console

from repolens.__init__ import __version__
from repolens.github import GitHubClient
from repolens.analysis import (
    extract_repo_info,
    extract_activity_metrics,
    extract_pr_metrics,
    extract_issue_metrics,
    extract_contributors,
    extract_documentation_status
)
from repolens.scoring import calculate_score
from repolens.report import print_report_rich, print_report_json
from repolens.models import HealthReport
from repolens.exceptions import RepoLensError, InvalidRepoFormatError

app = typer.Typer(add_completion=False)
err_console = Console(stderr=True)

def version_callback(value: bool):
    if value:
        typer.echo(f"RepoLens version {__version__}")
        raise typer.Exit()

@app.command()
def main(
    repo: str = typer.Argument(..., help="The repository in 'owner/name' format (e.g., tiangolo/typer)."),
    days: int = typer.Option(30, help="Number of days to look back for activity metrics."),
    json_mode: bool = typer.Option(False, "--json", help="Output raw JSON instead of the rich report."),
    version: Optional[bool] = typer.Option(
        None, "--version", callback=version_callback, is_eager=True, help="Show the version and exit."
    ),
):
    """
    RepoLens — A command-line tool that analyzes a public GitHub repository and produces a useful repository-health report.
    """
    try:
        if "/" not in repo or len(repo.split("/")) != 2:
            raise InvalidRepoFormatError("Repository must be in 'owner/name' format.")
        
        owner, repo_name = repo.split("/")
        
        if not json_mode:
            err_console.print(f"[dim]Analyzing {owner}/{repo_name}...[/dim]")
        
        with GitHubClient() as client:
            repo_data = client.get_repo(owner, repo_name)
            repo_info = extract_repo_info(repo_data)
            
            cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
            commits_data = client.get_commits(owner, repo_name, since=cutoff_date)
            prs_data = client.get_pulls(owner, repo_name)
            issues_data = client.get_issues(owner, repo_name)
            contrib_data = client.get_contributors(owner, repo_name)
            contents_data = client.get_contents(owner, repo_name)
            
            activity_metrics = extract_activity_metrics(commits_data, prs_data, issues_data, days)
            pr_metrics = extract_pr_metrics(prs_data, days)
            issue_metrics = extract_issue_metrics(issues_data, days)
            contributors = extract_contributors(contrib_data)
            docs_status = extract_documentation_status(contents_data)
            
            score, strengths, reviews = calculate_score(activity_metrics, pr_metrics, issue_metrics, docs_status)
            
            report = HealthReport(
                repository=repo_info,
                activity=activity_metrics,
                pull_requests=pr_metrics,
                issues=issue_metrics,
                contributors=contributors,
                documentation=docs_status,
                health_score=score,
                strengths=strengths,
                things_to_review=reviews
            )
            
            if json_mode:
                print_report_json(report)
            else:
                print_report_rich(report, days)

    except RepoLensError as e:
        if json_mode:
            import json
            print(json.dumps({"error": str(e)}))
        else:
            err_console.print(f"\n[bold red]Error:[/bold red] {e}")
            if "rate limit" in str(e).lower():
                err_console.print("\nTry again later or provide a GitHub token:\n[cyan]GITHUB_TOKEN=your_token repolens owner/repository[/cyan]")
        raise typer.Exit(1)
    except Exception as e:
        if json_mode:
            import json
            print(json.dumps({"error": f"Unexpected error: {e}"}))
        else:
            err_console.print(f"\n[bold red]Unexpected Error:[/bold red] {e}")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()
