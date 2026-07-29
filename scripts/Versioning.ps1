param(
    [Parameter(Mandatory)]
    [string]$VersionFile,
    [string]$MainBranch = "master",
    [string]$Remote = "origin"
)

function ConvertTo-FourPartVersion {
    param([string]$Tag)

    if ($Tag -notmatch '^v(?<Version>\d+\.\d+\.\d+\.\d+)$') {
        return $null
    }

    return [version]$Matches.Version
}

function Get-NextVersion {
    param(
        [version]$CurrentVersion,
        [version[]]$ReleaseVersions
    )

    if ($ReleaseVersions.Count -eq 0) {
        return $CurrentVersion
    }

    $latestRelease = $ReleaseVersions | Sort-Object -Descending | Select-Object -First 1

    if ($CurrentVersion -gt $latestRelease) {
        return $CurrentVersion
    }

    return [version]::new(
        $latestRelease.Major,
        $latestRelease.Minor,
        $latestRelease.Build,
        $latestRelease.Revision + 1
    )
}

git fetch $Remote "${MainBranch}:refs/remotes/$Remote/$MainBranch"
if ($LASTEXITCODE -ne 0) {
    throw "Unable to fetch $Remote/$MainBranch."
}

$mainCommit = git rev-parse "refs/remotes/$Remote/$MainBranch"
if ($LASTEXITCODE -ne 0) {
    throw "Unable to resolve $Remote/$MainBranch."
}

$releaseVersions = @(
    git tag --merged $mainCommit |
        ForEach-Object { ConvertTo-FourPartVersion -Tag $_ } |
        Where-Object { $null -ne $_ }
)

$currentVersion = [version]([System.IO.File]::ReadAllText($VersionFile).Trim())
$nextVersion = Get-NextVersion -CurrentVersion $currentVersion -ReleaseVersions $releaseVersions

Write-Host "Current repository version: $currentVersion"

if ($nextVersion -eq $currentVersion) {
    Write-Host "Version is already ahead of the latest four-part release tag."
    return
}

Write-Host "Advancing version to $nextVersion"
[System.IO.File]::WriteAllText($VersionFile, $nextVersion.ToString())
