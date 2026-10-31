Write-Host "Starting AeroLab backend..."
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

python -m uvicorn python_backend.app.main:app --host 0.0.0.0 --port 8000
