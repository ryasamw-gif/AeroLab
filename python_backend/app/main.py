from __future__ import annotations

from typing import Any, Dict, List

from fastapi import FastAPI

from app.schemas import RocketConfig, SimulationRequest
from app.services.simulation_service import SimulationService
from ml.rocket_ml import RocketFlightPredictor

app = FastAPI(title="AeroLab API", version="1.0.0")

service = SimulationService()
predictor = RocketFlightPredictor()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "AeroLab API"}


@app.get("/inventory")
def get_inventory() -> dict:
    return service.inventory()


@app.get("/config/default")
def get_default_configuration() -> dict:
    return service.default_configuration()


@app.post("/simulation/run")
def run_simulation(request: SimulationRequest) -> dict:
    return service.run(request)


@app.post("/ml/ingest")
def ingest_user_data(records: List[dict]) -> dict:
    return predictor.ingest_records(records)


@app.post("/ml/train")
def train_ml(dataset: List[dict] | None = None) -> dict:
    predictor.ensure_trained()
    return predictor.fit(dataset)


@app.post("/ml/predict")
def predict_flight(payload: Dict[str, Any]) -> dict:
    rocket = payload.get("rocket") or payload
    request = payload.get("request") or {"drag_coefficient": 0.35, "wind_speed_mps": 2.0}
    return predictor.predict(rocket, request)
