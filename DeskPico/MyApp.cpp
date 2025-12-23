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
#include "NeoPixel.h"


MyApp::MyApp()
        : display(i2c_default, 0x3C, 128, 32),
          RGBLed(6, 1),
          RLed(7),
          buzzer(20),
          button(10)

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

qrcodegen::QrCode MyApp::generateQRCode(std::string address) {
    const qrcodegen::QrCode qr = qrcodegen::QrCode::encodeText(address.c_str(), qrcodegen::QrCode::Ecc::LOW);
    return qr;
}

void MyApp::changePositionEvent(std::string text) {
    RLed.on();
    displayText(text);
    buzzer.buzzTone(1000, 300);
    sleep_ms(5000);
    RLed.off();
}
void MyApp::displayText(std::string text) {
    display.clear();
    display.writeText(5,16,text.c_str());
    display.render();
}

void MyApp::run() {

    
    MQTT_CLIENT_T *state = mqtt_client_init();

    run_dns_lookup(state);
    
    mqtt_create_client(state);

    mqtt_test_connect(state);

    mqtt_wait_for_connection(state);

    mqtt_subscribe_to_topics(state);
        
    std::string message = "free";
    const qrcodegen::QrCode qr = generateQRCode("f1:50:c2:b8:bf:22");
    
    bool occupied = false; //false = qr code show, true = booked state

    //bool prevButtonState = false;

    while (true) {

    cyw43_arch_poll();

    if (state != nullptr && state->message[0] != '\0') {
        message.assign(state->message);
        state->message[0] = '\0';
    }
    else {
        message.clear();
        continue;
    }

    if(message == "red") {
        occupied = true;
    }
    else if(message == "green") {
        occupied = false;
    } 
    
    if(occupied) {  
        if(message == "sit") {
            changePositionEvent("SIT DOWN");
        }
        else if(message == "stand") {
            changePositionEvent("STAND UP");
        }
        displayText("OCCUPIED");
        RGBLed.setPixelColor(0,255,0,0);
    }
    else {
        if(message == "green") {
            display.clear();
            display.drawQRCode(20,0, qr, 1);
            display.renderRaw();
            RGBLed.setPixelColor(0,0,255,0); //Free
        }
        /*else if (message == "reserved") { // Is reserved - Yellow
            displayText("RESERVED");
            RGBLed.setPixelColor(0,255,255,0); //Booked - Green
        }*/
    }
    
    //bool btn = button.read();

    /* if (btn && !prevButtonState) {
        sleep_ms(50);
        if (button.read()) {
            occupied = !occupied;
            sleep_ms(150);
        }
    } */

    //prevButtonState = btn;
    message = "";
}
    cyw43_arch_deinit();
}
