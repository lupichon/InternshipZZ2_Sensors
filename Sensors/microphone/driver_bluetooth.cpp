#include "driver_bluetooth.hpp"

int size = 4;


void sendData()
{

  memcpy(buffer, &peakToPeak, size);
  SerialBT.write(buffer,size);
}