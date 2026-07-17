[CmdletBinding()]
param(
    [ValidateRange(0.1, 1440)]
    [double]$DurationMinutes = 30,
    [ValidateRange(5, 300)]
    [int]$PollIntervalSeconds = 30,
    [ValidateRange(0, 1000000)]
    [int]$MinimumObservedRequests = 5,
    [ValidateRange(0, 100)]
    [double]$MaximumServerErrorPercent = 0,
    [ValidateRange(1, 60000)]
    [double]$MaximumAverageLatencyMs = 1000,
    [string]$ReleaseRoot = 'C:\Users\phuctd7\qtkhcn-demo\current',
    [int]$HoSoServicePort = 8093,
    [string]$CaddyExe,
    [string]$ObservationRoot = 'C:\Users\phuctd7\qtkhcn-demo\observations'
)

# Opens a bounded GET-only canary window and always restores the route to the monolith. It observes
# service-side metrics tagged by Caddy as traffic=canary; direct readiness/API probes are excluded.
# The script never changes mutation routing, stops a process, or writes secrets to its report.

$ErrorActionPreference = 'Stop'
$switchScript = Join-Path $PSScriptRoot 'Switch-HoSoReadRoute.ps1'
$metricUri = "http://127.0.0.1:$HoSoServicePort/actuator/metrics/qtkhcn.read.requests?tag=traffic:canary"
$healthUri = "http://127.0.0.1:$HoSoServicePort/actuator/health/readiness"
$startedAt = Get-Date
$deadline = $startedAt.AddMinutes($DurationMinutes)
$samples = [System.Collections.Generic.List[object]]::new()
$verdict = 'IN_PROGRESS'
$failureReason = $null

function Get-CanaryMetricSnapshot {
    try {
        $metric = Invoke-RestMethod -Uri $metricUri -TimeoutSec 5
    }
    catch {
        # A 404 means the tagged timer has not been created because no canary request has arrived yet.
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) {
            return [pscustomobject]@{ Count = 0.0; TotalTimeSeconds = 0.0; MaxSeconds = 0.0 }
        }
        throw
    }
    $values = @{}
    foreach ($measurement in $metric.measurements) {
        $values[$measurement.statistic] = [double]$measurement.value
    }
    return [pscustomobject]@{
        Count = [double]$values['COUNT']
        TotalTimeSeconds = [double]$values['TOTAL_TIME']
        MaxSeconds = [double]$values['MAX']
    }
}

function Get-ServerErrorCount {
    $uri = "$metricUri&tag=outcome:server_error"
    try {
        $metric = Invoke-RestMethod -Uri $uri -TimeoutSec 5
    }
    catch {
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) { return 0.0 }
        throw
    }
    $count = $metric.measurements | Where-Object statistic -eq 'COUNT' | Select-Object -ExpandProperty value
    if ($null -eq $count) { return 0.0 }
    return [double]$count
}

try {
    if ([string]::IsNullOrWhiteSpace($env:QTKHCN_HO_SO_SERVICE_TOKEN)) {
        throw 'QTKHCN_HO_SO_SERVICE_TOKEN is required.'
    }
    $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 5
    if ($health.status -ne 'UP') { throw "Service readiness is '$($health.status)' before the window." }

    $baseline = Get-CanaryMetricSnapshot
    $baselineErrors = Get-ServerErrorCount
    & $switchScript -Target Canary -ReleaseRoot $ReleaseRoot -HoSoServicePort $HoSoServicePort -CaddyExe $CaddyExe
    Write-Host "[CANARY] GET route opened until $($deadline.ToString('o')); writes remain on the monolith." -ForegroundColor Cyan

    while ((Get-Date) -lt $deadline) {
        $remainingSeconds = [Math]::Ceiling(($deadline - (Get-Date)).TotalSeconds)
        Start-Sleep -Seconds ([Math]::Min($PollIntervalSeconds, [Math]::Max(1, $remainingSeconds)))

        $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 5
        if ($health.status -ne 'UP') { throw "Service readiness changed to '$($health.status)'." }
        $current = Get-CanaryMetricSnapshot
        [double]$currentCount = $current.Count
        [double]$baselineCount = $baseline.Count
        [double]$currentTotalSeconds = $current.TotalTimeSeconds
        [double]$baselineTotalSeconds = $baseline.TotalTimeSeconds
        $requestCount = [Math]::Max(0.0, ($currentCount - $baselineCount))
        $totalSeconds = [Math]::Max(0.0, ($currentTotalSeconds - $baselineTotalSeconds))
        $serverErrors = [Math]::Max(0, (Get-ServerErrorCount) - $baselineErrors)
        $averageMs = if ($requestCount -gt 0) { 1000 * $totalSeconds / $requestCount } else { 0 }
        $errorPercent = if ($requestCount -gt 0) { 100 * $serverErrors / $requestCount } else { 0 }
        $sample = [pscustomobject]@{
            observedAt = (Get-Date).ToString('o')
            requestCount = [int]$requestCount
            serverErrors = [int]$serverErrors
            serverErrorPercent = [Math]::Round($errorPercent, 3)
            totalLatencyMs = [Math]::Round(1000 * $totalSeconds, 2)
            averageLatencyMs = [Math]::Round($averageMs, 2)
            currentMaxLatencyMs = [Math]::Round(1000 * $current.MaxSeconds, 2)
        }
        $samples.Add($sample)
        Write-Host ("[OBSERVE] requests={0} 5xx={1} ({2}%) avg={3}ms max={4}ms" -f `
                $sample.requestCount, $sample.serverErrors, $sample.serverErrorPercent,
                $sample.averageLatencyMs, $sample.currentMaxLatencyMs)

        if ($requestCount -gt 0 -and $errorPercent -gt $MaximumServerErrorPercent) {
            throw "Server error rate $([Math]::Round($errorPercent, 3))% exceeds $MaximumServerErrorPercent%."
        }
        if ($requestCount -gt 0 -and $averageMs -gt $MaximumAverageLatencyMs) {
            throw "Average latency $([Math]::Round($averageMs, 2))ms exceeds ${MaximumAverageLatencyMs}ms."
        }
    }

    $final = Get-CanaryMetricSnapshot
    $observed = [Math]::Max(0, $final.Count - $baseline.Count)
    if ($observed -lt $MinimumObservedRequests) {
        throw "Only $observed canary request(s) were observed; minimum is $MinimumObservedRequests."
    }
    $verdict = 'PASS'
}
catch {
    $verdict = 'FAIL'
    $failureReason = $_.Exception.Message
    Write-Host "[CANARY FAIL] $failureReason" -ForegroundColor Red
}
finally {
    try {
        # Roll back even when the opening gate failed: this makes the terminal state deterministic.
        & $switchScript -Target Monolith -ReleaseRoot $ReleaseRoot -HoSoServicePort $HoSoServicePort -CaddyExe $CaddyExe
    }
    catch {
        $verdict = 'ROLLBACK_FAILED'
        $failureReason = "Rollback failed: $($_.Exception.Message)"
        Write-Host "[ROLLBACK FAIL] $failureReason" -ForegroundColor Red
    }

    New-Item -ItemType Directory -Path $ObservationRoot -Force | Out-Null
    $reportPath = Join-Path $ObservationRoot ("ho-so-read-canary-{0}.json" -f $startedAt.ToString('yyyyMMdd-HHmmss'))
    [pscustomobject]@{
        slice = '2D'
        startedAt = $startedAt.ToString('o')
        endedAt = (Get-Date).ToString('o')
        plannedDurationMinutes = $DurationMinutes
        verdict = $verdict
        reason = $failureReason
        minimumObservedRequests = $MinimumObservedRequests
        maximumServerErrorPercent = $MaximumServerErrorPercent
        maximumAverageLatencyMs = $MaximumAverageLatencyMs
        finalRoute = 'Monolith'
        writeOwnership = 'Monolith'
        samples = $samples
    } | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8
    Write-Host "[REPORT] $reportPath" -ForegroundColor Cyan
}

if ($verdict -ne 'PASS') { throw "Canary window verdict: $verdict. $failureReason" }
Write-Host '[PASS] Canary window completed and GET route was restored to the monolith.' -ForegroundColor Green
