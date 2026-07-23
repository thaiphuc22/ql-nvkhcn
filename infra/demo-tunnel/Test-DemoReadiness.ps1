[CmdletBinding()]
param(
    [switch]$SkipHttp,
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current'
)

$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($command in @('docker', 'node', 'npm', 'caddy')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        $failures.Add("Command is missing from PATH: $command")
    }
}

$indexPath = Join-Path $ReleaseRoot 'frontend-angular\dist\frontend-angular\browser\index.html'
if (-not (Test-Path -LiteralPath $indexPath)) {
    $failures.Add("Angular demo build is missing: $indexPath (is 'current' pointed at a built release? see New-DemoRelease.ps1 / Switch-DemoRelease.ps1)")
}

$internalPorts = @(5432, 8080, 8086, 8090, 8092, 8093, 8443, 9600, 9610, 26500, 26510)
$listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalPort -in $internalPorts }
$unsafe = $listeners | Where-Object { $_.LocalAddress -notin @('127.0.0.1', '::1') }
foreach ($listener in $unsafe) {
    $failures.Add("Port $($listener.LocalPort) is listening unsafely on $($listener.LocalAddress)")
}

if (-not $SkipHttp) {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_DEV_API_KEY)) {
        $failures.Add('QTKHCN_DEV_API_KEY is required for the backend smoke test.')
    }
    elseif ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        $failures.Add('QTKHCN_HO_SO_SERVICE_TOKEN is required for the NV KHCN service smoke test.')
    }
    elseif ([string]::IsNullOrWhiteSpace($env:QTKHCN_CORS_ALLOWED_ORIGINS)) {
        $failures.Add('QTKHCN_CORS_ALLOWED_ORIGINS must include the current HTTPS Runlocal origin.')
    }
    else {
        $publicOrigins = @($env:QTKHCN_CORS_ALLOWED_ORIGINS.Split(',') | ForEach-Object { $_.Trim() } |
            Where-Object { $_ -match '^https://[^/]+\.runlocal\.eu$' })
        if ($publicOrigins.Count -ne 1) {
            $failures.Add('QTKHCN_CORS_ALLOWED_ORIGINS must contain exactly one HTTPS *.runlocal.eu origin.')
        }
        $publicOrigin = $publicOrigins | Select-Object -First 1
        try {
            if ($publicOrigin) {
                $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8090/api/process-definitions' `
                    -Headers @{ 'X-QTKHCN-Dev-Key' = $env:QTKHCN_DEV_API_KEY; Origin = $publicOrigin } -TimeoutSec 10
                $preflight = Invoke-WebRequest -UseBasicParsing -Method Options -Uri 'http://127.0.0.1:8090/api/process-definitions' `
                    -Headers @{
                        Origin = $publicOrigin
                        'Access-Control-Request-Method' = 'GET'
                        'Access-Control-Request-Headers' = 'x-qtkhcn-dev-key'
                    } -TimeoutSec 10
                if ($response.Headers['Access-Control-Allow-Origin'] -ne $publicOrigin -or
                    $preflight.Headers['Access-Control-Allow-Origin'] -ne $publicOrigin) {
                    $failures.Add("Backend CORS response does not allow $publicOrigin.")
                }
                $hoSoHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:8093/actuator/health/readiness' -TimeoutSec 10
                if ($hoSoHealth.status -ne 'UP') { $failures.Add("NV KHCN service readiness is $($hoSoHealth.status).") }
                Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8093/api/ho-so' `
                    -Headers @{ Authorization = "Bearer $env:QTKHCN_HO_SO_SERVICE_TOKEN" } -TimeoutSec 10 | Out-Null
            }
        }
        catch {
            $failures.Add("Backend smoke test failed: $($_.Exception.Message)")
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Host "[FAIL] $_" -ForegroundColor Red }
    throw "Demo is not ready ($($failures.Count) failure(s))."
}

Write-Host '[PASS] Tooling, demo build, network binding, and backend smoke test are valid.' -ForegroundColor Green
