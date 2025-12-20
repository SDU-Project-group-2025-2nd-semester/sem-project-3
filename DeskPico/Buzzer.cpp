#include "Buzzer.h"
#include "pico/stdlib.h"


Buzzer::Buzzer(unsigned int pinNumber) : pin(pinNumber) {
    gpio_init(pin);
    gpio_set_dir(pin, true);
}


void Buzzer::buzzTone(unsigned int frequency, unsigned int duration_ms) {
    if (frequency == 0 || duration_ms == 0) return;

    unsigned int cycles = (frequency * duration_ms) / 1000;
    unsigned int half_period_us = 500000u / frequency;

    for (unsigned int i = 0; i < cycles; ++i) {
        gpio_put(pin, 1);
        sleep_us(half_period_us);
        gpio_put(pin, 0);
        sleep_us(half_period_us);
    }
}
