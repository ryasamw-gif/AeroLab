#include "aerolab/integrators.hpp"

#include <cmath>

namespace aerolab {

StateVector Integrator::step_euler(const StateVector& state,
                                  double dt_s,
                                  double thrust_n,
                                  double drag_n,
                                  double gravity_n,
                                  double mass_kg) {
    StateVector next = state;
    const double acceleration = (thrust_n - drag_n - gravity_n) / mass_kg;
    next.time_s += dt_s;
    next.velocity_mps += acceleration * dt_s;
    next.altitude_m += state.velocity_mps * dt_s;
    next.acceleration_mps2 = acceleration;
    next.mass_kg = mass_kg;
    return next;
}

StateVector Integrator::step_rk4(const StateVector& state,
                                double dt_s,
                                double thrust_n,
                                double drag_n,
                                double gravity_n,
                                double mass_kg) {
    auto derivative = [](const StateVector& s, double /*t*/, double thrust, double drag, double gravity, double mass) {
        StateVector out;
        const double acceleration = (thrust - drag - gravity) / mass;
        out.time_s = 1.0;
        out.velocity_mps = acceleration;
        out.altitude_m = s.velocity_mps;
        out.acceleration_mps2 = acceleration;
        out.mass_kg = mass;
        out.position_x_m = 0.0;
        out.position_z_m = s.altitude_m;
        return out;
    };

    StateVector k1 = derivative(state, 0.0, thrust_n, drag_n, gravity_n, mass_kg);
    StateVector k2_state = state;
    k2_state.velocity_mps += 0.5 * dt_s * k1.velocity_mps;
    k2_state.altitude_m += 0.5 * dt_s * k1.altitude_m;
    StateVector k2 = derivative(k2_state, 0.5 * dt_s, thrust_n, drag_n, gravity_n, mass_kg);

    StateVector k3_state = state;
    k3_state.velocity_mps += 0.5 * dt_s * k2.velocity_mps;
    k3_state.altitude_m += 0.5 * dt_s * k2.altitude_m;
    StateVector k3 = derivative(k3_state, 0.5 * dt_s, thrust_n, drag_n, gravity_n, mass_kg);

    StateVector k4_state = state;
    k4_state.velocity_mps += dt_s * k3.velocity_mps;
    k4_state.altitude_m += dt_s * k3.altitude_m;
    StateVector k4 = derivative(k4_state, dt_s, thrust_n, drag_n, gravity_n, mass_kg);

    StateVector next = state;
    next.time_s += dt_s;
    next.velocity_mps += (dt_s / 6.0) * (k1.velocity_mps + 2.0 * k2.velocity_mps + 2.0 * k3.velocity_mps + k4.velocity_mps);
    next.altitude_m += (dt_s / 6.0) * (k1.altitude_m + 2.0 * k2.altitude_m + 2.0 * k3.altitude_m + k4.altitude_m);
    next.acceleration_mps2 = (thrust_n - drag_n - gravity_n) / mass_kg;
    next.mass_kg = mass_kg;
    return next;
}

}  // namespace aerolab
