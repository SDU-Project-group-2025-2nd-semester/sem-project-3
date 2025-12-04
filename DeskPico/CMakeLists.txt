# Generated Cmake Pico project file

cmake_minimum_required(VERSION 3.13)

project(DeskPico C CXX ASM)


set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Initialise pico_sdk from installed location
# (note this can come from environment, CMake cache etc)

# == DO NOT EDIT THE FOLLOWING LINES for the Raspberry Pi Pico VS Code Extension to work ==
if(WIN32)
    set(USERHOME $ENV{USERPROFILE})
else()
    set(USERHOME $ENV{HOME})
endif()
set(sdkVersion 2.2.0)
set(toolchainVersion 14_2_Rel1)
set(picotoolVersion 2.2.0-a4)
set(picoVscode ${USERHOME}/.pico-sdk/cmake/pico-vscode.cmake)
if (EXISTS ${picoVscode})
    include(${picoVscode})
endif()
# ====================================================================================
set(PICO_BOARD pico_w CACHE STRING "Board type")

# Pull in Raspberry Pi Pico SDK (must be before project)
include(pico_sdk_import.cmake)

# Initialise the Raspberry Pi Pico SDK
pico_sdk_init()

# Add Paho embedded-c subdirectory early so its targets exist before linking.
# Adjust path if paho is located somewhere else relative to this CMake file.
add_subdirectory(${CMAKE_CURRENT_LIST_DIR}/externals/paho-embedded-c)

# Add QR code generator library (from cpp/) before linking to it
add_library(qrcodegencpp STATIC
    ${CMAKE_CURRENT_LIST_DIR}/qrcode/qrcodegen.cpp
)
target_include_directories(qrcodegencpp PUBLIC
    ${CMAKE_CURRENT_LIST_DIR}/qrcode
)

# Add executable. Default name is the project name, version 0.1
add_executable(DeskPico
    DeskPico.cpp
    MyApp.cpp
    OLEDDisplay.cpp
)

pico_set_program_name(DeskPico "DeskPico")
pico_set_program_version(DeskPico "0.1")

# Modify the below lines to enable/disable output over UART/USB
pico_enable_stdio_uart(DeskPico 1)
pico_enable_stdio_usb(DeskPico 1)

# Include directories
target_include_directories(DeskPico PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}
    ${CMAKE_CURRENT_LIST_DIR}/qrcode
    ${CMAKE_CURRENT_LIST_DIR}/src
    ${CMAKE_SOURCE_DIR}/externals/paho-embedded-c/MQTTClient
    ${CMAKE_SOURCE_DIR}/externals/paho-embedded-c/MQTTPacket
)

# Link libraries. Only link Paho if a matching target exists (common target names checked)
target_link_libraries(DeskPico PRIVATE
    pico_stdlib
    qrcodegencpp
)

# Common Paho embedded-c target names differ between versions/repo layout.
# Check for likely targets and link if present.
if(TARGET MQTTClient)
    target_link_libraries(DeskPico PRIVATE MQTTClient)
elseif(TARGET MQTTClient-C)
    target_link_libraries(DeskPico PRIVATE "MQTTClient-C")
elseif(TARGET paho-embed-mqtt3c)
    target_link_libraries(DeskPico PRIVATE paho-embed-mqtt3c)
endif()

# Add any user requested pico libraries
target_link_libraries(DeskPico PRIVATE
    hardware_i2c
    hardware_adc
)

pico_add_extra_outputs(DeskPico)

# Optional demo executable that builds the Project Nayuki demo using the QR library
add_executable(QrCodeGeneratorDemo
    ${CMAKE_CURRENT_LIST_DIR}/qrcode/QrCodeGeneratorDemo.cpp
)
target_link_libraries(QrCodeGeneratorDemo
    qrcodegencpp
    pico_stdlib
)
target_include_directories(QrCodeGeneratorDemo PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/qrcode
)
pico_set_program_name(QrCodeGeneratorDemo "QrCodeGeneratorDemo")
pico_set_program_version(QrCodeGeneratorDemo "0.1")
# Enable stdio for the demo as well
pico_enable_stdio_uart(QrCodeGeneratorDemo 1)
pico_enable_stdio_usb(QrCodeGeneratorDemo 1)

# Produce UF2/bin outputs for the demo too
pico_add_extra_outputs(QrCodeGeneratorDemo)

target_sources(DeskPico PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/paho_client.c
)

