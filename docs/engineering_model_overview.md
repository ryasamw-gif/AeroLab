# AeroLab engineering model overview

This document captures the high-level structural assumptions used by the AeroLab project.

## Core model

The simulation pipeline is designed around the following sequence:

1. Rocket configuration is assembled from a component inventory.
2. Python validates the configuration and prepares simulation inputs.
3. A C++ engine performs flight and numerical calculations.
4. Results are sent back to Python for analysis and export.
5. A frontend visualizes flight telemetry and assembly data.

## Physics assumptions

- Newtonian flight dynamics with altitude-dependent atmospheric density
- simplified drag model based on reference area and drag coefficient
- short-burn propulsion approximation with thrust and burn duration
- rank-based mass and center-of-gravity estimation from component inputs
- basic wind effect model for a first-pass engineering workflow

## Model limitations

- This remains an engineering approximation rather than a certified aerodynamic model.
- No experimentally validated wind tunnel or flight test data is implied.
- Detailed stability, rotational dynamics, and advanced atmospheric modeling remain as extension points.

## Numerical integration

The current engine structure includes Euler and RK4 paths as baseline comparison methods. These are intended to provide a simple, testable reference for numerical method discussion and convergence studies.
