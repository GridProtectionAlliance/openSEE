# Call the script with the path to the project directory as an argument:
#     .\build-panel.ps1 "C:\Projects\SystemCenter\Source\Applications\SystemCenter"

# Uncomment the following line to hardcode the project directory for testing
#$projectDir = "D:\Projects\SystemCenter\Source\Applications\SystemCenter\"

param(
    [string]$projectDir,
    [string]$buildConfig = "Release"
)

# Validate script parameters
if ([string]::IsNullOrWhiteSpace($projectDir)) {
    throw "projectDir parameter was not provided, script terminated."
}

function Install-NPM {
	"Installing NPM"
	npm install
	"Installed NPM Succesfully"
}

function Build-TS {
	"Building TypeScript"
	$mode = $buildConfig
	if ($mode = "release") {
		$mode = "production"
	}
	"Build set to mode $mode"
	.\node_modules\.bin\webpack  --mode=$mode
	
	"Built TypeScript"
}

function Remove-NPM {
	"Remove NPM"
	mkdir "tmp"
	robocopy /MIR .\tmp .\node_modules > NULL
	Remove-Item '.\node_modules' -Recurse
	Remove-Item '.\tmp' -Recurse
}

Set-Location "$projectDir"
Install-NPM
Build-TS
Remove-NPM