add_library(aerolab_engine
    src/rocket_config.cpp
    src/atmosphere.cpp
    src/aerodynamics.cpp
    src/integrators.cpp
    src/physics.cpp
    src/simulation.cpp
)

target_include_directories(aerolab_engine
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(aerolab_engine PUBLIC cxx_std_20)
