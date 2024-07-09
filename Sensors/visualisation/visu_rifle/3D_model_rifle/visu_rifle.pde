import processing.serial.*;
import processing.opengl.*;
import toxi.geom.*;
import toxi.processing.*;
import processing.net.*;

ToxiclibsSupport gfx;

float[] q = new float[4];
toxi.geom.Quaternion quat = new toxi.geom.Quaternion(1, 0, 0, 0);
int shot = 0;

float pitch = 0.0;
float yaw = 0.0;
float roll = 0.0;

Server server;
int port = 12345;

boolean target = false;

PShape rifle;

float sensitivity = 0.01;

boolean mouseClicked = false;
float sceneRotationX = 0.0;
float sceneRotationY = 0.0;

float offsetX = 0;
float offsetY = 0;

int zoomLevel = 3;

boolean mode = false; // 0 : rotation, 1 : translation

void setup() {
    
    size(600, 600, P3D);
    gfx = new toxi.processing.ToxiclibsSupport(this);

    lights();
    smooth();
  
    server = new Server(this, port);
    
    rifle = loadShape("3D_model_rifle/11737_rifle_v1_L2.obj");
}

void draw() {
    background(255);

    Client client = server.available();
    if (client != null) 
    {
       getQuaternion(client);
    }
    
    translate(width / 2, height / 2);
    
    if(target == true)
    {
      drawTarget(-width/2 +50 ,-height/2 + 50,100,10);
    }
    
    translateScene();
    rotateScene();
    scale(zoomLevel);
    
    pushMatrix();
    rotateX(radians(90));
    rotateZ(radians(-90));
    drawPitch();
    drawRoll();
    drawYaw();
    popMatrix();
    
    pushMatrix();
    displayRifle();
    drawPitch();
    drawRoll();
    drawYaw();
    popMatrix();
}

void getQuaternion(Client client)
{
  byte[] data = client.readBytes();
        
  if (data != null) 
  {
      q[0] = byteArrayToFloat(data,0);
      q[1] = byteArrayToFloat(data,4);
      q[2] = byteArrayToFloat(data,8);
      q[3] = byteArrayToFloat(data,12);
      
      if(data[16] == 49)
      {
        target = true;
      }
      else
      {
        target = false;
      }
      
      quat.set(q[0], q[1], q[2], q[3]);
  }
}

void displayRifle()
{
    
    float[] axis = quat.toAxisAngle();
    rotate(axis[0], -axis[1], axis[3], axis[2]);

    rotateX(radians(90));
    rotateZ(radians(-90));
    
    shape(rifle);
}

void drawTarget(float x, float y, float outerRadius, int numCircles) 
{
  float circleSpacing = outerRadius / numCircles;

  for (int i = 0; i < numCircles; i++) 
  {
    float diameter = outerRadius - i * circleSpacing * 2;
    if (i % 2 == 0) 
    {
      fill(255); 
    } 
    else 
    {
      fill(0); 
    }
    ellipse(x, y, diameter, diameter);
  }
}


void drawPitch()
{
  stroke(0,255,0);
  line(0, -75, 0, 0, 75, 0);
}

void drawYaw()
{
  stroke(255,0,0);
  line(0, 0, -75, 0, 0, 75);
}

void drawRoll()
{
  stroke(0,0,255);
  line(-75, 0, 0, 75, 0, 0);
}

void rotateScene()
{
  if (mouseClicked && !mode) 
  {
      sceneRotationX += (mouseY - pmouseY) * sensitivity;
      sceneRotationY -= (mouseX - pmouseX) * sensitivity;
  }
    rotateX(sceneRotationX);
    rotateY(sceneRotationY);
}

void translateScene()
{
  if (mouseClicked && mode)
  {
    float dx = mouseX - pmouseX;
    float dy = mouseY - pmouseY;

    offsetX += dx;
    offsetY += dy;
  }
  translate(offsetX, offsetY);
}


float byteArrayToFloat(byte[] bytes, int offset) 
{
  return Float.intBitsToFloat((bytes[offset + 0] & 0xFF) | 
                              ((bytes[offset + 1] & 0xFF) << 8) | 
                              ((bytes[offset + 2] & 0xFF) << 16) | 
                              ((bytes[offset + 3] & 0xFF) << 24));
}


void mousePressed() 
{
    mouseClicked = true;
}

void mouseReleased() 
{ 
    mouseClicked = false;
}

void mouseWheel(MouseEvent event)
{
  int delta = event.getCount();
  zoomLevel -= delta;
  zoomLevel = constrain(zoomLevel, 1, 10);
}

void keyPressed() 
{
  switch(key) 
  {
    case 'm':
      mode = !mode;
      break;
      
    case 'r' :
      sceneRotationX = 0.0;
      sceneRotationY = 0.0;
      offsetX = 0;
      offsetY = 0;
      break;
 
    default:
      break;
  }
}
