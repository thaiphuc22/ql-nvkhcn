[CmdletBinding()]
param(
    [switch]$SkipHttp
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($command in @('docker', 'node', 'npm', 'caddy')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        $failures.Add("Command is missing from PATH: $command")
    }
}

$indexPath = Join-Path $repoRoot 'frontend-angular\dist\frontend-angular\browser\index.html'
if (-not (Test-Path -LiteralPath $indexPath)) {
    $failures.Add("Angular demo build is missing: $indexPath")
}

$internalPorts = @(5432, 8080, 8086, 8090, 8092, 8443, 9600, 9610, 26500, 26510)
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
    else {
        try {
            $headers = @{ 'X-QTKHCN-Dev-Key' = $env:QTKHCN_DEV_API_KEY }
            Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8090/api/ho-so' -Headers $headers -TimeoutSec 10 | Out-Null
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
