# AeroLab project documentation.

This repository contains the AeroLab aerospace engineering platform.

## Repository layout

- `cpp/` - C++ computational engine and pybind11 binding
- `python_backend/` - FastAPI backend and analysis tools
- `frontend/` - Three.js + TypeScript user interface
- `data/` - sample inventories and rocket design data
- `scripts/` - Windows and shell launch/support utilities

## Build

```powershell
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

## Python checks

```bash
python -m compileall python_backend
```

## Frontend

```bash
cd frontend
npm install
npm run build
```
