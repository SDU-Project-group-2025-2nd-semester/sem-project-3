#ifndef BUTTON_H
#define BUTTON_H

#include <cstdint>

class Button {
public:
	Button(unsigned int pinNumber);

private:
	unsigned int pin;
};

#endif // REDLED_H
