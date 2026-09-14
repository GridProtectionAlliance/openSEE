param(
    [string]$VersionFile
)

#Write Version
function UpdateVersion {
   param(
        [string]$VersionFile,
        [string]$Version,
        [string]$VariableName
    )

    $content = Get-Content -LiteralPath $VersionFile -Raw -Encoding UTF8

    $pattern = "(<$VariableName>)([^<]+)(</$VariableName>)"
    $newContent = [regex]::Replace($content, $pattern, "`${1}$version`${3}")

    if ($newContent -eq $content) {
        return 0;
    }

    Set-Content -LiteralPath $VersionFile -Value $newContent -Encoding UTF8 -NoNewline
    return 1
}

$changedFiles = 0;
# Find all CSProje Files
$currentConsolePath = Get-Location
$savePath = Join-Path -Path $currentConsolePath -ChildPath $SlnFolder


#Update all Gemstone References

#Get Latest Version on Github
$RepoState = git ls-remote --sort='version:refname' --tags https://github.com/gemstone/common.git | Select-Object -Last 1
$regex = [regex]".+refs\/tags\/v([0-9]+\.[0-9]+\.[0-9]+)"

$matchesCollection = $regex.Matches($RepoState)

$latestVersion = $matchesCollection[0].Groups[1].Value

echo "Found Lastest Common Gemstone Version on GitHub: $latestVersion"

$changedFiles = UpdateVersion -VersionFile $VersionFile -VariableName "GemstoneVersion" -Version $latestVersion

echo "Updated $changedFiles Dependecies in $VersionFile"
