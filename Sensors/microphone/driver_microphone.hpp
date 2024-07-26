#ifndef H__DRIVER_M__H
#define H__DRIVER_M__H

#include "driver_bluetooth.hpp"

extern const int sampleWindow;  
extern int const AMP_PIN; //PIN D15      
extern unsigned int sample;
extern unsigned long startMillis;
extern unsigned int peakToPeak; 
extern unsigned int signalMax;
extern unsigned int signalMin;

void readMicro();

#endif