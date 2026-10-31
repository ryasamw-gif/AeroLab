from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


class RocketFlightPredictor:
    """Supervised ML pipeline for flight prediction using rocket configuration features."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = (data_dir or Path(__file__).resolve().parents[1] / "data")
        self.model_dir = self.data_dir / "ml_models"
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_path = self.model_dir / "metadata.json"
        self.feature_names = [
            "total_mass_kg",
            "motor_thrust_n",
            "burn_time_s",
            "reference_area_m2",
            "cg_m",
            "launch_angle_deg",
            "initial_altitude_m",
            "drag_coefficient",
            "wind_speed_mps",
            "component_count",
        ]
        self.models = {
            "peak_altitude_m": GradientBoostingRegressor(random_state=42),
            "max_velocity_mps": RandomForestRegressor(n_estimators=220, random_state=42),
        }
        self.training_history: List[dict] = []

    def _safe_float(self, value, default=0.0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return float(default)

    def _encode_rocket(self, rocket_config: dict, request: Optional[dict] = None) -> dict:
        total_mass = 0.0
        weighted_length = 0.0
        components = rocket_config.get("components", [])
        for component in components:
            mass = self._safe_float(component.get("mass_kg", 0.0))
            length = self._safe_float(component.get("length_m", 0.0))
            total_mass += mass
            weighted_length += mass * length
        total_mass += self._safe_float(rocket_config.get("propellant_mass_kg", 0.0))
        cg = weighted_length / total_mass if total_mass > 0 else 0.0

        reference_area = 0.0
        for component in components:
            radius = self._safe_float(component.get("radius_m", 0.0))
            reference_area = max(reference_area, np.pi * radius * radius)
        reference_area = max(reference_area, 0.01)

        payload = {
            "total_mass_kg": total_mass,
            "motor_thrust_n": self._safe_float(rocket_config.get("motor_thrust_n", 1500.0)),
            "burn_time_s": self._safe_float(rocket_config.get("burn_time_s", 4.0)),
            "reference_area_m2": reference_area,
            "cg_m": cg,
            "launch_angle_deg": self._safe_float(rocket_config.get("launch_angle_deg", 85.0)),
            "initial_altitude_m": self._safe_float(rocket_config.get("initial_altitude_m", 0.0)),
            "drag_coefficient": self._safe_float((request or {}).get("drag_coefficient", 0.35)),
            "wind_speed_mps": self._safe_float((request or {}).get("wind_speed_mps", 2.0)),
            "component_count": len(components),
        }
        return payload

    def _generate_physics_target(self, features: dict) -> dict:
        mass = features["total_mass_kg"]
        thrust = features["motor_thrust_n"]
        burn_time = features["burn_time_s"]
        area = features["reference_area_m2"]
        drag = features["drag_coefficient"]
        wind = features["wind_speed_mps"]
        angle = max(10.0, min(90.0, features["launch_angle_deg"]))

        effective_thrust = thrust * (burn_time / max(1.0, burn_time))
        acceleration = (effective_thrust / max(mass, 1.0)) - (9.80665 * 0.55)
        peak_altitude = max(50.0, (acceleration * burn_time * 45.0) * (1.0 - 0.18 * drag) + area * 1000.0)
        max_velocity = max(25.0, (effective_thrust / max(mass, 1.0)) * (burn_time * 9.0) * (1.0 - 0.1 * wind) + (np.cos(np.radians(angle)) * 80.0))

        return {
            "peak_altitude_m": peak_altitude,
            "max_velocity_mps": max_velocity,
        }

    def generate_dataset(self, num_samples: int = 5000, random_seed: int = 42) -> List[dict]:
        rng = random.Random(random_seed)
        records: List[dict] = []

        for _ in range(num_samples):
            component_count = rng.randint(3, 10)
            components = []
            for _ in range(component_count):
                components.append(
                    {
                        "mass_kg": round(rng.uniform(0.2, 2.2), 3),
                        "length_m": round(rng.uniform(0.15, 2.2), 3),
                        "radius_m": round(rng.uniform(0.04, 0.14), 3),
                    }
                )

            rocket = {
                "components": components,
                "propellant_mass_kg": round(rng.uniform(1.2, 6.0), 3),
                "motor_thrust_n": round(rng.uniform(1200.0, 4500.0), 2),
                "burn_time_s": round(rng.uniform(2.0, 8.0), 2),
                "launch_angle_deg": round(rng.uniform(55.0, 88.0), 2),
                "initial_altitude_m": round(rng.uniform(0.0, 200.0), 2),
            }
            payload = {
                "drag_coefficient": round(rng.uniform(0.2, 0.8), 3),
                "wind_speed_mps": round(rng.uniform(0.0, 12.0), 2),
            }
            features = self._encode_rocket(rocket, payload)
            targets = self._generate_physics_target(features)
            record = {**features, **targets}
            records.append(record)

        return records

    def ingest_records(self, records: Iterable[dict]) -> dict:
        all_records = list(records)
        if not all_records:
            return {"status": "empty", "samples": 0}

        file_path = self.data_dir / "user_training_records.json"
        existing: List[dict] = []
        if file_path.exists():
            with file_path.open("r", encoding="utf-8") as handle:
                try:
                    existing = json.load(handle)
                except json.JSONDecodeError:
                    existing = []

        existing.extend(all_records)
        with file_path.open("w", encoding="utf-8") as handle:
            json.dump(existing, handle, indent=2)

        return {"status": "ok", "samples": len(existing)}

    def load_training_data(self) -> pd.DataFrame:
        file_path = self.data_dir / "user_training_records.json"
        if file_path.exists():
            with file_path.open("r", encoding="utf-8") as handle:
                try:
                    records = json.load(handle)
                    if records:
                        return pd.DataFrame(records)
                except json.JSONDecodeError:
                    pass

        synthetic = self.generate_dataset(num_samples=2500)
        file_path.write_text(json.dumps(synthetic, indent=2), encoding="utf-8")
        return pd.DataFrame(synthetic)

    def fit(self, records: Optional[List[dict]] = None) -> dict:
        if records:
            df = pd.DataFrame(records)
        else:
            df = self.load_training_data()

        if df.empty:
            raise ValueError("No training records available for model fit.")

        X = df[self.feature_names]
        y_altitude = df["peak_altitude_m"]
        y_velocity = df["max_velocity_mps"]

        X_train, X_test, y_alt_train, y_alt_test = train_test_split(X, y_altitude, test_size=0.2, random_state=42)
        _, _, y_vel_train, y_vel_test = train_test_split(X, y_velocity, test_size=0.2, random_state=42)

        altitude_model = self.models["peak_altitude_m"]
        velocity_model = self.models["max_velocity_mps"]

        altitude_model.fit(X_train, y_alt_train)
        velocity_model.fit(X_train, y_vel_train)

        altitude_pred = altitude_model.predict(X_test)
        velocity_pred = velocity_model.predict(X_test)

        metrics = {
            "peak_altitude_m": {
                "mae": float(mean_absolute_error(y_alt_test, altitude_pred)),
                "r2": float(r2_score(y_alt_test, altitude_pred)),
            },
            "max_velocity_mps": {
                "mae": float(mean_absolute_error(y_vel_test, velocity_pred)),
                "r2": float(r2_score(y_vel_test, velocity_pred)),
            },
        }

        self.training_history.append({
            "samples": len(df),
            "metrics": metrics,
        })

        self.metadata_path.write_text(json.dumps({"samples": len(df), "metrics": metrics}, indent=2), encoding="utf-8")
        return {
            "status": "trained",
            "samples": len(df),
            "metrics": metrics,
        }

    def predict(self, rocket_config: dict, request: Optional[dict] = None) -> dict:
        features = self._encode_rocket(rocket_config, request)
        row = pd.DataFrame([features], columns=self.feature_names)

        altitude_prediction = float(self.models["peak_altitude_m"].predict(row)[0])
        velocity_prediction = float(self.models["max_velocity_mps"].predict(row)[0])

        return {
            "features": features,
            "peak_altitude_m": round(altitude_prediction, 2),
            "max_velocity_mps": round(velocity_prediction, 2),
            "estimated_apogee_time_s": round(max(2.5, altitude_prediction / max(velocity_prediction, 1.0)), 2),
        }

    def ensure_trained(self) -> None:
        if not self.metadata_path.exists():
            self.fit()
