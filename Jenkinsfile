import hudson.model.Result
import jenkins.model.CauseOfInterruption
import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

def haltBuildWithSuccess() {
    currentBuild.rawBuild.@result = Result.SUCCESS
    def cause = new CauseOfInterruption.UserInterruption("Build halted programmatically with SUCCESS status")
    throw new FlowInterruptedException(Result.SUCCESS, false, cause)
}

pipeline {
    agent any

    environment {
        github_pat = credentials('github-pat')
        devBranch = "development"
        mainBranch = "master"
        NUGET_PACKAGES = "D:\\NuGetCache"
        publishDirectory = "${WORKSPACE}\\build\\Jenkins\\publish"
        artifactDirectory = "${WORKSPACE}\\build\\Jenkins\\artifacts"
        deliveryDirectory = "\\\\webhostfiles\\Delivery\\openSEE"
    }

    stages {
        stage('Prepare Environment') {
            steps {
                script {
                    // Set current Version
                    def fileContent = powershell(returnStdout: true, script:  '''
                        Get-Content -Path "./scripts/OpenSEE.version" -Raw
                    ''').trim()
                    env.openSEEVersion = fileContent
                    println("openSEE version: ${env.openSEEVersion}")
                }
                script {
                    //Set current Commit
                    env.GIT_COMMIT = bat(script: '@git rev-parse HEAD', returnStdout: true).trim()
                    println("Current Git Commit: ${env.GIT_COMMIT}")
                }
                script {
                    //Get last release from git tags
                    bat( script: "@git fetch origin ${env.mainBranch}:refs/remotes/origin/${env.mainBranch}")
                    def mainCommit = bat(script: "@git rev-parse origin/${env.mainBranch}", returnStdout: true).trim()
                    try {
                        env.LAST_RELEASE_TAG = bat(script: "@git describe --tags --abbrev=0 ${mainCommit}", returnStdout: true).trim()
                    }
                    catch (Exception ex) {
                        println("No tags found, setting LAST_RELEASE_TAG to v2.0.0")
                        env.LAST_RELEASE_TAG = "v2.0.0"
                    }
                    println("Last Release Tag: ${env.LAST_RELEASE_TAG}")
                }
            }
        }

        stage('Check Conditions') {
            when {
                anyOf {
                    not {
                        anyOf {
                            expression { env.BRANCH_NAME.startsWith("PR") }
                            expression { env.BRANCH_NAME == "${env.mainBranch}" }
                        }
                    }
                    allOf {
                        expression { env.BRANCH_NAME.startsWith("PR") }
                        expression { env.CHANGE_BRANCH != "${env.devBranch}" }
                    }
                    allOf {
                        expression { env.BRANCH_NAME.startsWith("PR") }
                        expression { env.CHANGE_TARGET != "${env.mainBranch}" }
                    }
                }
            }
            steps {
                haltBuildWithSuccess()
            }
        }

        stage('Checkout Master Branch') {
            when {
                expression {
                    return env.BRANCH_NAME == "${env.mainBranch}"
                }
            }
            steps {
                script {
                    bat(script: "@git fetch origin ${env.BRANCH_NAME}:refs/remotes/origin/${env.BRANCH_NAME}")
                    bat(script: "@git checkout origin/${env.BRANCH_NAME}")
                }
            }
        }

        stage('Checkout Development Branch') {
            when {
                expression {
                    return env.CHANGE_BRANCH == "${env.devBranch}"
                }
            }
            steps {
                script {
                    bat(script: "@git fetch origin ${env.CHANGE_BRANCH}:refs/remotes/origin/${env.CHANGE_BRANCH}")
                    bat(script: "@git checkout origin/${env.CHANGE_BRANCH}")
                }
            }
        }

        stage('Application Version') {
            when {
                expression {
                    return env.BRANCH_NAME != "${env.mainBranch}"
                }
            }
            steps {
                script {
                    env.GIT_COMMIT = bat(script: '@git rev-parse HEAD', returnStdout: true).trim()
                }
                powershell "powershell.exe -File .\\scripts\\Versioning.ps1 -VersionFile './scripts/OpenSEE.version' -Commit false"
                bat(script: "@git add scripts/OpenSEE.version")
                bat(script: "git diff --cached --quiet || git commit -m \"Updated Version Number\"")
            }
        }

        stage('Gemstone Updates') {
            when {
                expression {
                    return env.BRANCH_NAME != "${env.mainBranch}"
                }
            }
            steps {
                powershell "powershell.exe -File .\\scripts\\GemstoneUpdates.ps1 -VersionFile './src/Directory.Build.props'"
                powershell "powershell.exe -File .\\scripts\\CreateDependencyPR.ps1 -GithubToken '${github_pat}' -DevelopmentBranchName '${devBranch}'"
                script {
                    bat(script: "@git add src/Directory.Build.props")
                    bat(script: "git diff --cached --quiet || git commit -m \"Updated Dependencies\"")
                }
            }
        }

        stage('Push Changes') {
            when {
                allOf {
                    expression {
                        return env.BRANCH_NAME != "${env.mainBranch}"
                    }
                    expression {
                        return bat(script: '@git rev-parse HEAD', returnStdout: true).trim() != env.GIT_COMMIT
                    }
                }
            }
            steps {
                powershell "git push origin HEAD:${env.devBranch}"
                haltBuildWithSuccess()
            }
        }

        stage('Build Production UI') {
            steps {
                dir('src/OpenSEE') {
                    bat(script: 'npm run build')
                    powershell """
                        \$uiFile = '.\\wwwroot\\Scripts\\OpenSee.js'
                        if (-not (Test-Path -LiteralPath \$uiFile -PathType Leaf) -or
                            (Get-Item -LiteralPath \$uiFile).Length -eq 0) {
                            throw 'Production UI was not generated.'
                        }
                    """
                }
            }
        }

        stage('Build Docker Images') {
            when {
                anyOf {
                    expression {
                        return env.CHANGE_BRANCH == "${env.devBranch}"
                    }
                    expression {
                        return env.BRANCH_NAME == "${env.mainBranch}"
                    }
                }
            }
            steps {
                script {
                    env.openSEEDockerTag = env.CHANGE_BRANCH == "${env.devBranch}" ? "${env.openSEEVersion}a" : env.openSEEVersion
                    println("Building openSEE Docker image tag: opensee:${env.openSEEDockerTag}")
                }

                powershell "msbuild /t:Publish /p:DeployOnBuild=true';'Configuration=Release';'PublishProfile='Docker Release Profile openSEE' './src/OpenSEE/OpenSEE.csproj' /nodeReuse:false -restore"
                powershell "docker build --build-arg CONFIGURATION=Release -f .\\openSEE.dockerfile -t opensee:${env.openSEEDockerTag} ."
            }
        }

        stage('Publish Application') {
            steps {
                powershell """
                    if (Test-Path -LiteralPath '${env.publishDirectory}') {
                        Remove-Item -LiteralPath '${env.publishDirectory}' -Recurse -Force
                    }
                    New-Item -ItemType Directory -Path '${env.publishDirectory}' -Force | Out-Null
                    dotnet publish '.\\src\\OpenSEE\\OpenSEE.csproj' `
                        -c Release `
                        -r win-x64 `
                        --self-contained true `
                        -o '${env.publishDirectory}'
                    if (\$LASTEXITCODE -ne 0) {
                        throw 'dotnet publish failed.'
                    }

                    \$requiredFiles = @(
                        '${env.publishDirectory}\\OpenSEE.exe',
                        '${env.publishDirectory}\\OpenSEE.dll',
                        '${env.publishDirectory}\\wwwroot\\Scripts\\OpenSee.js'
                    )
                    foreach (\$requiredFile in \$requiredFiles) {
                        if (-not (Test-Path -LiteralPath \$requiredFile -PathType Leaf) -or
                            (Get-Item -LiteralPath \$requiredFile).Length -eq 0) {
                            throw "Required publish output is missing: \$requiredFile"
                        }
                    }
                """
            }
        }

        stage('Package Application') {
            steps {
                script {
                    env.archiveName = env.BRANCH_NAME == "${env.mainBranch}" ?
                        "openSEE_v${env.openSEEVersion}.zip" :
                        "openSEE_v${env.openSEEVersion}a.zip"
                }
                powershell """
                    if (Test-Path -LiteralPath '${env.artifactDirectory}') {
                        Remove-Item -LiteralPath '${env.artifactDirectory}' -Recurse -Force
                    }
                    New-Item -ItemType Directory -Path '${env.artifactDirectory}' -Force | Out-Null

                    Compress-Archive `
                        -Path '${env.publishDirectory}\\*' `
                        -DestinationPath '${env.artifactDirectory}\\${env.archiveName}' `
                        -Force
                    if (-not (Test-Path -LiteralPath '${env.artifactDirectory}\\${env.archiveName}' -PathType Leaf)) {
                        throw 'Release archive was not created.'
                    }
                """
            }
        }

        stage('Comment Prerelease') {
            when {
                expression {
                    return env.CHANGE_BRANCH == "${env.devBranch}"
                }
            }
            steps {
                powershell """
                    powershell.exe -File .\\scripts\\GithubComment.ps1 `
                        -Comment 'Prerelease openSEE v${env.openSEEVersion}a is available.' `
                        -BranchName '${env.devBranch}' `
                        -GithubToken '${github_pat}' `
                        -RepoOwner 'GridProtectionAlliance' `
                        -RepoName 'openSEE'
                """
            }
        }

        stage('Deploy Prerelease') {
            when {
                expression {
                    return env.CHANGE_BRANCH == "${env.devBranch}"
                }
            }
            steps {
                powershell "Move-Item -Path '${env.artifactDirectory}\\${env.archiveName}' -Destination '${env.deliveryDirectory}\\PreRelease\\${env.archiveName}' -Force"
            }
        }

        stage('Deploy Release') {
            when {
                allOf {
                    expression {
                        return env.BRANCH_NAME == "${env.mainBranch}"
                    }
                    expression {
                        return env.openSEEVersion != env.LAST_RELEASE_TAG
                    }
                }
            }
            steps {
                powershell "Move-Item -Path '${env.artifactDirectory}\\${env.archiveName}' -Destination '${env.deliveryDirectory}\\${env.archiveName}' -Force"
                powershell "git tag -a v${env.openSEEVersion} -m 'Version ${env.openSEEVersion} release'"
                powershell "git push origin --tags"
            }
        }
    }
}
