Write-Host "Building AeroLab..."
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

cmake --build build --config Release
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "AeroLab build complete."
