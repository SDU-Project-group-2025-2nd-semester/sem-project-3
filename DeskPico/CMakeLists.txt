# Generated Cmake Pico project file

cmake_minimum_required(VERSION 3.13)

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

project(DeskPico C CXX ASM)

# Initialise the Raspberry Pi Pico SDK
pico_sdk_init()

# Add executable. Default name is the project name, version 0.1

add_compile_options(-Wall
        -Wno-format          # int != int32_t as far as the compiler is concerned because gcc has int32_t as long int
        -Wno-unused-function # we have some for the docs that aren't called
        -Wno-maybe-uninitialized
        )


if (PICO_CYW43_SUPPORTED) # set by BOARD=pico-w
    if (NOT TARGET pico_cyw43_arch)
        message("Skipping build as support is not available")
    else()
        set(WIFI_SSID "stehlovci" CACHE INTERNAL "WiFi SSID")
        set(WIFI_PASSWORD "38481963" CACHE INTERNAL "WiFi password")

        if ("stehlovci" STREQUAL "")
            message("Skipping build as WIFI_SSID is not defined")
        elseif ("38481963" STREQUAL "")
            message("Skipping build as WIFI_PASSWORD is not defined")
        else()
            add_executable(DeskPico
                DeskPico.cpp
                MyApp.cpp
                OLEDDisplay.cpp
                NeoPixel.cpp
                MqttClient.c
            )
            
            # Generate PIO header for WS2812
            pico_generate_pio_header(DeskPico ${CMAKE_CURRENT_LIST_DIR}/ws2812.pio)


            target_compile_definitions(DeskPico PRIVATE
            WIFI_SSID=\"stehlovci\"
            WIFI_PASSWORD=\"38481963\"
            TEST_TCP_SERVER_IP=\"${TEST_TCP_SERVER_IP}\"
            NO_SYS=1
            )

            target_include_directories(DeskPico PRIVATE
                ${CMAKE_CURRENT_LIST_DIR}
                ${CMAKE_CURRENT_LIST_DIR}/.. # for our common lwipopts
            )

            target_link_libraries(DeskPico
                pico_cyw43_arch_lwip_poll
                pico_stdlib
                pico_lwip_mbedtls
                pico_mbedtls
                pico_lwip_mqtt
                qrcodegencpp
                hardware_i2c
                hardware_adc
                hardware_pio
            )

        endif()
    endif()
endif()





pico_set_program_name(DeskPico "DeskPico")
pico_set_program_version(DeskPico "0.1")

# Modify the below lines to enable/disable output over UART/USB
pico_enable_stdio_uart(DeskPico 1)
pico_enable_stdio_usb(DeskPico 1)

# Add the standard library to the build
#target_link_libraries(DeskPico
 #       pico_stdlib
  #      qrcodegencpp
   #     hardware_i2c
    #    hardware_adc )

# Add the standard include files to the build
target_include_directories(DeskPico PRIVATE
        ${CMAKE_CURRENT_LIST_DIR}
        ${CMAKE_CURRENT_LIST_DIR}/qrcode
        ${CMAKE_CURRENT_LIST_DIR}/src
)

# Add QR code generator library (from cpp/)
add_library(qrcodegencpp STATIC
        ${CMAKE_CURRENT_LIST_DIR}/qrcode/qrcodegen.cpp
)
target_include_directories(qrcodegencpp PUBLIC
        ${CMAKE_CURRENT_LIST_DIR}/qrcode
)

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
#Enable stdio for the demo as well
pico_enable_stdio_uart(QrCodeGeneratorDemo 1)
pico_enable_stdio_usb(QrCodeGeneratorDemo 1)

# Produce UF2/bin outputs for the demo too
pico_add_extra_outputs(QrCodeGeneratorDemo)


pico_add_extra_outputs(DeskPico)



