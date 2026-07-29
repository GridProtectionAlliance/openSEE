param(
    [string]$VersionFile
)

#Compare Versions
function CompareVersions {
    param(
        [string]$Version1,
        [string]$Version2
    )

    $array1 = $Version1.Split(".")
    $array2 = $Version2.Split(".")

    $i = 0
    while ($i -lt [Math]::Max($array1.Count, $array2.Count)) {
        if ($i -ge $array1.Count) {
            $v1 = 0
        } else {
            $v1 =  [int]$array1[$i]
        }
         if ($i -ge $array2.Count) {
            $v2 = 0
        } else {
            $v2 =  [int]$array2[$i]
        }
        if ($v1 -gt $v2) {
            return 1
        }
        if ($v2 -gt $v1) {
            return -1
        }
        $i++
    }
    return 0
}

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
