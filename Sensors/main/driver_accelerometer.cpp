#include "driver_accelerometer.hpp"
Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;

void initAcc()
{
  if (!mpu.begin()) 
  {
    while (1) 
    {
      Serial.println("Failed to find MPU6050 chip");
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  delay(100);
}

void readAcc()
{
  mpu.getEvent(&a, &g, &temp);
}


