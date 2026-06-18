$ErrorActionPreference = "Stop"

$nodeVersion = "v24.16.0"
$runtimeRoot = Join-Path $PSScriptRoot "..\.runtime"
$runtimeDirectory = Join-Path $runtimeRoot "node-$nodeVersion-win-x64"
$nodeExecutable = Join-Path $runtimeDirectory "node.exe"
$npmExecutable = Join-Path $runtimeDirectory "npm.cmd"

if (-not (Test-Path -LiteralPath $npmExecutable)) {
    $archive = Join-Path $runtimeRoot "node-$nodeVersion-win-x64.zip"
    New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
    Write-Host "Downloading official Node.js $nodeVersion portable runtime..."
    Invoke-WebRequest `
        -Uri "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip" `
        -OutFile $archive
    Expand-Archive -LiteralPath $archive -DestinationPath $runtimeRoot -Force
}

Write-Host "Using Node.js:"
& $nodeExecutable --version
Write-Host "Using npm:"
& $npmExecutable --version

$env:Path = "$runtimeDirectory;$env:Path"
Push-Location (Join-Path $PSScriptRoot "..")
try {
    & $npmExecutable install
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Setup complete. Create .env.local from .env.local.example, then run:"
Write-Host "powershell -ExecutionPolicy Bypass -File .\scripts\run-windows.ps1"
