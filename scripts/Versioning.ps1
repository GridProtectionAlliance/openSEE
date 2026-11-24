param(
    [string]$VersionFile,
    [string]$Commit
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

$Commit = [System.Convert]::ToBoolean($Commit)

#Get Latest Version on Github
git fetch origin master:refs/remotes/origin/master
$commit = git rev-parse origin/master
$tag = git describe --tags --abbrev=0 $commit

if ([String]::IsNullOrEmpty($tag)) {
    echo "No previous tag found"
    $tag = "v3.0.0"
}

$tag = $tag.TrimStart("v")

echo "Last Published Version Found: $tag"


# Get Current Version
$currentVersion = $([System.IO.File]::ReadAllText($VersionFile).Trim())
echo "Current Version in Repository: $currentVersion"

# Check if Update is needed
if ((CompareVersions -Version1 $currentVersion -Version2 $tag) -gt 0) {
    echo "No Version update neccesarry"
    return;
}

# Update Version
$updatedVersion = IncrementVersion -prevVersion $tag

echo "Updating to $updatedVersion"

[System.IO.File]::WriteAllText($VersionFile, $updatedVersion)
