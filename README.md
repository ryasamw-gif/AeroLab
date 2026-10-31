# AeroLab

AeroLab is an advanced aerospace engineering workspace built around a high-performance C++ physics engine, a Python simulation orchestration layer, and a polished 3D / analytics frontend.

## Mission

The project is designed to model the engineering workflow of a modern launch-vehicle design environment:

- configure and validate a rocket assembly from component inventory data
- inspect mass, center-of-gravity, and aerodynamic assumptions
- compare numerical integration methods and sensitivity cases
- run simulation studies and visualize flight telemetry
- present a premium engineering interface for rocket analysis

## Architecture

- `cpp/` — C++ simulation engine and numerical modules
- `python_backend/` — FastAPI orchestration and analysis services
- `frontend/` — TypeScript + Three.js interface
- `data/` — sample inventories and engineering input files
- `scripts/` — Windows build and run helpers

## Current status

This repository is intentionally structured as a realistic engineering platform, with a polished front-end design and data-driven simulation scaffolding.

It is meant to be a practical foundation for continued development and extension.

## Quick start

### Windows

```powershell
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
python -m uvicorn python_backend.app.main:app --host 0.0.0.0 --port 8000
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## Notes

- Component data is labeled as illustrative unless explicitly verified.
- Numerical models are simplified analytical approximations intended for engineering first-pass workflows.
- The system is designed to evolve toward more rigorous simulation and benchmarking.
