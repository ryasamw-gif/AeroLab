Write-Host "Starting AeroLab frontend..."
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $repoRoot "frontend")

npm install
npm run dev -- --host 0.0.0.0 --port 5173
