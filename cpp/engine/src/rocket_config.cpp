#include "aerolab/rocket_config.hpp"

#include <cmath>
#include <algorithm>

namespace aerolab {

double RocketConfiguration::total_mass_kg() const {
    double mass = 0.0;
    for (const auto& component : components) {
        mass += component.mass_kg;
    }
    return mass + propellant_mass_kg;
}

double RocketConfiguration::cg_m() const {
    if (components.empty()) {
        return 0.0;
    }

    double total_weight = 0.0;
    double weighted_length = 0.0;
    for (const auto& component : components) {
        total_weight += component.mass_kg;
        weighted_length += component.mass_kg * component.length_m;
    }

    if (total_weight <= 0.0) {
        return 0.0;
    }

    return weighted_length / total_weight;
}

double RocketConfiguration::reference_area_m2() const {
    double max_radius = 0.0;
    for (const auto& component : components) {
        if (component.radius_m > max_radius) {
            max_radius = component.radius_m;
        }
    }

    if (max_radius <= 0.0) {
        return 0.1;
    }

    return M_PI * max_radius * max_radius;
}

double RocketConfiguration::reference_length_m() const {
    double length = 0.0;
    for (const auto& component : components) {
        length += component.length_m;
    }
    return std::max(length, 0.1);
}

}  // namespace aerolab
