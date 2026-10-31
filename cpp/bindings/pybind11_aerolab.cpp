#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "aerolab/atmosphere.hpp"
#include "aerolab/aerodynamics.hpp"
#include "aerolab/integrators.hpp"
#include "aerolab/rocket_config.hpp"
#include "aerolab/simulation.hpp"

namespace py = pybind11;

PYBIND11_MODULE(aerolab_cpp, m) {
    m.doc() = "AeroLab C++ computational engine binding.";

    py::class_<aerolab::Component>(m, "Component")
        .def(py::init<>())
        .def_readwrite("name", &aerolab::Component::name)
        .def_readwrite("type", &aerolab::Component::type)
        .def_readwrite("material", &aerolab::Component::material)
        .def_readwrite("mass_kg", &aerolab::Component::mass_kg)
        .def_readwrite("length_m", &aerolab::Component::length_m)
        .def_readwrite("radius_m", &aerolab::Component::radius_m)
        .def_readwrite("thickness_m", &aerolab::Component::thickness_m)
        .def_readwrite("drag_coefficient", &aerolab::Component::drag_coefficient);

    py::class_<aerolab::RocketConfiguration>(m, "RocketConfiguration")
        .def(py::init<>())
        .def_readwrite("name", &aerolab::RocketConfiguration::name)
        .def_readwrite("components", &aerolab::RocketConfiguration::components)
        .def_readwrite("motor_thrust_n", &aerolab::RocketConfiguration::motor_thrust_n)
        .def_readwrite("burn_time_s", &aerolab::RocketConfiguration::burn_time_s)
        .def_readwrite("propellant_mass_kg", &aerolab::RocketConfiguration::propellant_mass_kg)
        .def_readwrite("launch_angle_deg", &aerolab::RocketConfiguration::launch_angle_deg)
        .def_readwrite("initial_altitude_m", &aerolab::RocketConfiguration::initial_altitude_m)
        .def("total_mass_kg", &aerolab::RocketConfiguration::total_mass_kg)
        .def("cg_m", &aerolab::RocketConfiguration::cg_m)
        .def("reference_area_m2", &aerolab::RocketConfiguration::reference_area_m2)
        .def("reference_length_m", &aerolab::RocketConfiguration::reference_length_m);

    py::class_<aerolab::StateVector>(m, "StateVector")
        .def_readonly("time_s", &aerolab::StateVector::time_s)
        .def_readonly("altitude_m", &aerolab::StateVector::altitude_m)
        .def_readonly("velocity_mps", &aerolab::StateVector::velocity_mps)
        .def_readonly("acceleration_mps2", &aerolab::StateVector::acceleration_mps2)
        .def_readonly("mass_kg", &aerolab::StateVector::mass_kg)
        .def_readonly("position_x_m", &aerolab::StateVector::position_x_m)
        .def_readonly("position_z_m", &aerolab::StateVector::position_z_m);

    py::enum_<aerolab::IntegratorType>(m, "IntegratorType")
        .value("Euler", aerolab::IntegratorType::Euler)
        .value("RK4", aerolab::IntegratorType::RK4)
        .export_values();

    py::class_<aerolab::SimulationResult>(m, "SimulationResult")
        .def_readonly("trajectory", &aerolab::SimulationResult::trajectory)
        .def_readonly("peak_altitude_m", &aerolab::SimulationResult::peak_altitude_m)
        .def_readonly("max_velocity_mps", &aerolab::SimulationResult::max_velocity_mps)
        .def_readonly("apogee_time_s", &aerolab::SimulationResult::apogee_time_s);

    py::class_<aerolab::Atmosphere>(m, "Atmosphere")
        .def(py::init<>())
        .def("density_kg_m3", &aerolab::Atmosphere::density_kg_m3)
        .def("pressure_pa", &aerolab::Atmosphere::pressure_pa)
        .def("wind_speed_mps", &aerolab::Atmosphere::wind_speed_mps);

    py::class_<aerolab::Aerodynamics>(m, "Aerodynamics")
        .def(py::init<>())
        .def("drag_force_n", &aerolab::Aerodynamics::drag_force_n)
        .def("lift_force_n", &aerolab::Aerodynamics::lift_force_n);

    py::class_<aerolab::FlightSimulation>(m, "FlightSimulation")
        .def(py::init<const aerolab::RocketConfiguration&, double, double, double>(),
             py::arg("rocket_config"),
             py::arg("time_step_s") = 0.05,
             py::arg("max_duration_s") = 60.0,
             py::arg("drag_coefficient") = 0.35)
        .def("run", &aerolab::FlightSimulation::run,
             py::arg("integrator_type") = aerolab::IntegratorType::RK4);
}
