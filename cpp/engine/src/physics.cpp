#include "aerolab/simulation.hpp"

#include "aerolab/aerodynamics.hpp"
#include "aerolab/atmosphere.hpp"

#include <algorithm>
#include <cmath>

namespace aerolab {

FlightSimulation::FlightSimulation(const RocketConfiguration& rocket_config,
                                 double time_step_s,
                                 double max_duration_s,
                                 double drag_coefficient)
    : rocket_config_(rocket_config),
      time_step_s_(time_step_s),
      max_duration_s_(max_duration_s),
      drag_coefficient_(drag_coefficient) {}

const RocketConfiguration& FlightSimulation::rocket_config() const {
    return rocket_config_;
}

SimulationResult FlightSimulation::run(IntegratorType integrator_type) const {
    Atmosphere atmosphere;
    Aerodynamics aero;

    SimulationResult result;
    StateVector state;
    state.mass_kg = rocket_config_.total_mass_kg();
    state.velocity_mps = 0.0;

    double current_time = 0.0;
    while (current_time < max_duration_s_) {
        const double altitude = std::max(state.altitude_m, 0.0);
        const double density = atmosphere.density_kg_m3(altitude);
        const double wind = atmosphere.wind_speed_mps(altitude);
        const double area = rocket_config_.reference_area_m2();
        const double drag_force = aero.drag_force_n(density, std::max(state.velocity_mps - wind, 0.0), area, drag_coefficient_);
        const double gravity_force = state.mass_kg * Atmosphere::gravity_m_s2;
        const double thrust = (current_time < rocket_config_.burn_time_s) ? rocket_config_.motor_thrust_n : 0.0;

        if (integrator_type == IntegratorType::Euler) {
            state = Integrator::step_euler(state, time_step_s_, thrust, drag_force, gravity_force, state.mass_kg);
        } else {
            state = Integrator::step_rk4(state, time_step_s_, thrust, drag_force, gravity_force, state.mass_kg);
        }

        state.altitude_m = std::max(state.altitude_m, 0.0);
        state.velocity_mps = std::max(state.velocity_mps, 0.0);
        if (state.altitude_m > result.peak_altitude_m) {
            result.peak_altitude_m = state.altitude_m;
            result.apogee_time_s = state.time_s;
        }
        result.max_velocity_mps = std::max(result.max_velocity_mps, state.velocity_mps);
        result.trajectory.push_back(state);

        current_time += time_step_s_;
        if (state.velocity_mps <= 0.0 && state.altitude_m <= 1.0) {
            break;
        }
    }

    return result;
}

}  // namespace aerolab
