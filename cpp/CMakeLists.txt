cmake_minimum_required(VERSION 3.20)
project(aerolab_engine LANGUAGES CXX)

add_subdirectory(engine)
add_subdirectory(bindings)

if(BUILD_TESTING)
    add_subdirectory(tests)
endif()
