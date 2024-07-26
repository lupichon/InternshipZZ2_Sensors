#include "driver_microphone.hpp"

uint8_t buffer[32];

void setup()
{
  Serial.begin(115200);
  SerialBT.begin("ESP32");

}


void loop()
{
  readMicro();
  sendData();
}