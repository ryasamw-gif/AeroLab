cmake_minimum_required(VERSION 3.20)
project(AeroLab LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

option(BUILD_TESTING "Build tests" ON)

enable_testing()
add_subdirectory(cpp)
