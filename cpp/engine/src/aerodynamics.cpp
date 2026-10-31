#include "aerolab/aerodynamics.hpp"

#include <cmath>

namespace aerolab {

double Aerodynamics::drag_force_n(double density_kg_m3,
                                 double velocity_mps,
                                 double area_m2,
                                 double drag_coefficient) const {
    return 0.5 * density_kg_m3 * velocity_mps * velocity_mps * area_m2 * drag_coefficient;
}

double Aerodynamics::lift_force_n(double density_kg_m3,
                                 double velocity_mps,
                                 double area_m2,
                                 double lift_coefficient) const {
    return 0.5 * density_kg_m3 * velocity_mps * velocity_mps * area_m2 * lift_coefficient;
}

}  // namespace aerolab
