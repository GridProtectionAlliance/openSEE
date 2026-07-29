param(
    [Parameter(Mandatory)]
    [string]$VersionFile
)

$repositoryState = git ls-remote --sort='version:refname' --tags https://github.com/gemstone/common.git 'v*'
if ($LASTEXITCODE -ne 0) {
    throw "Unable to query Gemstone releases."
}

$versions = @(
    $repositoryState |
        ForEach-Object {
            if ($_ -match 'refs/tags/v(?<Version>\d+\.\d+\.\d+)$') {
                [version]$Matches.Version
            }
        }
)

if ($versions.Count -eq 0) {
    throw "No three-part Gemstone release tags were found."
}

$latestVersion = ($versions | Sort-Object -Descending | Select-Object -First 1).ToString()
$content = Get-Content -LiteralPath $VersionFile -Raw -Encoding UTF8
$updatedContent = [regex]::Replace(
    $content,
    '(<GemstoneVersion>)[^<]+(</GemstoneVersion>)',
    "`${1}$latestVersion`${2}"
)

if ($updatedContent -eq $content) {
    Write-Host "Gemstone is already at version $latestVersion."
    return
}

Set-Content -LiteralPath $VersionFile -Value $updatedContent -Encoding UTF8 -NoNewline
Write-Host "Updated Gemstone to version $latestVersion."
