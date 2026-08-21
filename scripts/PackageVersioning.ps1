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

#Increment Version
function IncrementVersion {
   param(
        [string]$prevVersion
    )
    $array = $prevVersion.Split(".")
    $array[$array.Count - 1] =  [int]$array[$array.Count - 1] + 1
    return $array -join '.'
}

#Get Latest Version on Github
git fetch origin master:refs/remotes/origin/master
$commit = git rev-parse origin/master
$tag = git describe --tags --abbrev=0 $commit

if ([String]::IsNullOrEmpty($tag)) {
    Write-Host "No previous tag found"
    $tag = "v3.0.0"
}

$tag = $tag.TrimStart("v")

Write-Host "Last Published Version Found: $tag"


# Get Current Version
$currentVersion = $((Get-Content -Path $VersionFile | ConvertFrom-Json).version)
Write-Host "Current Version in Repository: $currentVersion"

# Check if Update is needed
if ((CompareVersions -Version1 $currentVersion -Version2 $tag) -gt 0) {
    Write-Host "No Version update neccesarry"
    return;
}

# Update Version
$updatedVersion = IncrementVersion -prevVersion $tag

Write-Host "Updating to $updatedVersion"

$content = [System.IO.File]::ReadAllText($VersionFile)
$versionPattern = [regex]'(?m)(^\s*"version"\s*:\s*")[^"]+("\s*,)'
$content = $versionPattern.Replace($content, {
    param($match)
    return $match.Groups[1].Value + $updatedVersion + $match.Groups[2].Value
}, 1)

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($VersionFile, $content, $utf8WithoutBom)
