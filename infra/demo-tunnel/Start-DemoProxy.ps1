[CmdletBinding()]
param(
    # Root of the release tree (see New-DemoRelease.ps1 / Switch-DemoRelease.ps1). Defaults to the
    # stable 'current' junction so this script never needs to know about individual release IDs.
    # Do NOT point this at the dev workspace (this repo) - the live demo must always be served from
    # a separate release checkout, see docs/plan_deploy/standard-deploy-workflow.md.
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',

    # OFF by default. Enable only after snapshot parity and contract comparison have passed and the
    # read-only Ho So service is already healthy on the configured loopback port.
    [switch]$EnableHoSoReadRoute,
    [int]$HoSoServicePort = 8093
)

$ErrorActionPreference = 'Stop'
$caddyfile = Join-Path $PSScriptRoot 'Caddyfile'
$distRoot = Join-Path $ReleaseRoot 'frontend-angular\dist\frontend-angular\browser'

if (-not (Test-Path -LiteralPath $ReleaseRoot)) {
    throw "Release root not found at '$ReleaseRoot'. Run New-DemoRelease.ps1 and Switch-DemoRelease.ps1 first."
}

foreach ($command in @('caddy')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Command '$command' was not found in PATH. See infra/demo-tunnel/README.md."
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) {
    throw "Angular demo build is missing at '$distRoot'. Build the demo configuration first."
}

foreach ($name in @('DEMO_BASIC_AUTH_HASH', 'QTKHCN_DEV_API_KEY')) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Environment variable $name is missing from the current terminal."
    }
}

$env:DEMO_STATIC_ROOT = $distRoot.Replace('\', '/')
$env:QTKHCN_HO_SO_READ_UPSTREAM = '127.0.0.1:8090'
if ($EnableHoSoReadRoute) {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        throw 'QTKHCN_HO_SO_SERVICE_TOKEN is required when -EnableHoSoReadRoute is used.'
    }
    try {
        $health = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness"
        if ($health.status -ne 'UP') { throw "Unexpected readiness status: $($health.status)" }
        Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:$HoSoServicePort/api/ho-so" `
            -Headers @{ Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN" } | Out-Null
    }
    catch {
        throw "Ho So read route remains OFF because the service readiness/API check failed: $($_.Exception.Message)"
    }
    $env:QTKHCN_HO_SO_READ_UPSTREAM = "127.0.0.1:$HoSoServicePort"
}
elseif ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
    # Caddy requires the placeholder to exist, but the value is unused while reads stay on 8090.
    $env:QTKHCN_HO_SO_SERVICE_TOKEN = 'read-route-disabled'
}

& caddy validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed.' }

Write-Host "Caddy is serving the demo at http://127.0.0.1:8443" -ForegroundColor Green
Write-Host "Ho So read route: $(if ($EnableHoSoReadRoute) { 'NEW SERVICE' } else { 'MONOLITH (default OFF)' })" -ForegroundColor Cyan
Write-Host 'Keep this terminal open. Press Ctrl+C to stop the proxy.'
& caddy run --config $caddyfile --adapter caddyfile
