#include "MyApp.h"
#include "pico/stdlib.h"
#include "hardware/i2c.h"


MyApp::MyApp()
    :                                                                
      display(i2c_default, 0x3C, 128, 32)                                  
{
    stdio_init_all();                                                      
    i2c_init(i2c_default, 400 * 1000);                                     
    gpio_set_function(PICO_DEFAULT_I2C_SDA_PIN, GPIO_FUNC_I2C);            
    gpio_set_function(PICO_DEFAULT_I2C_SCL_PIN, GPIO_FUNC_I2C);            
    gpio_pull_up(PICO_DEFAULT_I2C_SDA_PIN);                                
    gpio_pull_up(PICO_DEFAULT_I2C_SCL_PIN);

    display.init();                                                        
    display.clear();                                                       
}

    const uint LED_PIN = 7;
    const uint BTN_PIN = 10;
    const uint LED_OFF = 0;
    const uint LED_ON = 1;
    const uint BUZZ_PIN = 20;

// function that fetches the height of the table
std::string MyApp::getHeight() {
    std::string height = "150";
    return height;
}
//function which displays the final string
std::string MyApp::getTableInfo() {
    std::string str_height = getHeight() + "MM";    
    return str_height;
}

std::string MyApp::getBarcode() {
    std::string barcode = "PLCHLDR";
    return barcode;
}

std::string MyApp::standUp() {
    std::string str = "Stand Up";
    return str;
}


void MyApp::buzzTone(unsigned int frequency, unsigned int duration_ms) {
    if (frequency == 0 || duration_ms == 0) return;

    gpio_init(BUZZ_PIN);
    gpio_set_dir(BUZZ_PIN, true);

    unsigned int cycles = (frequency * duration_ms) / 1000;
    unsigned int half_period_us = 500000u / frequency;

    for (unsigned int i = 0; i < cycles; ++i) {
        gpio_put(BUZZ_PIN, 1);
        sleep_us(half_period_us);
        gpio_put(BUZZ_PIN, 0);
        sleep_us(half_period_us);
    }
}

void MyApp::buzz() {
    buzzTone(1000, 20);
}



void MyApp::run() {
    stdio_init_all();

    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, true);

    gpio_init(BTN_PIN);
    gpio_set_dir(BTN_PIN, false);
    gpio_pull_down(BTN_PIN);
        
    bool ledState = false;
    bool prevPressed = false;
    uint32_t lastDebounce = 0;
    const uint32_t debounceMs = 50;
    bool stand = true;
    bool buzzing = true;
    while (true) {
        
        bool rawPressed = (gpio_get(BTN_PIN) == 1);
        uint32_t now = to_ms_since_boot(get_absolute_time());
        
        if (rawPressed && !prevPressed && (now - lastDebounce) > debounceMs) {
        ledState = !ledState;           
        lastDebounce = now;
        }
        
        prevPressed = rawPressed;

        //gpio_put(LED_PIN, ledState ? LED_ON : LED_OFF);                                
        
        display.clear();

        if(ledState && !stand && !buzzing) {
        display.writeText(5, 0, "TABLE HEIGHT");                          
        display.writeText(5, 8, getTableInfo().c_str());
        }
        else if(ledState && stand && buzzing) {
        gpio_put(LED_PIN, LED_ON);
        display.writeText(5, 8, standUp().c_str());
        buzz();
        }
        else {
        gpio_put(LED_PIN, LED_OFF);
        display.writeText(5,0, getBarcode().c_str());
        }
        display.render(); 
                  
        //display.writeText(5, 16, "TEST");               

        sleep_ms(100);                                                    
    }
}
