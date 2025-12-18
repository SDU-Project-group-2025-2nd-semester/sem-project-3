#include "NeoPixel.h"
#include "ws2812.pio.h"
#include <cstddef>
#include <cstdint>
#include <pico/time.h>
#include "ws2812.pio.h"

/*****************************
NEOPIXEL LIBRARY
******************************/
// Constructor: Initializes NeoPixel with given pin number and number of LEDs
NeoPixel::NeoPixel(uint8_t pinNumber, uint16_t numberOfPixels) {
    this->pixelSm = 0;                         // Use state machine 0 of the PIO
    this->pixelPio = pio0;                     // Use PIO0 hardware
    this->Init(pinNumber, numberOfPixels);     // Call initialization function
}

// Initializes the PIO program for controlling WS2812 LEDs (NeoPixel)
void NeoPixel::Init(uint8_t pinNumber, uint16_t numberOfPixels) {
    uint offset = pio_add_program(this->pixelPio, &ws2812_program); // Load WS2812 PIO program
    ws2812_program_init(this->pixelPio, this->pixelSm, offset, pinNumber, 800000, false); // Initialize with 800kHz

    this->actual_number_of_pixels = numberOfPixels; // Store number of LEDs

    // Initialize all pixel colors to off (0,0,0)
    for (uint16_t i = 0; i < this->actual_number_of_pixels; i++) {
        this->pixelBuffer[i][0] = 0; // Red
        this->pixelBuffer[i][1] = 0; // Green
        this->pixelBuffer[i][2] = 0; // Blue
    }

    this->Show();  // Update LEDs to reflect buffer
    sleep_ms(1);      // Short delay to stabilize
}

// Sets the RGB color of a specific LED and updates the strip
void NeoPixel::setPixelColor(uint16_t pixelNumber, uint8_t r, uint8_t g, uint8_t b) {
    this->pixelBuffer[pixelNumber][0] = r;  // Set red value
    this->pixelBuffer[pixelNumber][1] = g;  // Set green value
    this->pixelBuffer[pixelNumber][2] = b;  // Set blue value
    this->Show();                           // Send updated colors to LED strip
}

// Fills all LEDs with the same RGB color and updates the strip
void NeoPixel::Fill(uint8_t r, uint8_t g, uint8_t b) {
    for (uint16_t i = 0; i < this->actual_number_of_pixels; i++) {
        this->pixelBuffer[i][0] = r;  // Set red
        this->pixelBuffer[i][1] = g;  // Set green
        this->pixelBuffer[i][2] = b;  // Set blue
    }
    this->Show(); // Update all pixels at once
}

// Sends the RGB data of each pixel to the NeoPixel strip
void NeoPixel::Show(void) {
    for (uint16_t i = 0; i < this->actual_number_of_pixels; i++) {
        this->putPixel(                  // Send encoded pixel color
            urgb_u32(                    // Convert RGB values to 24-bit GRB format
                pixelBuffer[i][0],       // Red
                pixelBuffer[i][1],       // Green
                pixelBuffer[i][2]        // Blue
            )
        );
    }
}

// Converts individual RGB values into a single 24-bit GRB value
uint32_t NeoPixel::urgb_u32(uint8_t r, uint8_t g, uint8_t b) {
    return
        ((uint32_t)(r) << 8) |          // Red in bits 15-8
        ((uint32_t)(g) << 16) |         // Green in bits 23-16
        (uint32_t)(b);                  // Blue in bits 7-0
}

// Sends a single pixel's GRB data to the PIO state machine
void NeoPixel::putPixel(uint32_t pixel_grb) {
    pio_sm_put_blocking(this->pixelPio, this->pixelSm,
                        pixel_grb << 8u); // Shift data to match 24-bit WS2812 format
}