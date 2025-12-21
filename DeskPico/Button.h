#ifndef BUTTON_H
#define BUTTON_H

#include <cstdint>

class Button {
public:
	Button(unsigned int pinNumber);

	// Read current raw button state (true = pressed)
	bool read() const;

private:
	unsigned int pin;
};

#endif // REDLED_H
