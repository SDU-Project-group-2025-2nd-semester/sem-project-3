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
#include <string>
#include <sstream>
#include <iomanip>
#include <ios>


class MyApp {
public:
    MyApp();                                                               
    void run();                                                            
    std::string getHeight();
    std::string getTableInfo();
    std::string standUp();
    std::string updateStatus();
    std::string receiveAdress();
    qrcodegen::QrCode generateQRCode(std::string address);
    std::string getBarcode();
    void buzzTone(unsigned int frequency, unsigned int duration_ms);     
    void buzz();                                                       

private:                                                   
    OLEDDisplay display;                                                 
};

#endif
