from __future__ import annotations

from pathlib import Path
import json

from pydantic import BaseModel, Field
from typing import List, Optional


DATA_DIR = Path(__file__).resolve().parents[1] / "data"


class ComponentSpec(BaseModel):
    name: str
    type: str
    material: str
    mass_kg: float
    length_m: float
    radius_m: float
    thickness_m: float = 0.0
    drag_coefficient: float = 0.3


class RocketComponent(BaseModel):
    name: str
    type: str
    material: str = "aluminum"
    mass_kg: float = 0.0
    length_m: float = 0.0
    radius_m: float = 0.0
    thickness_m: float = 0.0
    drag_coefficient: float = 0.3


class RocketConfig(BaseModel):
    name: str = "AeroLab Rocket"
    components: List[RocketComponent]
    motor_thrust_n: float = 1500.0
    burn_time_s: float = 4.0
    propellant_mass_kg: float = 2.5
    launch_angle_deg: float = 85.0
    initial_altitude_m: float = 0.0


class SimulationRequest(BaseModel):
    rocket: RocketConfig
    integrator: str = Field(default="RK4", pattern="^(Euler|RK4)$")
    time_step_s: float = 0.05
    max_duration_s: float = 30.0
    drag_coefficient: float = 0.35
    wind_speed_mps: float = 2.0


def load_inventory() -> dict:
    inventory_path = DATA_DIR / "rocket_inventory.json"
    with inventory_path.open("r", encoding="utf-8") as fh:
        return json.load(fh)
