[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ReleaseId,
    [string]$DemoRoot = 'C:\Users\phuctd7\qtkhcn-demo',
    [string]$JavaHome = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot',
    [int]$LivePort = 8090
)

# Cuts live traffic over to a release already built and health-checked by New-DemoRelease.ps1.
# This is the ONLY script that touches the live backend process / port 8090. It does not touch
# Caddy or Runlocal — Caddy always serves from the '$DemoRoot\current' junction (see
# Start-DemoProxy.ps1), so repointing the junction is enough; no Caddy reload needed once Caddy
# has been started against the junction path at least once.
#
# Live users are interrupted only for the few seconds between stopping the old backend and the
# new one finishing startup (Flyway + Spring context init). Confirm the deploy window with the
# human before running this against a release actually meant to go live.

$ErrorActionPreference = 'Stop'

$releasePath = Join-Path $DemoRoot "releases\$ReleaseId"
if (-not (Test-Path -LiteralPath $releasePath)) {
    throw "Release not found: $releasePath. Run New-DemoRelease.ps1 first."
}
$jar = Join-Path $releasePath 'backend\target\qtkhcn-backend.jar'
if (-not (Test-Path -LiteralPath $jar)) {
    throw "Release backend jar missing at $jar. Re-run New-DemoRelease.ps1."
}
$distIndex = Join-Path $releasePath 'frontend-angular\dist\frontend-angular\browser\index.html'
if (-not (Test-Path -LiteralPath $distIndex)) {
    throw "Release frontend build missing at $distIndex. Re-run New-DemoRelease.ps1."
}

$currentApiKey = [Environment]::GetEnvironmentVariable('QTKHCN_DEV_API_KEY', 'Process')
if ([string]::IsNullOrWhiteSpace($currentApiKey)) {
    throw "QTKHCN_DEV_API_KEY is not set in this terminal. Set it to the SAME value Caddy is currently injecting (infra/demo-tunnel/.env.local) so the new backend accepts proxied requests without touching Caddy."
}

Write-Host "Switching live demo to release '$ReleaseId'..." -ForegroundColor Cyan

$oldListener = Get-NetTCPConnection -LocalPort $LivePort -State Listen -ErrorAction SilentlyContinue
if ($oldListener) {
    $oldPid = $oldListener[0].OwningProcess
    Write-Host "Stopping current live backend (PID $oldPid, port $LivePort)..." -ForegroundColor Yellow
    Stop-Process -Id $oldPid -Force
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Milliseconds 500
        if (-not (Get-NetTCPConnection -LocalPort $LivePort -State Listen -ErrorAction SilentlyContinue)) { break }
    }
    if (Get-NetTCPConnection -LocalPort $LivePort -State Listen -ErrorAction SilentlyContinue) {
        throw "Old backend on port $LivePort did not release the port in time. Aborting before starting the new one."
    }
} else {
    Write-Host "No process currently listening on $LivePort (first cutover?)." -ForegroundColor Yellow
}

Write-Host "Starting release backend on port $LivePort..." -ForegroundColor Cyan
Start-Process -FilePath "$JavaHome\bin\java.exe" `
    -ArgumentList @(
        '-jar', 'target\qtkhcn-backend.jar',
        "--server.port=$LivePort",
        '--server.address=127.0.0.1',
        "--qtkhcn.dev-api-key=$currentApiKey"
    ) `
    -WorkingDirectory (Join-Path $releasePath 'backend') `
    -WindowStyle Hidden

$started = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$LivePort/api/ho-so" `
            -Headers @{ 'X-QTKHCN-Dev-Key' = $currentApiKey } -TimeoutSec 5
        if ($r.StatusCode -eq 200) { $started = $true; break }
    } catch { }
}
if (-not $started) {
    throw "New backend did not become healthy on port $LivePort. Check logs; the live demo may be DOWN — investigate immediately. The old release is still available for manual rollback: $DemoRoot\releases\"
}
Write-Host "New backend on port $LivePort is healthy." -ForegroundColor Green

$currentLink = Join-Path $DemoRoot 'current'
if (Test-Path -LiteralPath $currentLink) {
    Remove-Item -LiteralPath $currentLink -Force
}
New-Item -ItemType Junction -Path $currentLink -Target $releasePath | Out-Null
Write-Host "'current' now points to $releasePath" -ForegroundColor Green

Write-Host ''
Write-Host "Cutover complete: $ReleaseId is now live on port $LivePort." -ForegroundColor Green
Write-Host 'Run Test-DemoReadiness.ps1 and check https://<runlocal-subdomain>.runlocal.eu from an outside network before considering this done.'
