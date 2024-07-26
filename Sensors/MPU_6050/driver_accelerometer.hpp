#ifndef H__DRIVER_A__H
#define H__DRIVER_A__H

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include "driver_bluetooth.hpp"


extern Adafruit_MPU6050 mpu;
extern sensors_event_t a, g, temp;

void initAcc();
void readAcc();

#endif