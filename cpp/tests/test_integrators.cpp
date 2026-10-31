#include <cassert>

#include "aerolab/integrators.hpp"

int main() {
    aerolab::StateVector state;
    state.velocity_mps = 10.0;
    state.altitude_m = 100.0;
    state.mass_kg = 20.0;

    const auto euler = aerolab::Integrator::step_euler(state, 0.1, 1200.0, 50.0, 196.0, 20.0);
    assert(euler.velocity_mps > 10.0);
    assert(euler.altitude_m > 100.0);

    const auto rk4 = aerolab::Integrator::step_rk4(state, 0.1, 1200.0, 50.0, 196.0, 20.0);
    assert(rk4.velocity_mps > 10.0);
    assert(rk4.altitude_m > 100.0);

    return 0;
}
