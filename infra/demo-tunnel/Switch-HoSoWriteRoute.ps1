[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Service', 'Monolith')]
    [string]$Target,
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',
    [int]$HoSoServicePort = 8093,
    [string]$CaddyExe
)

# Switches business CRUD and Slice 4 POST /submit. POST /actions remains on the process service.
$ErrorActionPreference = 'Stop'
$caddyfile = Join-Path $PSScriptRoot 'Caddyfile'
$distRoot = Join-Path $ReleaseRoot 'frontend-angular\dist\frontend-angular\browser'

if ([string]::IsNullOrWhiteSpace($CaddyExe)) {
    $command = Get-Command caddy -ErrorAction SilentlyContinue
    if ($command) { $CaddyExe = $command.Source }
    else {
        $live = Get-CimInstance Win32_Process | Where-Object Name -eq 'caddy.exe' | Select-Object -First 1
        if ($live) { $CaddyExe = $live.ExecutablePath }
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
$env:QTKHCN_MY_TASKS_UPSTREAM = if ([string]::IsNullOrWhiteSpace($env:QTKHCN_MY_TASKS_UPSTREAM)) {
    '127.0.0.1:8090'
} else { $env:QTKHCN_MY_TASKS_UPSTREAM }
if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_READ_UPSTREAM)) {
    $env:QTKHCN_HO_SO_READ_UPSTREAM = '127.0.0.1:8090'
}
$expectedUpstream = '127.0.0.1:8090'
if ($Target -eq 'Service') {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        throw 'QTKHCN_HO_SO_SERVICE_TOKEN is required for the service write route.'
    }
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness" -TimeoutSec 5
    if ($health.status -ne 'UP') { throw "Ho So service readiness is '$($health.status)'." }
    Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/api/ho-so" `
        -Headers @{ Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN" } -TimeoutSec 10 | Out-Null
    $legacyStatus = 0
    try {
        Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://127.0.0.1:8090/api/nhiem-vu' `
            -Headers @{ 'X-QTKHCN-Dev-Key' = $env:QTKHCN_DEV_API_KEY } `
            -ContentType 'application/json' -Body '{}' -TimeoutSec 5 | Out-Null
    }
    catch { $legacyStatus = [int]$_.Exception.Response.StatusCode }
    if ($legacyStatus -ne 409) {
        throw 'Legacy write guard is not active. Restart the monolith with QTKHCN_HO_SO_LEGACY_WRITES_ENABLED=false first.'
    }
    $expectedUpstream = "127.0.0.1:$HoSoServicePort"
} else {
    $legacyStatus = 0
    try {
        Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://127.0.0.1:8090/api/nhiem-vu' `
            -Headers @{ 'X-QTKHCN-Dev-Key' = $env:QTKHCN_DEV_API_KEY } `
            -ContentType 'application/json' -Body '{}' -TimeoutSec 5 | Out-Null
    }
    catch { $legacyStatus = [int]$_.Exception.Response.StatusCode }
    if ($legacyStatus -eq 409) {
        throw 'Legacy writes are still disabled. Restart the monolith with QTKHCN_HO_SO_LEGACY_WRITES_ENABLED=true before rollback.'
    }
    if ($legacyStatus -ne 400) {
        throw "Unexpected legacy write probe status $legacyStatus; route was not changed."
    }
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        $env:QTKHCN_HO_SO_SERVICE_TOKEN = 'write-route-disabled'
    }
}
$env:QTKHCN_HO_SO_WRITE_UPSTREAM = $expectedUpstream

& $CaddyExe validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed; live configuration was not changed.' }
& $CaddyExe reload --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy reload failed.' }

$config = Invoke-RestMethod -Uri 'http://127.0.0.1:2019/config/' -TimeoutSec 5 | ConvertTo-Json -Depth 30 -Compress
if ($config -notmatch [regex]::Escape($expectedUpstream)) {
    throw "Caddy admin config does not contain expected write upstream $expectedUpstream."
}
Write-Host "[PASS] Ho So business writes + submit -> $expectedUpstream; actions remain on monolith." -ForegroundColor Green
