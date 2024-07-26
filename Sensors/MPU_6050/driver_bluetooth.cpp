#include "driver_bluetooth.hpp"

int size = 4;
int sizex2 = 2*size;
int sizex3 = 3*size;
int sizex4 = 4*size;

void sendData()
{

  memcpy(buffer, &q[0], size);
  memcpy(buffer + size, &q[1], size);
  memcpy(buffer + sizex2, &q[2], size);
  memcpy(buffer + sizex3, &q[3], size);

  SerialBT.write(buffer,sizex4);
}