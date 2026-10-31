cmake_minimum_required(VERSION 3.20)

add_executable(test_simulation test_simulation.cpp)
target_link_libraries(test_simulation PRIVATE aerolab_engine)
add_test(NAME test_simulation COMMAND test_simulation)

add_executable(test_integrators test_integrators.cpp)
target_link_libraries(test_integrators PRIVATE aerolab_engine)
add_test(NAME test_integrators COMMAND test_integrators)
