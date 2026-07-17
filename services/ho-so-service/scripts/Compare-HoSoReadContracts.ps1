[CmdletBinding()]
param(
    [string]$LegacyBaseUrl = 'http://127.0.0.1:8090',
    [string]$NewServiceBaseUrl = 'http://127.0.0.1:8093',
    [string]$LegacyApiKey = $env:QTKHCN_API_KEY,
    [string]$NewServiceToken = $env:QTKHCN_HO_SO_SERVICE_TOKEN
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($NewServiceToken)) {
    throw 'NewServiceToken is required (or set QTKHCN_HO_SO_SERVICE_TOKEN).'
}

$legacyHeaders = @{}
if (-not [string]::IsNullOrWhiteSpace($LegacyApiKey)) { $legacyHeaders['X-QTKHCN-Dev-Key'] = $LegacyApiKey }
$newHeaders = @{ Authorization = "Bearer $NewServiceToken" }

function ConvertTo-CanonicalJson($Value) {
    function Normalize($Node) {
        if ($null -eq $Node) { return $null }
        if ($Node -is [System.Collections.IDictionary]) {
            $ordered = [ordered]@{}
            foreach ($key in @($Node.Keys | Sort-Object)) { $ordered[$key] = Normalize $Node[$key] }
            return $ordered
        }
        if ($Node -is [pscustomobject]) {
            $ordered = [ordered]@{}
            foreach ($property in @($Node.PSObject.Properties | Sort-Object Name)) {
                $ordered[$property.Name] = Normalize $property.Value
            }
            return $ordered
        }
        if ($Node -is [System.Collections.IEnumerable] -and $Node -isnot [string]) {
            return @($Node | ForEach-Object { Normalize $_ })
        }
        return $Node
    }
    return (Normalize $Value | ConvertTo-Json -Depth 100 -Compress)
}

function Invoke-JsonGet([string]$BaseUrl, [string]$Path, [hashtable]$Headers) {
    return Invoke-RestMethod -Method Get -Uri ($BaseUrl.TrimEnd('/') + $Path) -Headers $Headers
}

function Compare-Value([string]$Label, $Legacy, $New) {
    $legacyJson = ConvertTo-CanonicalJson $Legacy
    $newJson = ConvertTo-CanonicalJson $New
    if ($legacyJson -cne $newJson) {
        throw "Contract mismatch at $Label`nLEGACY: $legacyJson`nNEW:    $newJson"
    }
    Write-Host "PASS $Label"
}

$legacyNhiemVuResponse = Invoke-JsonGet $LegacyBaseUrl '/api/nhiem-vu' $legacyHeaders
$newNhiemVuResponse = Invoke-JsonGet $NewServiceBaseUrl '/api/nhiem-vu' $newHeaders
$legacyNhiemVu = @($legacyNhiemVuResponse.GetEnumerator() | Sort-Object ma)
$newNhiemVu = @($newNhiemVuResponse.GetEnumerator() | Sort-Object ma)
Compare-Value 'GET /api/nhiem-vu' $legacyNhiemVu $newNhiemVu

$legacyHoSoResponse = Invoke-JsonGet $LegacyBaseUrl '/api/ho-so' $legacyHeaders
$newHoSoResponse = Invoke-JsonGet $NewServiceBaseUrl '/api/ho-so' $newHeaders
$legacyHoSo = @($legacyHoSoResponse.GetEnumerator() | Sort-Object id)
$newHoSo = @($newHoSoResponse.GetEnumerator() | Sort-Object id)
Compare-Value 'GET /api/ho-so' $legacyHoSo $newHoSo

foreach ($item in $legacyNhiemVu) {
    $id = [uri]::EscapeDataString([string]$item.ma)
    Compare-Value "GET /api/nhiem-vu/$id" `
        (Invoke-JsonGet $LegacyBaseUrl "/api/nhiem-vu/$id" $legacyHeaders) `
        (Invoke-JsonGet $NewServiceBaseUrl "/api/nhiem-vu/$id" $newHeaders)
}
foreach ($item in $legacyHoSo) {
    $id = [uri]::EscapeDataString([string]$item.id)
    Compare-Value "GET /api/ho-so/$id" `
        (Invoke-JsonGet $LegacyBaseUrl "/api/ho-so/$id" $legacyHeaders) `
        (Invoke-JsonGet $NewServiceBaseUrl "/api/ho-so/$id" $newHeaders)
}

Write-Host 'Read contract comparison passed for list and item endpoints.'
