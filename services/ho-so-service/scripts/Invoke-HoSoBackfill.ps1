[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$SourceDatabase = 'qtkhcn',
    [string]$TargetDatabase = 'qtkhcn_ho_so',
    [string]$DatabaseUser = 'qtkhcn',
    [string]$PostgresContainer = 'qtkhcn-postgres'
)

$ErrorActionPreference = 'Stop'
$tables = @('nhiem_vu', 'ho_so', 'dossier_step', 'dossier_step_code', 'ho_so_tai_lieu')

function Assert-Identifier([string]$Value, [string]$Name) {
    if ($Value -notmatch '^[a-zA-Z_][a-zA-Z0-9_]*$') {
        throw "$Name contains unsupported characters: $Value"
    }
}

Assert-Identifier $SourceDatabase 'SourceDatabase'
Assert-Identifier $TargetDatabase 'TargetDatabase'
Assert-Identifier $DatabaseUser 'DatabaseUser'
if ($SourceDatabase -eq $TargetDatabase) {
    throw 'SourceDatabase and TargetDatabase must be different.'
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker is required because this script runs PostgreSQL tools inside the database container.'
}

& docker inspect $PostgresContainer *> $null
if ($LASTEXITCODE -ne 0) {
    throw "PostgreSQL container is unavailable: $PostgresContainer"
}

$workDir = Join-Path ([System.IO.Path]::GetTempPath()) ("qtkhcn-ho-so-backfill-" + [guid]::NewGuid())
$dumpPath = Join-Path $workDir 'snapshot.sql'
$restorePath = Join-Path $workDir 'restore.sql'
$containerRestorePath = "/tmp/qtkhcn-ho-so-backfill-$([guid]::NewGuid().ToString('N')).sql"

if (-not $PSCmdlet.ShouldProcess($TargetDatabase, "Replace five Ho So tables from snapshot of $SourceDatabase")) {
    return
}

New-Item -ItemType Directory -Path $workDir | Out-Null
try {
    $dumpArgs = @('exec', $PostgresContainer, 'pg_dump', '-U', $DatabaseUser, '-d', $SourceDatabase,
        '--data-only', '--no-owner', '--no-privileges')
    foreach ($table in $tables) {
        $dumpArgs += "--table=public.$table"
    }

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = (Get-Command docker).Source
    $startInfo.Arguments = ($dumpArgs | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join ' '
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.UseShellExecute = $false
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $dumpStream = [System.IO.File]::Create($dumpPath)
    try { $process.StandardOutput.BaseStream.CopyTo($dumpStream) } finally { $dumpStream.Dispose() }
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "pg_dump failed: $stderr" }

    $utf8 = [System.Text.UTF8Encoding]::new($false)
    $prefix = @"
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';
TRUNCATE TABLE dossier_step_code, ho_so_tai_lieu, dossier_step, ho_so, nhiem_vu RESTART IDENTITY;
"@
    [System.IO.File]::WriteAllText($restorePath, $prefix, $utf8)
    $output = [System.IO.File]::Open($restorePath, [System.IO.FileMode]::Append)
    $input = [System.IO.File]::OpenRead($dumpPath)
    try { $input.CopyTo($output) } finally { $input.Dispose(); $output.Dispose() }
    $suffix = @"

SELECT setval(
    pg_get_serial_sequence('public.dossier_step', 'id'),
    COALESCE((SELECT MAX(id) FROM public.dossier_step), 1),
    EXISTS (SELECT 1 FROM public.dossier_step)
);
COMMIT;
"@
    [System.IO.File]::AppendAllText($restorePath, $suffix, $utf8)

    & docker cp $restorePath "${PostgresContainer}:$containerRestorePath"
    if ($LASTEXITCODE -ne 0) { throw 'Could not copy the snapshot into the PostgreSQL container.' }
    & docker exec $PostgresContainer psql -X -v ON_ERROR_STOP=1 -U $DatabaseUser -d $TargetDatabase -f $containerRestorePath
    if ($LASTEXITCODE -ne 0) { throw 'Backfill restore failed and its transaction was rolled back.' }

    Write-Host "Backfill completed: $SourceDatabase -> $TargetDatabase"
    Write-Host 'The source database was read only; no reverse or dual write was performed.'
}
finally {
    & docker exec $PostgresContainer rm -f $containerRestorePath 2>$null
    Remove-Item -LiteralPath $workDir -Recurse -Force -ErrorAction SilentlyContinue
}
