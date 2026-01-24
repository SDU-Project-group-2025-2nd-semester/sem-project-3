//=========================================================================
//  MyApp.h                                                                
//  Application class combining OLED display and LDR sensor.               
//=========================================================================

#ifndef MYAPP_H
#define MYAPP_H

//-------------------------------------------------------------------------
//  SELECT MODE: uncomment FUNCTION_OVERLOAD to use function overloading.  
//-------------------------------------------------------------------------
#define FUNCTION_OVERLOAD                                                  // Comment this line to use templates.
//-------------------------------------------------------------------------

#include "OLEDDisplay.h"
#include "MqttClient.h"
#include "NeoPixel.h"
#include "RedLed.h"
#include "Buzzer.h"
#include "Button.h"
#include <string>
#include <sstream>
#include <iomanip>
#include <ios>


class MyApp {
public:
    MyApp();                                                               
    void run();                                                            
    qrcodegen::QrCode generateQRCode(std::string address);
    void changePositionEvent(std::string text);
    void displayText(std::string text);                                          

private:                                                   
    OLEDDisplay display;                                                 
    NeoPixel RGBLed;
    RedLed RLed;
    Buzzer buzzer;
    Button button;
};

#endif
