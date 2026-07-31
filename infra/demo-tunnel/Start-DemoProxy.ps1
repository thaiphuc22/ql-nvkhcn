[CmdletBinding()]
param(
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',
    [int]$HoSoServicePort = 8093,
    [int]$IdentityServicePort = 8095
)

$ErrorActionPreference = 'Stop'
$caddyfile = Join-Path $PSScriptRoot 'Caddyfile'
$distRoot = Join-Path $ReleaseRoot 'frontend-angular\dist\frontend-angular\browser'

if (-not (Test-Path -LiteralPath $ReleaseRoot)) {
    throw "Release root not found at '$ReleaseRoot'. Run New-DemoRelease.ps1 and Switch-DemoRelease.ps1 first."
}
if (-not (Get-Command caddy -ErrorAction SilentlyContinue)) {
    throw "Command 'caddy' was not found in PATH. See infra/demo-tunnel/README.md."
}
if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) {
    throw "Angular demo build is missing at '$distRoot'. Build the demo configuration first."
}
foreach ($name in @('DEMO_BASIC_AUTH_HASH', 'QTKHCN_DEV_API_KEY', 'QTKHCN_HO_SO_SERVICE_TOKEN')) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
        throw "Environment variable $name is missing from the current terminal."
    }
}

$health = Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness" -TimeoutSec 5
if ($health.status -ne 'UP') { throw "Ho So service readiness is '$($health.status)'." }
Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/api/ho-so" `
    -Headers @{ Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN" } -TimeoutSec 10 | Out-Null

$identityHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$IdentityServicePort/actuator/health/readiness" -TimeoutSec 5
if ($identityHealth.status -ne 'UP') { throw "Identity service readiness is '$($identityHealth.status)'." }

$env:DEMO_STATIC_ROOT = $distRoot.Replace('\', '/')
$env:QTKHCN_HO_SO_UPSTREAM = "127.0.0.1:$HoSoServicePort"
$env:QTKHCN_IDENTITY_UPSTREAM = "127.0.0.1:$IdentityServicePort"

& caddy validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed.' }

Write-Host 'Caddy is serving the demo at http://127.0.0.1:8443' -ForegroundColor Green
Write-Host "NV KHCN/Ho So API -> $env:QTKHCN_HO_SO_UPSTREAM (mandatory)" -ForegroundColor Cyan
Write-Host "Identity API (Phan he 2) -> $env:QTKHCN_IDENTITY_UPSTREAM (mandatory)" -ForegroundColor Cyan
Write-Host 'Workflow/task API -> 127.0.0.1:8090' -ForegroundColor Cyan
Write-Host 'Keep this terminal open. Press Ctrl+C to stop the proxy.'
& caddy run --config $caddyfile --adapter caddyfile
