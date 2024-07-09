#include "driver_bluetooth.hpp"

int size = 4;
int sizex2 = 2*size;
int sizex3 = 3*size;
int sizex4 = 4*size;
int sizex5 = 5*size;

void sendData()
{

  memcpy(buffer, &peakToPeak, size);

  memcpy(buffer + size, &q[0], size);
  memcpy(buffer + sizex2, &q[1], size);
  memcpy(buffer + sizex3, &q[2], size);
  memcpy(buffer + sizex4, &q[3], size);

  double start = millis();
  SerialBT.write(buffer,sizex5);
  double end = millis();

  Serial.println(end-start);
}