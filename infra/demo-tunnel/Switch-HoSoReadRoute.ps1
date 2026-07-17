[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Canary', 'Monolith')]
    [string]$Target,
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',
    [int]$HoSoServicePort = 8093,
    [string]$CaddyExe
)

# Reloads only the read-route upstream. It never stops Caddy, Runlocal, the monolith, or Angular.
# The caller must provide secrets through process environment; no secret is read from or written to
# tracked files by this script.

$ErrorActionPreference = 'Stop'
$caddyfile = Join-Path $PSScriptRoot 'Caddyfile'
$distRoot = Join-Path $ReleaseRoot 'frontend-angular\dist\frontend-angular\browser'

if ([string]::IsNullOrWhiteSpace($CaddyExe)) {
    $caddyCommand = Get-Command caddy -ErrorAction SilentlyContinue
    if ($caddyCommand) {
        $CaddyExe = $caddyCommand.Source
    }
    else {
        $liveCaddy = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'caddy.exe' } |
            Select-Object -First 1
        if ($liveCaddy) { $CaddyExe = $liveCaddy.ExecutablePath }
    }
}
if ([string]::IsNullOrWhiteSpace($CaddyExe) -or -not (Test-Path -LiteralPath $CaddyExe)) {
    throw 'Caddy executable was not found. Pass -CaddyExe explicitly.'
}

if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) {
    throw "Angular release is missing below '$distRoot'."
}
foreach ($name in @('DEMO_BASIC_AUTH_HASH', 'QTKHCN_DEV_API_KEY')) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
        throw "Environment variable $name is required."
    }
}

$env:DEMO_STATIC_ROOT = $distRoot.Replace('\', '/')
$expectedUpstream = '127.0.0.1:8090'

if ($Target -eq 'Canary') {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        throw 'QTKHCN_HO_SO_SERVICE_TOKEN is required for the canary route.'
    }
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness" -TimeoutSec 5
        if ($health.status -ne 'UP') { throw "Unexpected readiness status '$($health.status)'." }
        Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/api/ho-so" `
            -Headers @{ Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN" } -TimeoutSec 10 | Out-Null
    }
    catch {
        throw "Read route remains unchanged because the service gate failed: $($_.Exception.Message)"
    }
    $expectedUpstream = "127.0.0.1:$HoSoServicePort"
    $env:QTKHCN_HO_SO_READ_UPSTREAM = $expectedUpstream
}
else {
    $env:QTKHCN_HO_SO_READ_UPSTREAM = $expectedUpstream
    # The placeholder is required while adapting the Caddyfile but is not used by the monolith route.
    # Preserve a real token so a bounded canary can be opened again from the same parent process.
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        $env:QTKHCN_HO_SO_SERVICE_TOKEN = 'read-route-disabled'
    }
}

& $CaddyExe validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed; live configuration was not changed.' }
& $CaddyExe reload --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy reload failed.' }

$configJson = Invoke-RestMethod -Uri 'http://127.0.0.1:2019/config/' -TimeoutSec 5 | ConvertTo-Json -Depth 30 -Compress
if ($configJson -notmatch [regex]::Escape($expectedUpstream)) {
    throw "Caddy reloaded, but admin config does not contain expected upstream $expectedUpstream."
}

try {
    Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8443/api/ho-so' -TimeoutSec 5 | Out-Null
    throw 'Basic Auth gate unexpectedly allowed an unauthenticated request.'
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -ne 401) { throw }
}

Write-Host "[PASS] Ho So GET route -> $expectedUpstream; Caddy reloaded; unauthenticated gateway request remains 401." -ForegroundColor Green
