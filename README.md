# Developement of a sensor suite to aid atlete training for the ISSF 10 meter air rifle event

10-meter air rifle shooting is a demanding discipline requiring exceptional precision and perfect mastery of technique. To enhance athletes' performance in this discipline, it is crucial to understand in detail the movements of the athlete's body as well as those of their rifle, as they can affect shooting accuracy. Various sensors offer the possibility to collect precise data on these movements and identify errors that the athlete could correct to improve their performance.

The first part of my work involves designing, prototyping, and testing a range of sensors to provide coaches and athletes with valuable data to optimize training and improve performance over time. Among the important parameters to consider are the athlete's balance, posture, position, and stress. To measure the athlete's balance and more precisely their center of gravity, pressure sensors can be used. The athlete's posture and position can be measured by an inertial measurement unit, coupling both an accelerometer and a gyroscope. For stress, a heart rate sensor can be used.

The second part of my work focuses on creating a website where the athlete can create an account and log in. This website offers two main features. The first feature focuses on real-time data, allowing the athlete to access as much information as possible provided by the sensors during their training. Throughout their session, they can see the evolution of the previously mentioned parameters. The user interface also offers numerous buttons and sliders to allow the athlete to interact with it effectively and optimize their training session. The second feature is post-session data visualization. This means that in the following days, the user can review and analyze a multitude of information over a given period around the time of their shot.

## Table des Matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Contribuer](#contribuer)
- [Licence](#licence)
- [Auteurs](#auteurs)
- [Remerciements](#remerciements)

## Installation

Follow these steps to install and configure the project on your local machine.

### Prerequisites

Before installing the project, make sure you have the following installed : 

- [Python](https://www.python.org/) (version 3.9)
- [Arduino IDE](https://www.arduino.cc/en/software) (version 2.3 or highter, optional; only if you need to program electronic boards)

### Instructions

virtualenv -p python3.9 venv 
source ./venv/bin/activate  # On Windows, use `.\venv\Scripts\activate`
git clone https://github.com/lupichon/InternshipZZ2_Sensors.git
cd InternshipZZ2_Sensors
pip install -r requirements.txt
cd authentification
python manage.py runserver

Then, open your web browser and go to http://127.0.0.1:8000/ to view the application.
