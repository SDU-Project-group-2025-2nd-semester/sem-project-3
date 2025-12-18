#include "MyApp.h"
#include "pico/stdlib.h"
#include "hardware/i2c.h"
#include "qrcodegen.hpp"
#include <string.h>
#include <string>
#include <time.h>
#include "pico/cyw43_arch.h"
#include "lwip/pbuf.h"
#include "lwip/tcp.h"
#include "lwip/dns.h"
#include "lwip/altcp_tcp.h"
#include "lwip/altcp_tls.h"
#include "lwip/apps/mqtt.h"
#include "lwip/apps/mqtt_priv.h"
#include "crypto_consts.h"
#include "tusb.h"
#include "MqttClient.h"


MyApp::MyApp()
    :                                                                
      display(i2c_default, 0x3C, 128, 32)                                  
{
    stdio_init_all();
    
    if (cyw43_arch_init()) {
        printf("failed to initialise\n");
        //return 1;
    }

    cyw43_arch_enable_sta_mode();

    printf("Connecting to WiFi...\n");
    if (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000)) {
        printf("failed to  connect.\n");
        //return 1;
    } else {
        printf("Connected.\n");
    }


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

std::string MyApp::updateStatus() {
    // Logic for receiveing message from mqtt
    std::string str = "";
    return str;
}

std::string MyApp::receiveAdress() {
    // Logic for receiving the address of the pico from mqtt
    std::string str = "";
    return str;
}

qrcodegen::QrCode MyApp::generateQRCode(std::string address) {
    const qrcodegen::QrCode qr = qrcodegen::QrCode::encodeText(address.c_str(), qrcodegen::QrCode::Ecc::LOW);
    return qr;
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
    buzzTone(1000, 2000);
}


    


void MyApp::run() {

    
    MQTT_CLIENT_T *state = mqtt_client_init();

    run_dns_lookup(state);
    
    mqtt_create_client(state);

    mqtt_test_connect(state);

    mqtt_wait_for_connection(state);

    mqtt_subscribe_to_topics(state);

    

    

    
    
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
    int counter = 0;
    bool pressedEvent = false;
    std::string message = ""; //sitting, standing, buzzing, will be updated from the topic
    //std::string message((const char*)buffer);
    //qr code generation
    const qrcodegen::QrCode qr = generateQRCode("address");

    display.drawQRCode(20,0, qr, 1);
    display.renderRaw(); 
    
    while (true) {
        
        bool rawPressed = (gpio_get(BTN_PIN) == 1);
        uint32_t now = to_ms_since_boot(get_absolute_time());
        
        pressedEvent = false;
        if (rawPressed && !prevPressed && (now - lastDebounce) > debounceMs) {
            counter = (counter % 3) + 1;
            pressedEvent = true;
            lastDebounce = now;
        }
        
        prevPressed = rawPressed;

        //gpio_put(LED_PIN, ledState ? LED_ON : LED_OFF);                                
        //display.drawQRCode(0, 0, qr, 1);
        //display.writeText(5, 16, "TEST");
        //display.render(); 
        //display.clear();
        
        /* if(status == "buzzing") {
            display.writeText(5,16, "STAND UP");
            buzz();
        }
        else if(status == "sitting") {
            display.writeText(5,16, "SIT");
        }
        else if(status == "standing") {
            gpio_put(LED_PIN, LED_OFF);
            display.writeText(5,16, "STAND");
        } */

        /* if (pressedEvent) {
            display.clear();
            switch(counter) {
                case 1:
                    display.writeText(5,16, "STAND UP");
                    display.render();
                    gpio_put(LED_PIN, LED_ON);
                    buzz();
                    gpio_put(LED_PIN, LED_OFF);
                    break;
                case 2:
                    display.writeText(5,16, "STANDING");
                    display.render();
                    break;
                case 3:
                    display.writeText(5,16, "SITTING");
                    display.render();
                    break;
            }
            
        } */

        
        cyw43_arch_poll();
        if (state != nullptr && state->message[0] != '\0') {
            message.assign(state->message);
        } else {
            message.clear();
        }
        sleep_ms(10);                                                
    }
    cyw43_arch_deinit();
}
