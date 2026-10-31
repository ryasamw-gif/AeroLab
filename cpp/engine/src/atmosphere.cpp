#include "aerolab/atmosphere.hpp"

#include <cmath>

namespace aerolab {

double Atmosphere::density_kg_m3(double altitude_m) const {
    const double h = std::max(altitude_m, 0.0);
    return sea_level_density_kg_m3 * std::exp(-h / scale_height_m);
}

double Atmosphere::pressure_pa(double altitude_m) const {
    const double h = std::max(altitude_m, 0.0);
    return 101325.0 * std::pow(1.0 - (lapse_rate_k_per_m * h / 288.15), 5.255);
}

double Atmosphere::wind_speed_mps(double altitude_m) const {
    const double h = std::max(altitude_m, 0.0);
    return 2.0 + 0.02 * h;
}

}  // namespace aerolab
