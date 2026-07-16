[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$caddyfile = Join-Path $PSScriptRoot 'Caddyfile'
$distRoot = Join-Path $repoRoot 'frontend-angular\dist\frontend-angular\browser'

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

& caddy validate --config $caddyfile --adapter caddyfile
if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed.' }

Write-Host "Caddy is serving the demo at http://127.0.0.1:8443" -ForegroundColor Green
Write-Host 'Keep this terminal open. Press Ctrl+C to stop the proxy.'
& caddy run --config $caddyfile --adapter caddyfile
