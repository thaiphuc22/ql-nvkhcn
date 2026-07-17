[CmdletBinding()]
param(
    [string]$SourceDatabase = 'qtkhcn',
    [string]$TargetDatabase = 'qtkhcn_ho_so',
    [string]$DatabaseUser = 'qtkhcn',
    [string]$PostgresContainer = 'qtkhcn-postgres'
)

$ErrorActionPreference = 'Stop'

foreach ($identifier in @($SourceDatabase, $TargetDatabase, $DatabaseUser)) {
    if ($identifier -notmatch '^[a-zA-Z_][a-zA-Z0-9_]*$') {
        throw "Unsupported PostgreSQL identifier: $identifier"
    }
}

$sql = @'
WITH parity AS (
    SELECT 'nhiem_vu' AS table_name, COUNT(*) AS row_count,
           md5(COALESCE(string_agg(jsonb_build_array(ma, ten, cap, chu_nhiem_ho_ten,
               chu_nhiem_hoc_ham_hoc_vi, chu_nhiem_ma_nhan_vien, chu_nhiem_email, chu_nhiem_sdt,
               chu_nhiem_don_vi_cong_tac, don_vi_chu_tri, thoi_gian_thuc_hien, du_toan, giai_doan)::text,
               E'\n' ORDER BY ma), '')) AS checksum
      FROM nhiem_vu
    UNION ALL
    SELECT 'ho_so', COUNT(*),
           md5(COALESCE(string_agg(jsonb_build_array(id, ma_nv, loai, quy_trinh, quy_trinh_ten,
               nguoi_khoi_tao, ngay_tao, trang_thai, buoc_hien_tai, zeebe_process_instance_key)::text,
               E'\n' ORDER BY id), ''))
      FROM ho_so
    UNION ALL
    SELECT 'dossier_step', COUNT(*),
           md5(COALESCE(string_agg(jsonb_build_array(id, ho_so_id, buoc_index, task_definition_key,
               ten, vai_tro, nguoi, trang_thai, thoi_diem, y_kien, han_xu_ly, form_key)::text,
               E'\n' ORDER BY id), ''))
      FROM dossier_step
    UNION ALL
    SELECT 'dossier_step_code', COUNT(*),
           md5(COALESCE(string_agg(jsonb_build_array(dossier_step_id, code)::text,
               E'\n' ORDER BY dossier_step_id, code), ''))
      FROM dossier_step_code
    UNION ALL
    SELECT 'ho_so_tai_lieu', COUNT(*),
           md5(COALESCE(string_agg(jsonb_build_array(ho_so_id, ten, loai)::text,
               E'\n' ORDER BY ho_so_id, ten, loai), ''))
      FROM ho_so_tai_lieu
)
SELECT table_name || '|' || row_count || '|' || checksum FROM parity ORDER BY table_name;
'@

function Get-Parity([string]$Database) {
    $output = & docker exec $PostgresContainer psql -X -v ON_ERROR_STOP=1 -U $DatabaseUser -d $Database -Atc $sql
    if ($LASTEXITCODE -ne 0) { throw "Could not calculate parity for $Database" }
    $result = [ordered]@{}
    foreach ($line in $output) {
        $parts = $line -split '\|', 3
        if ($parts.Count -ne 3) { throw "Unexpected parity output from $Database`: $line" }
        $result[$parts[0]] = [pscustomobject]@{ Count = [long]$parts[1]; Checksum = $parts[2] }
    }
    return $result
}

$source = Get-Parity $SourceDatabase
$target = Get-Parity $TargetDatabase
$rows = foreach ($table in $source.Keys) {
    [pscustomobject]@{
        Table = $table
        SourceCount = $source[$table].Count
        TargetCount = $target[$table].Count
        CountMatch = $source[$table].Count -eq $target[$table].Count
        ChecksumMatch = $source[$table].Checksum -eq $target[$table].Checksum
        Checksum = $source[$table].Checksum
    }
}
$rows | Format-Table -AutoSize

$failed = @($rows | Where-Object { -not $_.CountMatch -or -not $_.ChecksumMatch })
if ($failed.Count -gt 0) {
    throw "Data parity failed for: $($failed.Table -join ', ')"
}
Write-Host 'Data parity passed for all five tables.'
