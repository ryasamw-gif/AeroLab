#pragma once

namespace aerolab {

class Aerodynamics {
public:
    [[nodiscard]] double drag_force_n(double density_kg_m3,
                                     double velocity_mps,
                                     double area_m2,
                                     double drag_coefficient) const;
    [[nodiscard]] double lift_force_n(double density_kg_m3,
                                     double velocity_mps,
                                     double area_m2,
                                     double lift_coefficient) const;
};

}  // namespace aerolab
