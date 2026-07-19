[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Service', 'Monolith')]
    [string]$Target,
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',
    [int]$HoSoServicePort = 8093,
    [string]$HoSoReadUpstream = $env:QTKHCN_HO_SO_READ_UPSTREAM,
    [string]$HoSoWriteUpstream = $env:QTKHCN_HO_SO_WRITE_UPSTREAM,
    [string]$CaddyExe
)

# Performs an explicit, independently reversible cutover for GET /api/my-tasks.
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
if ([string]::IsNullOrWhiteSpace($HoSoReadUpstream) -or [string]::IsNullOrWhiteSpace($HoSoWriteUpstream)) {
    throw @'
Both -HoSoReadUpstream and -HoSoWriteUpstream are required. Set them to the currently active
upstreams so switching My Tasks cannot silently change another gateway seam.
'@
}
$env:QTKHCN_HO_SO_READ_UPSTREAM = $HoSoReadUpstream
$env:QTKHCN_HO_SO_WRITE_UPSTREAM = $HoSoWriteUpstream

$expectedUpstream = '127.0.0.1:8090'
if ($Target -eq 'Service') {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        throw 'QTKHCN_HO_SO_SERVICE_TOKEN is required for the My Tasks service route.'
    }
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness" -TimeoutSec 5
    if ($health.status -ne 'UP') { throw "Ho So service readiness is '$($health.status)'." }
    Invoke-RestMethod -Uri "http://127.0.0.1:$HoSoServicePort/api/my-tasks" `
        -Headers @{
            Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN"
            'X-QTKHCN-User-Id' = 'pm@example.com'
        } -TimeoutSec 10 | Out-Null
    $expectedUpstream = "127.0.0.1:$HoSoServicePort"
}
elseif ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
    $env:QTKHCN_HO_SO_SERVICE_TOKEN = 'my-tasks-route-disabled'
}
$env:QTKHCN_MY_TASKS_UPSTREAM = $expectedUpstream

& $CaddyExe validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed; live configuration was not changed.' }
& $CaddyExe reload --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy reload failed.' }

$config = Invoke-RestMethod -Uri 'http://127.0.0.1:2019/config/' -TimeoutSec 5 | ConvertTo-Json -Depth 30 -Compress
if ($config -notmatch [regex]::Escape($expectedUpstream)) {
    throw "Caddy admin config does not contain expected My Tasks upstream $expectedUpstream."
}

try {
    Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8443/api/my-tasks' -TimeoutSec 5 | Out-Null
    throw 'Basic Auth gate unexpectedly allowed an unauthenticated request.'
}
catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -ne 401) { throw }
}

Write-Host "[PASS] GET /api/my-tasks -> $expectedUpstream; Caddy reloaded; unauthenticated gateway request remains 401." -ForegroundColor Green
