$ErrorActionPreference = "Stop"

$runtimeDirectory = Join-Path $PSScriptRoot "..\.runtime\node-v24.16.0-win-x64"
$npmExecutable = Join-Path $runtimeDirectory "npm.cmd"

if (-not (Test-Path -LiteralPath $npmExecutable)) {
    throw "Portable Node.js runtime is missing. Run .\scripts\setup-windows.ps1 first."
}

$env:Path = "$runtimeDirectory;$env:Path"
Push-Location (Join-Path $PSScriptRoot "..")
try {
    & $npmExecutable run dev
} finally {
    Pop-Location
}
