#pragma once

#include <string>
#include <unordered_map>
#include <vector>

namespace aerolab {

struct Component {
    std::string name;
    std::string type;
    std::string material;
    double mass_kg = 0.0;
    double length_m = 0.0;
    double radius_m = 0.0;
    double thickness_m = 0.0;
    double drag_coefficient = 0.3;
    std::unordered_map<std::string, double> properties;
};

struct RocketConfiguration {
    std::string name = "AeroLab Rocket";
    std::vector<Component> components;
    double motor_thrust_n = 1500.0;
    double burn_time_s = 4.0;
    double propellant_mass_kg = 2.5;
    double launch_angle_deg = 85.0;
    double initial_altitude_m = 0.0;

    [[nodiscard]] double total_mass_kg() const;
    [[nodiscard]] double cg_m() const;
    [[nodiscard]] double reference_area_m2() const;
    [[nodiscard]] double reference_length_m() const;
};

}  // namespace aerolab
