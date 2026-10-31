#include <cassert>
#include <cmath>

#include "aerolab/atmosphere.hpp"
#include "aerolab/aerodynamics.hpp"
#include "aerolab/integrators.hpp"
#include "aerolab/simulation.hpp"

int main() {
    aerolab::RocketConfiguration config;
    config.components.push_back({"tube", "body_tube", "aluminum", 3.0, 1.8, 0.08, 0.05, 0.25, {{}}});
    config.components.push_back({"nose", "nose_cone", "composite", 1.2, 0.5, 0.08, 0.03, 0.25, {{}}});
    config.motor_thrust_n = 1900.0;
    config.burn_time_s = 5.0;
    config.propellant_mass_kg = 2.8;

    aerolab::Atmosphere atmosphere;
    assert(atmosphere.density_kg_m3(0.0) > 0.0);

    aerolab::Aerodynamics aero;
    const double drag = aero.drag_force_n(1.225, 20.0, 0.05, 0.35);
    assert(drag > 0.0);

    aerolab::FlightSimulation sim(config, 0.05, 30.0, 0.35);
    const aerolab::SimulationResult result = sim.run(aerolab::IntegratorType::RK4);
    assert(result.trajectory.size() > 5);
    assert(result.peak_altitude_m >= 0.0);

    return 0;
}
