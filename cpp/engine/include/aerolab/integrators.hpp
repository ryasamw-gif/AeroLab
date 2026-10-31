#pragma once

namespace aerolab {

enum class IntegratorType {
    Euler,
    RK4
};

struct StateVector {
    double time_s = 0.0;
    double altitude_m = 0.0;
    double velocity_mps = 0.0;
    double acceleration_mps2 = 0.0;
    double mass_kg = 0.0;
    double position_x_m = 0.0;
    double position_z_m = 0.0;
};

class Integrator {
public:
    static StateVector step_euler(const StateVector& state,
                                 double dt_s,
                                 double thrust_n,
                                 double drag_n,
                                 double gravity_n,
                                 double mass_kg);

    static StateVector step_rk4(const StateVector& state,
                               double dt_s,
                               double thrust_n,
                               double drag_n,
                               double gravity_n,
                               double mass_kg);
};

}  // namespace aerolab
