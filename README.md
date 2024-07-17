# Developement of a sensor suite to aid atlete training for the ISSF 10 meter air rifle event

10-meter air rifle shooting is a demanding discipline requiring exceptional precision and perfect mastery of technique. To enhance athletes' performance in this discipline, it is crucial to understand in detail the movements of the athlete's body as well as those of their rifle, as they can affect shooting accuracy. Various sensors offer the possibility to collect precise data on these movements and identify errors that the athlete could correct to improve their performance.

The first part of my work involves designing, prototyping, and testing a range of sensors to provide coaches and athletes with valuable data to optimize training and improve performance over time. Among the important parameters to consider are the athlete's balance, posture, position, and stress. To measure the athlete's balance and more precisely their center of gravity, pressure sensors can be used. The athlete's posture and position can be measured by an inertial measurement unit, coupling both an accelerometer and a gyroscope. 

The second part of my work focuses on creating a website where the athlete can create an account and log in. This website offers two main features. The first feature focuses on real-time data, allowing the athlete to access as much information as possible provided by the sensors during their training. Throughout their session, they can see the evolution of the previously mentioned parameters. The second feature is post-session data visualisation. This means that in the following days, the user can review and analyze a multitude of information over a given period around the time of their shot.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)

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
This Django project is organized into multiple applications. Below is a description of the different applications and their roles in the proper functioning of the web application.

#### Directory structure

authentification/<br>
├── app/<br>
│   ├── migrations/<br>
│   ├── '__init__'.py<br>
│   ├── admin.py<br>
│   ├── apps.py<br>
│   ├── models.py<br>
│   ├── tests.py<br>
│   ├── views.py<br>
│   └── urls.py<br>
├── data_visualisation/<br>
│   ├── migrations/<br>
│   ├── '__init__'.py<br>
│   ├── admin.py<br>
│   ├── apps.py<br>
│   ├── models.py<br>
│   ├── tests.py<br>
│   ├── views.py<br>
│   └── urls.py<br>
├── real_time/<br>
│   ├── migrations/<br>
│   ├── scripts/<br>
│   ├── '__init__'.py<br>
│   ├── admin.py<br>
│   ├── apps.py<br>
│   ├── models.py<br>
│   ├── tests.py<br>
│   ├── views.py<br>
│   └── urls.py<br>
├── authentification/<br>
│   ├── '__init__'.py<br>
│   ├── settings.py<br>
│   ├── urls.py<br>
│   └── wsgi.py<br>
├── static<br>
│   ├── CSS/<br>
│   ├── FONT/<br>
│   ├── IMAGES/<br>
│   ├── JS/<br>
│   └── PROCESSING/<br>
├── templates<br>
│   ├── app/<br>
│   ├── data_visualisation/<br>
│   ├── real_time/<br>
│   ├── emailconfirm.html/<br>
│   └── base.html<br>
└── manage.py<br>

#### Applications 

- **app**

This application is designed to manage user authentication and registration processes efficiently. It includes features such as user registration with validation checks for username and email uniqueness, password confirmation, and sending confirmation emails for account activation. Users can securely log in using their credentials and are greeted with personalized messages upon successful authentication. The application also supports user logout functionality, ensuring secure session management. Email confirmation links are utilized to activate user accounts securely. Overall, this application provides a robust and user-friendly interface for managing user accounts and ensuring smooth authentication and registration experiences.

- **data_visualisation**

This application facilitates post-training visualisation and analysis of sensor data related to shooting sessions. It includes features to display the main page for data visualisation, retrieve and render specific session data for detailed analysis, and visualise various parameters such as gravity center coordinates, quaternion data for orientation and stability. Users can interactively view and analyze their shooting session data through dynamic visualisations, enhancing their understanding and performance evaluation. 

- **real_time**

This application triggers threads upon button presses to initiate Bluetooth connection between the computer and sensors, followed by data collection. The threads execute functions located in the scripts directory of the application.

**Wiiboard thread** : The thread executes the main function from the *main.py* file. This file continuously updates the coordinates of the center of gravity measured by the Wiiboard based on data collected by the *wiiboard.py* file, which handles the collection of pressure sensor data.

**Sensors thread** : The second thread executes the main function of the *dataSensor.py*. This function retrieves data sent by the ESP32 microcontroller. The data is in bytes and represents the values measured by the microphone and the quaternions measured by the MPU-6050 sensor.<br>
<br>

The application also triggers another thread that facilitates saving data within an interval centered around the moment of shooting.

#### static

The static directory is used to store static files such as CSS, JavaScript, images, and other assets that are used to style and enhance the functionality of the web pages rendered by the application. I will briefly explain the functionalities of each JS file.

*sendParameters.js* : Sends to the server at regular intervals the data for various parameters on which the user can interact(calibration, movement amplification...).

- **Wiiboard**

*wiiboard.js* : Manages the interface for visualising the center of gravity in real-time.
*visualisationPoint.js* : Retrieves center of gravity data from the selected shot and session using AJAX request.
*visualisationWiiboard.js* : Manages the post-training interface for visualising the center of gravity of the shot selected.
*visualisationWiiboardSession.js* : Manages the post-training interface for visualising all the center of gravity during the training session of the shot selected.

- **MPU-6050**

*rifle.js* : Manages the real-time interface for visualising the orientation (3D interface).
*orientation.js* : Manages the real-time interface for visualising the orientation (2D interface).
*stability.js* : Manages the real-time interface for visualising the stability.
*visualisationRifle.js* : Retrieves MPU-6050 data from the selected shot and session using the AJAX request.
*visualisationRifleGraph.js* : Manages the post-training interface for the orientation (3D interface).
*visualisationOrientation.js* : Manages the post-training interface for the orientation (2D interface).
*visualisationStability.js* : Manages the post-training interface for the satability. 

#### templates

The templates directory in a Django project is used to store HTML template files that define the structure and layout of the web pages rendered by the application.

#### manage.py

The manage.py file is a command-line utility that allows you to interact with this Django project in various ways. For example, you can use it to start a development server, synchronize the database, create migrations, and much more.

## Features

This paragraph describes the functionalities of the application.

### Authentification system ###

The application features an authentication system where users can create an account by entering the following fields after clicking on the *Register* button: first name, last name, username, Gmail address, and password. Once the fields are entered, the user will receive a link via email that they must click to activate their account. After activation, they can log in by clicking the *Login* button, which redirects them to a page where they can choose between real-time data visualisation or post-training data visualisation.

### Real-time visualisation ###

This page is accessible after connecting the different sensors using the *Connect Sensors* and *Connect Wiiboard* buttons. To connect the sensors (microphone and MPU-6050), simply power the ESP32 board and click the *Connect Sensors* button. To connect the Wiiboard, press the *Connect Wiiboard* button and quickly press the red synchronization button located in the battery compartment. Validation or error messages will appear based on the success of the operation. Afterward, the real-time visualisation page becomes accessible via the *Start* button. On this page, you will find various interfaces corresponding to the different sensor modules. 

#### Wiiboard interface #### 

This interface allows you to visualize the center of gravity of the person located on the balance.

- *Blue rectangle* : It represents the balance, where the center of gravity will be positioned.
- *Red dot* : It represents the center of gravity. 
- *Blue tail* : Previous center of gravity over a few seconds (enhances the visualisation of the moovement).
- *Green numbered points* : These points do not initially appear in the visualization. Each time the microphone detects a shot, the coordinates of the center of gravity at that moment are represented by a green point, which also includes the shot number.
- *Clear points button* : Allows to remove the green points in case they clutter the visualisation.
- *Calibrate button* : Allows to reset the center of gravity to ce the center of the interface, in the position (0, 0).
- *Slider* : Determines the number of square in the grid. 

#### MPU-6050 interface#### 

##### Orientation (3D) #####

This is the first interface that allows you to visualise the orientation of the MPU-6050. This interface is in 3D. The advantage of the interface it's that the MPU-6050 can be positioned on the rifle but also on any part of the body. 

- *Absolute coordinate system* : First coordinate system, fixed as the reference frame. 
- *Relative coordinate system* : Second coordinate system, relative to the MPU-6050, meaning it undergoes the same rotations as the sensor.
- *Checkboxes* : The first three checkboxes allow independently showing or hiding the axes of the coordinate systems. The fourth checkbox allows displaying or hiding the 3D model of a rifle in case the MPU-6050 is positioned on rifle.
- *Reset rotations button* : In the interface, you can rotate around the axis or zoom using the mouse and scroll wheel. This button simply allows you to reposition the camera to its initial position.
- *Calibrate button* : It calibrates the relative coordinate system. The goal is to allow the athlete to find an ideal position (of the rifle or body part in question) during their shot. Once this position is found, the calibration button resets the moving coordinate system to zero (aligning both coordinate systems). From then on, the athlete aims to perfectly align the two coordinate systems during subsequent shots. If achieved, the rifle or body part where the sensor is located is in the desired position.
* *Slider* : Moving the slider to the right increases the amplification of rotations applied to the model, requiring the athlete to be more precise in their movements.

##### Orientation (2D) #####

This is the second interface for the visualisation of the orientation, in 2D this time. The calibration button and the slider that we mentioned previously also interact with this interface.

- *Absolute indicators* : Three indicators are fixed. 
- *Relative indicators* : The other indicators are relative to the MPU-6050 and represent the angles of rotations around the three axis(Yaw, Pitch and Roll). 

##### Stability #####

This is the last interface for the MPU-6050. It manages stability. The interface is a chart with an orange curve that represents stability over time. The more significant the movements of the MPU-6050, the higher the value of the curve. Here also there is a slider to amplify the small moovement. 

### Post-training visualisation ###










