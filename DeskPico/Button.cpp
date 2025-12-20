#include "Button.h"
#include "pico/stdlib.h"


Button::Button(unsigned int pinNumber) : pin(pinNumber) {

	gpio_init(pin);
    gpio_set_dir(pin, false);
    gpio_pull_down(pin);
}

