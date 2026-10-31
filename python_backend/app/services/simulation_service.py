from __future__ import annotations

import math
from typing import Any, Dict, List

from app.schemas import SimulationRequest


class SimulationService:
    def __init__(self) -> None:
        self.inventory = self._load_inventory()

    def _load_inventory(self) -> dict:
        from pathlib import Path
        import json

        inventory_path = Path(__file__).resolve().parents[2] / "data" / "rocket_inventory.json"
        with inventory_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _compute_mass_properties(self, rocket_config: dict) -> Dict[str, float]:
        total_mass = 0.0
        weighted_length = 0.0
        for component in rocket_config.get("components", []):
            mass = float(component.get("mass_kg", 0.0))
            length = float(component.get("length_m", 0.0))
            total_mass += mass
            weighted_length += mass * length

        total_mass += float(rocket_config.get("propellant_mass_kg", 0.0))
        cg = weighted_length / total_mass if total_mass > 0.0 else 0.0
        reference_area = 0.0
        for component in rocket_config.get("components", []):
            radius = float(component.get("radius_m", 0.0))
            reference_area = max(reference_area, math.pi * radius * radius)
        reference_area = max(reference_area, 0.01)

        return {
            "total_mass_kg": round(total_mass, 4),
            "cg_m": round(cg, 4),
            "reference_area_m2": round(reference_area, 4),
        }

    def _generate_trajectory(self, rocket_config: dict, request: SimulationRequest) -> List[dict]:
        dt = float(request.time_step_s)
        duration = float(request.max_duration_s)
        thrust = float(rocket_config.get("motor_thrust_n", 1500.0))
        burn_time = float(rocket_config.get("burn_time_s", 4.0))
        velocity = 0.0
        altitude = float(rocket_config.get("initial_altitude_m", 0.0))
        mass = float(self._compute_mass_properties(rocket_config)["total_mass_kg"])
        points: List[dict] = []
        t = 0.0
        while t <= duration:
            if t < burn_time:
                acceleration = (thrust / mass) - (9.80665 * 0.5)
            else:
                acceleration = -(9.80665 * 0.5)

            velocity = max(0.0, velocity + acceleration * dt)
            altitude = max(0.0, altitude + velocity * dt)
            points.append({
                "time_s": round(t, 3),
                "altitude_m": round(altitude, 3),
                "velocity_mps": round(velocity, 3),
                "acceleration_mps2": round(acceleration, 3),
            })
            t += dt

        return points

    def run(self, request: SimulationRequest) -> dict:
        rocket = request.rocket.model_dump()
        mass_properties = self._compute_mass_properties(rocket)
        trajectory = self._generate_trajectory(rocket, request)
        summary = {
            "total_mass_kg": mass_properties["total_mass_kg"],
            "cg_m": mass_properties["cg_m"],
            "reference_area_m2": mass_properties["reference_area_m2"],
            "peak_altitude_m": max((point["altitude_m"] for point in trajectory), default=0.0),
            "max_velocity_mps": max((point["velocity_mps"] for point in trajectory), default=0.0),
            "integrator": request.integrator,
        }
        return {
            "rocket": rocket["name"],
            "summary": summary,
            "trajectory": trajectory,
        }

    def inventory(self) -> dict:
        return {"components": self.inventory.get("components", []), "source": "illustrative engineering data"}
