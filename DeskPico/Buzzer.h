#ifndef BUZZER_H
#define BUZZER_H

#include <cstdint>

class Buzzer {
public: 
    Buzzer(unsigned int pinNumber);
    void buzzTone(unsigned int frequency, unsigned int duration_ms);
private:
    unsigned int pin;
};

#endif