from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import SimulationRequest
from app.services.simulation_service import SimulationService

app = FastAPI(title="AeroLab API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = SimulationService()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "AeroLab API"}


@app.get("/inventory")
def get_inventory() -> dict:
    return service.inventory()


@app.post("/simulation/run")
def run_simulation(request: SimulationRequest) -> dict:
    return service.run(request)
