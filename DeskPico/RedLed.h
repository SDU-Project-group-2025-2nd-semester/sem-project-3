#ifndef REDLED_H
#define REDLED_H

#include <cstdint>

class RedLed {
public:
	explicit RedLed(unsigned int pinNumber);
	void on();
	void off();

private:
	unsigned int pin;
};

#endif // REDLED_H
