[CmdletBinding()]
param(
    [string]$LocalUrl = 'http://127.0.0.1:8443',
    [string]$ProxyUrl = ''
)

$ErrorActionPreference = 'Stop'

foreach ($command in @('node', 'npm')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Command '$command' was not found in PATH."
    }
}

if ([string]::IsNullOrWhiteSpace($ProxyUrl)) {
    Write-Host "Starting Runlocal tunnel to $LocalUrl" -ForegroundColor Cyan
    & npx.cmd --yes runlocal@0.10.0 $LocalUrl
    exit $LASTEXITCODE
}

$runtimeDir = Join-Path $env:LOCALAPPDATA 'qtkhcn-demo\runlocal-runtime'
$runlocalEntry = Join-Path $runtimeDir 'node_modules\runlocal\index.js'
$proxyBootstrap = Join-Path $runtimeDir 'node_modules\global-agent\bootstrap.js'

if (-not (Test-Path -LiteralPath $runlocalEntry) -or
    -not (Test-Path -LiteralPath $proxyBootstrap)) {
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    & npm.cmd install --prefix $runtimeDir --no-audit --no-fund runlocal@0.10.0 global-agent@3.0.0
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not install the Runlocal proxy runtime.'
    }
}

$previousProxy = $env:GLOBAL_AGENT_HTTP_PROXY
$previousNoProxy = $env:GLOBAL_AGENT_NO_PROXY

try {
    $env:GLOBAL_AGENT_HTTP_PROXY = $ProxyUrl
    $env:GLOBAL_AGENT_NO_PROXY = '127.0.0.1,localhost'
    Write-Host "Starting Runlocal tunnel to $LocalUrl through the configured HTTP proxy" -ForegroundColor Cyan
    & node.exe -r $proxyBootstrap $runlocalEntry $LocalUrl
    exit $LASTEXITCODE
}
finally {
    $env:GLOBAL_AGENT_HTTP_PROXY = $previousProxy
    $env:GLOBAL_AGENT_NO_PROXY = $previousNoProxy
}
