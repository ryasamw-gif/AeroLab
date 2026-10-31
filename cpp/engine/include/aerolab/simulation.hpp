#pragma once

#include <vector>

#include "aerolab/rocket_config.hpp"
#include "aerolab/integrators.hpp"

namespace aerolab {

struct SimulationResult {
    std::vector<StateVector> trajectory;
    double peak_altitude_m = 0.0;
    double max_velocity_mps = 0.0;
    double apogee_time_s = 0.0;
};

class FlightSimulation {
public:
    FlightSimulation(const RocketConfiguration& rocket_config,
                     double time_step_s = 0.05,
                     double max_duration_s = 60.0,
                     double drag_coefficient = 0.35);

    [[nodiscard]] SimulationResult run(IntegratorType integrator_type = IntegratorType::RK4) const;

    const RocketConfiguration& rocket_config() const;

private:
    RocketConfiguration rocket_config_;
    double time_step_s_;
    double max_duration_s_;
    double drag_coefficient_;
};

}  // namespace aerolab
