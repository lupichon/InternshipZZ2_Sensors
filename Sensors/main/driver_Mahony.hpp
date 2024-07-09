#ifndef H__MAHONY__H
#define H__MAHONY__H

#include <Wire.h>
#include <Arduino.h>
#include "driver_bluetooth.hpp"

extern float q[4];
extern float Kp;
extern float Ki;
extern unsigned long now, last;

void Mahony_update(float ax, float ay, float az, float gx, float gy, float gz, float deltat);
void readQuaternion(float ax, float ay, float az, float gx, float gy, float gz);

#endif

