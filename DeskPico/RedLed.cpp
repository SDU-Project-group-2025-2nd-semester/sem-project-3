#include "RedLed.h"
#include "pico/stdlib.h"


RedLed::RedLed(unsigned int pinNumber) : pin(pinNumber) {

	gpio_init(pin);
	gpio_set_dir(pin, GPIO_OUT);
	gpio_put(pin, 0);
}

void RedLed::on() {
	gpio_put(pin, 1);
}

void RedLed::off() {
	gpio_put(pin, 0);
}