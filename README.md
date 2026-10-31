# AeroLab

AeroLab is a complete aerospace engineering platform combining a 3D rocket builder, an engineering analysis dashboard, and a dedicated C++ computational physics engine.

## Overview

- C++ engine for physics, numerical integration, and trajectory computation
- Python/FastAPI orchestration for validation, analysis, and result export
- Three.js frontend for a 3D assembly model and telemetry visualization
- JSON-based component inventory and design library
- Automated tests for physics and API behavior

## Architecture

- `cpp/engine/`: reusable C++ simulation engine and numerical methods
- `cpp/bindings/`: pybind11 bridge to Python
- `python_backend/`: FastAPI service and analysis utilities
- `frontend/`: TypeScript + Three.js application
- `data/`: sample inventory and rocket configuration
- `scripts/`: Windows and shell launch helpers

## Features

- Modular rocket component inventory with realistic data labels
- Numerical comparison between Euler and RK4 solvers
- Basic atmospheric model with drag and wind effects
- Monte Carlo and parameter sensitivity analysis scaffolding
- 3D visualization of assembled rocket and flight path
- Simulation orchestration from Python into the C++ engine

## Quick start

### Windows (recommended)

1. Install Visual Studio 2022 with C++ desktop development and CMake.
2. Install Python 3.11+ and Node.js 20+.
3. Open PowerShell in the repo root.
4. Create and activate a Python environment:
   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   pip install -r python_backend/requirements.txt
   ```
5. Install frontend dependencies:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```
6. Build the C++ engine and Python extension:
   ```powershell
   cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
   cmake --build build --config Release
   ```
7. Start the API and frontend:
   ```powershell
   python -m uvicorn python_backend.app.main:app --host 0.0.0.0 --port 8000
   cd frontend
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

## Example simulation

The backend exposes a `/simulation/run` endpoint that accepts a rocket configuration and returns trajectories and summary metrics.

## Validation and limitations

This project is designed as a working engineering scaffold and deliberately distinguishes simplified analytical models from experimentally verified data. All component data is labeled as illustrative unless it is explicitly sourced.

## License

MIT
