param(
    [Parameter(Mandatory)]
    [string]$Comment,
    [Parameter(Mandatory)]
    [string]$BranchName,
    [Parameter(Mandatory)]
    [string]$GithubToken,
    [Parameter(Mandatory)]
    [string]$RepoOwner,
    [Parameter(Mandatory)]
    [string]$RepoName
)

$headers = @{
    Authorization = "token $GithubToken"
    Accept = "application/vnd.github.v3+json"
}

$pullsUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/pulls?state=open&head=${RepoOwner}:${BranchName}"
$pulls = Invoke-RestMethod -Uri $pullsUrl -Headers $headers -Method Get

if ($pulls.Count -eq 0) {
    throw "No open pull request found for branch '$BranchName'."
}

$pullRequestNumber = $pulls[0].number
$commentUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/issues/$pullRequestNumber/comments"
$body = @{ body = $Comment } | ConvertTo-Json

Invoke-RestMethod `
    -Uri $commentUrl `
    -Headers $headers `
    -Method Post `
    -Body $body `
    -ContentType "application/json" | Out-Null

Write-Host "Comment added to pull request #$pullRequestNumber."
