cmake_minimum_required(VERSION 3.20)

find_package(Python 3 REQUIRED COMPONENTS Interpreter Development.Module)
include(FetchContent)
FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG v2.12.0
)
FetchContent_MakeAvailable(pybind11)

pybind11_add_module(aerolab_cpp pybind11_aerolab.cpp)
target_link_libraries(aerolab_cpp PRIVATE aerolab_engine)
