#include "Button.h"
#include "pico/stdlib.h"


Button::Button(unsigned int pinNumber) : pin(pinNumber) {

	gpio_init(pin);
    gpio_set_dir(pin, GPIO_IN);
    gpio_pull_down(pin);
}

bool Button::read() const {
    return gpio_get(pin);
}

