#include "driver_microphone.hpp"
#include "driver_accelerometer.hpp"
#include "driver_Mahony.hpp"

uint8_t buffer[32];

void setup()
{
  Serial.begin(115200);
  SerialBT.begin("ESP32");

  initAcc();
}


void loop()
{
  

  readMicro();
  readAcc();
  readQuaternion(a.acceleration.x, a.acceleration.y, a.acceleration.z, g.gyro.x, g.gyro.y, g.gyro.z);

  sendData();

}

