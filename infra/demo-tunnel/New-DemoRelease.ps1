[CmdletBinding()]
param(
    # Git ref to release. Defaults to HEAD of this dev workspace's checked-out branch.
    [string]$Commit = 'HEAD',
    [string]$DemoRoot = 'C:\Users\phuctd7\qtkhcn-demo',
    [string]$JavaHome = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot',
    [string]$MavenHome = 'C:\Users\phuctd7\apache-maven-3.9.16',
    [int]$HealthCheckPort = 8091
)

# Builds a new demo release into its own worktree WITHOUT touching the live demo (port 8090,
# Caddy, Runlocal). Verifies the build, then leaves it for Switch-DemoRelease.ps1 to cut traffic
# over. See docs/plan_deploy/standard-deploy-workflow.md for the full release/cutover design.

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$env:JAVA_HOME = $JavaHome
$env:Path = "$MavenHome\bin;$env:Path"

Push-Location $repoRoot
try {
    $sha = (& git rev-parse --short=7 $Commit).Trim()
    if ($LASTEXITCODE -ne 0) { throw "Could not resolve commit '$Commit'." }

    $status = & git status --porcelain
    if ($Commit -eq 'HEAD' -and $status) {
        throw "Working tree is not clean. Commit or stash changes before cutting a release (gate 3.1)."
    }

    $dateStamp = Get-Date -Format 'yyyy-MM-dd'
    $releasesDir = Join-Path $DemoRoot 'releases'
    New-Item -ItemType Directory -Path $releasesDir -Force | Out-Null

    $seq = 1
    do {
        $releaseId = "$dateStamp.$seq" + "_$sha"
        $releasePath = Join-Path $releasesDir $releaseId
        $seq++
    } while (Test-Path -LiteralPath $releasePath)

    Write-Host "Creating release worktree: $releaseId" -ForegroundColor Cyan
    & git worktree add --detach $releasePath $sha
    if ($LASTEXITCODE -ne 0) { throw 'git worktree add failed.' }

    Write-Host 'Building backend (mvn -o package)...' -ForegroundColor Cyan
    Push-Location (Join-Path $releasePath 'backend')
    try {
        & mvn -o -q package
        if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
    } finally { Pop-Location }

    $jar = Join-Path $releasePath 'backend\target\qtkhcn-backend.jar'
    if (-not (Test-Path -LiteralPath $jar)) { throw "Backend jar not found at $jar after build." }

    Write-Host 'Building frontend (npm ci + ng build production,demo)...' -ForegroundColor Cyan
    Push-Location (Join-Path $releasePath 'frontend-angular')
    try {
        & npm ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
        & npx ng build --configuration=production,demo
        if ($LASTEXITCODE -ne 0) { throw 'Angular demo build failed.' }
    } finally { Pop-Location }

    $distRoot = Join-Path $releasePath 'frontend-angular\dist\frontend-angular\browser'
    if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) {
        throw "Angular build output missing at $distRoot."
    }

    Write-Host 'Checking demo bundle does not leak dev secrets...' -ForegroundColor Cyan
    $leaks = Get-ChildItem -Path $distRoot -Filter '*.js' -Recurse |
        Select-String -Pattern 'localhost:8090', 'dev-local-only' -SimpleMatch
    if ($leaks) {
        $leaks | ForEach-Object { Write-Host "  LEAK: $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
        throw 'Demo bundle contains dev-only values. Aborting release.'
    }

    Write-Host "Health-checking backend on temp port $HealthCheckPort (isolated from live 8090)..." -ForegroundColor Cyan
    $tempKey = [guid]::NewGuid().ToString('N')
    $proc = Start-Process -FilePath "$JavaHome\bin\java.exe" `
        -ArgumentList @(
            '-jar', 'target\qtkhcn-backend.jar',
            "--server.port=$HealthCheckPort",
            '--server.address=127.0.0.1',
            "--qtkhcn.dev-api-key=$tempKey"
        ) `
        -WorkingDirectory (Join-Path $releasePath 'backend') `
        -PassThru -WindowStyle Hidden

    try {
        $healthy = $false
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Seconds 2
            try {
                $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$HealthCheckPort/api/ho-so" `
                    -Headers @{ 'X-QTKHCN-Dev-Key' = $tempKey } -TimeoutSec 5
                if ($r.StatusCode -eq 200) { $healthy = $true; break }
            } catch { }
        }
        if (-not $healthy) { throw 'Release backend failed health check on temp port.' }
        Write-Host 'Health check PASSED.' -ForegroundColor Green
    } finally {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }

    Write-Host ''
    Write-Host "Release '$releaseId' built and verified at $releasePath" -ForegroundColor Green
    Write-Host "Nothing on the live demo (port 8090, Caddy, Runlocal) was touched." -ForegroundColor Green
    Write-Host "Next: .\infra\demo-tunnel\Switch-DemoRelease.ps1 -ReleaseId '$releaseId'"
} finally {
    Pop-Location
}
