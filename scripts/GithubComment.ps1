param(
    [string]$Comment,
    [string]$BranchName,
    [string]$GithubToken,
    [string]$RepoOwner,
    [string]$RepoName
)

# Configuration
# Find PR by branch name
$headers = @{
    "Authorization" = "token $GithubToken"
    "Accept" = "application/vnd.github.v3+json"
}

# Search for open PRs with the specified head branch
$prsUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/pulls?state=open&head=${RepoOwner}:${BranchName}"
$prs = Invoke-RestMethod -Uri $prsUrl -Headers $headers -Method Get

if ($prs.Count -eq 0) {
    Write-Host "No open PR found for branch: $BranchName"
    exit 1
}

# Get the first PR (assuming one PR per branch)
$prNumber = $prs[0].number
Write-Host "Found PR #$prNumber for branch: $BranchName"

# Add comment to the PR
$commentUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/issues/$prNumber/comments"
$body = @{
    body = $Comment
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $commentUrl -Headers $headers -Method Post -Body $body -ContentType "application/json"
Write-Host "Comment added successfully to PR #$prNumber"
