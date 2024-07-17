# Developement of a sensor suite to aid atlete training for the ISSF 10 meter air rifle event

10-meter air rifle shooting is a demanding discipline requiring exceptional precision and perfect mastery of technique. To enhance athletes' performance in this discipline, it is crucial to understand in detail the movements of the athlete's body as well as those of their rifle, as they can affect shooting accuracy. Various sensors offer the possibility to collect precise data on these movements and identify errors that the athlete could correct to improve their performance.

The first part of my work involves designing, prototyping, and testing a range of sensors to provide coaches and athletes with valuable data to optimize training and improve performance over time. Among the important parameters to consider are the athlete's balance, posture, position, and stress. To measure the athlete's balance and more precisely their center of gravity, pressure sensors can be used. The athlete's posture and position can be measured by an inertial measurement unit, coupling both an accelerometer and a gyroscope. 

The second part of my work focuses on creating a website where the athlete can create an account and log in. This website offers two main features. The first feature focuses on real-time data, allowing the athlete to access as much information as possible provided by the sensors during their training. Throughout their session, they can see the evolution of the previously mentioned parameters. The second feature is post-session data visualisation. This means that in the following days, the user can review and analyze a multitude of information over a given period around the time of their shot.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contribuer](#contribuer)
- [Auteurs](#auteurs)
- [Remerciements](#remerciements)

## Installation

Follow these steps to install and configure the project on your local machine.

### Prerequisites

Before installing the project, make sure you have the following installed : 

- [Python](https://www.python.org/) (version 3.9)
- [Arduino IDE](https://www.arduino.cc/en/software) (version 2.3 or highter, optional; only if you need to program electronic boards)

### Instructions

1. virtualenv -p python3.9 venv 
2. source ./venv/bin/activate  # On Windows, use .\venv\Scripts\activate
3. git clone https://github.com/lupichon/InternshipZZ2_Sensors.git
4. cd InternshipZZ2_Sensors
5. pip install -r requirements.txt
6. cd authentification
7. python manage.py runserver
8. Then, open your web browser and go to http://127.0.0.1:8000/ to view the application.

## Usage

### Sensors directory

This directory contains the source code for configuring the ESP32 Dev Kit V1 board connected with the MPU-6050 and MAX4466 sensors. Within this directory, there is a main folder containing a list of drivers and the main program written using the Arduino IDE.

- **Bluetooth driver** (driver_bluetooth.hpp and driver_bluetooth.cpp)

This driver configures the microcontroller's Bluetooth interface using the Arduino BluetoothSerial library. It also includes the function for sending data via Bluetooth.

- **Accelerometer driver** (driver_accelerometer.hpp and driver_accelerometer.cpp)

This driver first initializes the MPU-6050 by configuring the connection via the I2C bus. It also sets up the operational parameters of the sensor, such as the sampling rate and the range for reading acceleration and gyroscope data. Additionally, it implementes a function to read data from the MPU-6050.

- **Mahony driver** (driver_mahony.hpp and driver_mahony.cpp)

This driver implements the Mahony algorithm, which calculates quaternions using gyroscope and accelerometer values from the MPU-6050.

- **Microphone driver** (driver_microphone.hpp and driver_microphone.cpp)

This driver implements the function to read MAX4466 values. 

- **Main program** (main.ino)

The main program begins by initializing the Bluetooth interface and the MPU-6050. Then, it loops through the following code: reading data from the microphone, reading data from the MPU6050, transforming this data into quaternions using the Mahony algorithm, and transmitting it via Bluetooth.

### Authentification directory

This directory contains the various folders responsible for the proper functioning of the web application. The tool used here is the Django framework.
This Django project is organized into multiple applications to facilitate code management and modularity. Below is a description of the different applications and their roles in the proper functioning of the web application.

#### Directory structure

authentification/
├── app/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── urls.py
├── data_visualisation/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── urls.py
├── real_time/
│   ├── migrations/
│   ├── scripts/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── urls.py
├── authentification/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static
│   ├── CSS/
│   ├── FONT/
│   ├── IMAGES/
│   ├── JS/
│   └── PROCESSING/
├── templates
│   ├── app/
│   ├── data_visualisation/
│   ├── real_time/
│   ├── emailconfirm.html/
│   └── base.html
├── manage.py


## Features



