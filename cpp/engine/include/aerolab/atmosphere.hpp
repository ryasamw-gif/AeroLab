#pragma once

namespace aerolab {

class Atmosphere {
public:
    static constexpr double sea_level_density_kg_m3 = 1.225;
    static constexpr double lapse_rate_k_per_m = 0.0065;
    static constexpr double scale_height_m = 8500.0;
    static constexpr double gravity_m_s2 = 9.80665;

    [[nodiscard]] double density_kg_m3(double altitude_m) const;
    [[nodiscard]] double pressure_pa(double altitude_m) const;
    [[nodiscard]] double wind_speed_mps(double altitude_m) const;
};

}  // namespace aerolab
