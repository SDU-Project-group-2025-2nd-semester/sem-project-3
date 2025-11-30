//=========================================================================  
//  OLEDDisplay.cpp                                                        
//  Implementation of OLEDDisplay class.                                   
//  Handles initialization, rendering and text output for SSD1306 OLED.    
//=========================================================================  

#include "OLEDDisplay.h"
#include "ssd1306_font.h"
#include "qrcodegen.hpp"
#include <cctype>                                                           // For std::toupper

//-------------------------------------------------------------------------
//  Constructor: allocate frame buffer and store parameters                 
//-------------------------------------------------------------------------
OLEDDisplay::OLEDDisplay(i2c_inst_t* i2c, uint8_t addr, uint width, uint height)
    : _i2c(i2c), _addr(addr), _width(width), _height(height)
{
    _buffer = new uint8_t[_width * (_height / 8)]();                         // Allocate buffer and zero-initialize
}

//-------------------------------------------------------------------------
//  Sends a single command byte to OLED                                    
//-------------------------------------------------------------------------
void OLEDDisplay::sendCommand(uint8_t cmd) {
    uint8_t buf[2] = {0x80, cmd};                                            // 0x80 = control byte for command
    i2c_write_blocking(_i2c, _addr, buf, 2, false);
}

//-------------------------------------------------------------------------
//  Sends a list of commands to OLED                                       
//-------------------------------------------------------------------------
void OLEDDisplay::sendCommandList(const uint8_t* cmds, int count) {
    for (int i = 0; i < count; i++) sendCommand(cmds[i]);
}

//-------------------------------------------------------------------------
//  Sends data buffer to OLED (prepends control byte 0x40)                 
//-------------------------------------------------------------------------
void OLEDDisplay::sendBuffer(uint8_t* buf, int len) {
    uint8_t* tmp = new uint8_t[len + 1];
    tmp[0] = 0x40;
    memcpy(tmp + 1, buf, len);
    i2c_write_blocking(_i2c, _addr, tmp, len + 1, false);
    delete[] tmp;
}

//-------------------------------------------------------------------------
//  Initializes OLED with default parameters                               
//-------------------------------------------------------------------------
void OLEDDisplay::init() {
    uint8_t cmds[] = {
        SSD1306_SET_DISP,                                                   // Display off
        SSD1306_SET_MEM_MODE, 0x00,                                         // Horizontal addressing mode
        SSD1306_SET_DISP_START_LINE,                                        // Start line 0
        SSD1306_SET_SEG_REMAP | 0x01,                                       // Column 127 → SEG0
        SSD1306_SET_MUX_RATIO, SSD1306_HEIGHT - 1,                          // Multiplex ratio
        SSD1306_SET_COM_OUT_DIR | 0x00,                                     // Normal COM scan
        SSD1306_SET_DISP_OFFSET, 0x00,                                      // No offset
        SSD1306_SET_COM_PIN_CFG,
#if (SSD1306_WIDTH == 128 && SSD1306_HEIGHT == 32)
        0x02,                                                               // 128x32 configuration
#elif (SSD1306_WIDTH == 128 && SSD1306_HEIGHT == 64)
        0x12,                                                               // 128x64 configuration
#else
        0x02,
#endif
        SSD1306_SET_DISP_CLK_DIV, 0x80,                                     // Clock divide ratio
        SSD1306_SET_PRECHARGE, 0xF1,                                        // Precharge period
        SSD1306_SET_VCOM_DESEL, 0x30,                                       // VCOM deselect
        SSD1306_SET_CONTRAST, 0xFF,                                         // Max contrast
        SSD1306_SET_ENTIRE_ON,                                              // Display follows RAM
        SSD1306_SET_NORM_DISP,                                              // Normal mode
        SSD1306_SET_CHARGE_PUMP, 0x14,                                      // Enable charge pump
        SSD1306_SET_SCROLL | 0x00,                                          // Disable scroll
        SSD1306_SET_DISP | 0x01,                                            // Display on
    };
    sendCommandList(cmds, sizeof(cmds));
}

//-------------------------------------------------------------------------
//  Clears frame buffer and updates display                                
//-------------------------------------------------------------------------
void OLEDDisplay::clear() {
    memset(_buffer, 0, _width * (_height / 8));
    render();
}

//-------------------------------------------------------------------------
//  Renders frame buffer to display (flipped vertically for SSD1306 logic) 
//-------------------------------------------------------------------------
void OLEDDisplay::render() {
    for (int page = 0; page < (_height / 8); page++) {
        int flippedPage = (_height / 8) - 1 - page;
        sendCommand(0xB0 + page);                                           // Set page address
        sendCommand(0x00);                                                  // Lower column start
        sendCommand(0x10);                                                  // Higher column start
        sendBuffer(&_buffer[flippedPage * _width], _width);
    }
}

//-------------------------------------------------------------------------
//  Writes one character from font table to frame buffer                   
//-------------------------------------------------------------------------
void OLEDDisplay::writeChar(int x, int y, char c) {
    if (x > _width - 8 || y > _height - 8) return;
    y /= 8;
    c = std::toupper(c);
    int idx = (c >= 'A' && c <= 'Z') ? c - 'A' + 1 :
              (c >= '0' && c <= '9') ? c - '0' + 27 : 0;
    int fb_idx = y * _width + x;
    for (int i = 0; i < 8; i++) _buffer[fb_idx++] = font[idx * 8 + i];
}

//-------------------------------------------------------------------------
//  Writes a null-terminated string to buffer                              
//-------------------------------------------------------------------------
void OLEDDisplay::writeText(int x, int y, const char* text) {
    while (*text) {
        writeChar(x, y, *text++);
        x += 8;
    }
}


void OLEDDisplay::drawQRCode(int x0, int y0, const qrcodegen::QrCode &qr, int scale) {
    int size = qr.getSize();
    // For every column of data there is an empty column so that the QR code renders properly
    for (int by = 0; by < size; ++by) {
        for (int bx = 0; bx < size; ++bx) {
            bool bit = qr.getModule(bx, by);
            int baseX = x0 + bx * (scale + 1); // reserve one extra column per module
            int baseY = y0 + by * scale;
            // draw module block
            for (int dy = 0; dy < scale; ++dy) {
                for (int dx = 0; dx < scale; ++dx) {
                    setPixel(baseX + dx, baseY + dy, bit);
                }
                // explicit off column immediately to the right of the module
                setPixel(baseX + scale, baseY + dy, false);
            }
        }
    }
}


//-------------------------------------------------------------------------
//  Toggles display inversion                                              
//-------------------------------------------------------------------------
void OLEDDisplay::invert(bool on) {
    sendCommand(on ? SSD1306_SET_INV_DISP : SSD1306_SET_NORM_DISP);
}

void OLEDDisplay::setPixel(int x, int y, bool on) {
    if (x < 0 || x >= (int)_width || y < 0 || y >= (int)_height) return;
    int page = y / 8;
    int idx = page * _width + x;
    uint8_t mask = 1u << (y % 8);          // bit for that row within the page
    if (on) _buffer[idx] |= mask;
    else    _buffer[idx] &= ~mask;
}

// Send the entire framebuffer in one I2C transfer (avoids per-page loop).
// This arranges the pages in the same flipped order as the original `render()`
// so visual orientation is preserved, but uses a single data transfer.
void OLEDDisplay::renderRaw() {
    int pages = _height / 8;
    int len = _width * pages;
    // Set column and page address ranges so the controller accepts the incoming stream
    sendCommand(SSD1306_SET_COL_ADDR);
    sendCommand(0);                      // start column
    sendCommand((uint8_t)(_width - 1));  // end column
    sendCommand(SSD1306_SET_PAGE_ADDR);
    sendCommand(0);                      // start page
    sendCommand((uint8_t)(pages - 1));   // end page

    // Send pages in the same natural top->bottom order as stored in _buffer.
    // This keeps render() behavior unchanged while providing a contiguous
    // transfer that preserves the framebuffer layout.
    uint8_t* tmp = new uint8_t[len];
    for (int p = 0; p < pages; ++p) {
        memcpy(tmp + p * _width, _buffer + p * _width, _width);
    }

    sendBuffer(tmp, len);
    delete[] tmp;
}
