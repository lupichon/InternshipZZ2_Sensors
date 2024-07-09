import sys
import bluetooth
import threading
import time
import pygame
import socket 

base = pygame.USEREVENT
WIIBOARD_BUTTON_PRESS = base + 1
WIIBOARD_BUTTON_RELEASE = base + 2
WIIBOARD_MASS = base + 3
WIIBOARD_CONNECTED = base + 4
WIIBOARD_DISCONNECTED = base + 5

COMMAND_LIGHT = 11
COMMAND_REPORTING = 12
COMMAND_REQUEST_STATUS = 15
COMMAND_REGISTER = 16
COMMAND_READ_REGISTER = 17

BUTTON_DOWN_MASK = 8

BLUETOOTH_NAME = "Nintendo RVL-WBC-01"

class BoardEvent:
	"""
    Represents an event from the Wiiboard including weight distribution and button press.

    Attributes:
    topLeft (float): Weight on the top-left sensor.
    topRight (float): Weight on the top-right sensor.
    bottomLeft (float): Weight on the bottom-left sensor.
    bottomRight (float): Weight on the bottom-right sensor.
    buttonPressed (bool): Indicates if the button is currently pressed.
    buttonReleased (bool): Indicates if the button was just released.
    totalWeight (float): Total weight calculated from all sensors.
    CoMx (float): Center of mass along the x-axis.
    CoMy (float): Center of mass along the y-axis.
    """
	
	def __init__(self, topLeft,topRight,bottomLeft,bottomRight, buttonPressed, buttonReleased):
		self.topLeft = topLeft
		self.topRight = topRight
		self.bottomLeft = bottomLeft
		self.bottomRight = bottomRight
		self.buttonPressed = buttonPressed
		self.buttonReleased = buttonReleased
		self.totalWeight = topLeft + topRight + bottomLeft + bottomRight
		try : 
			self.CoMx = ((topRight + bottomRight) - (topLeft + bottomLeft))/(topRight + bottomRight + topLeft + bottomLeft)
			self.CoMy = ((topRight + topLeft) - (bottomRight + bottomLeft))/(topRight + bottomRight + topLeft + bottomLeft)
		except : 
			self.CoMx = 0
			self.CoMy = 0

class Wiiboard:
	"""
    Represents a Wiiboard and handles communication with it over Bluetooth.

    Attributes:
    receivesocket (bluetooth.BluetoothSocket or None): Socket for receiving data from Wiiboard.
    controlsocket (bluetooth.BluetoothSocket or None): Socket for sending commands to Wiiboard.
    calibration (list): Calibration data for sensors.
    LED (bool): State of the LED on the Wiiboard.
    address (str or None): Bluetooth address of the connected Wiiboard.
    buttonDown (bool): Indicates if the button is currently pressed.
    status (str): Current connection status ("Connected" or "Disconnected").
    lastEvent (BoardEvent): Last event received from the Wiiboard.

    Methods:
    isConnected(): Checks if the Wiiboard is currently connected.
    connect(address): Connects to the Wiiboard at the specified Bluetooth address.
    disconnect(): Disconnects from the currently connected Wiiboard.
    discover(): Attempts to discover a Wiiboard nearby.
    wait(millis): Pauses execution for the specified milliseconds.
    setLight(light): Turns the LED on or off on the Wiiboard.
    send(data): Sends data/command to the Wiiboard.
    calibrate(): Performs sensor calibration on the Wiiboard.
    receivethread(): Continuously receives data from the Wiiboard and posts events.
    createBoardEvent(bytes): Creates a BoardEvent object from received bytes.
    calcMass(raw, pos): Calculates mass from raw sensor data using calibration data.
    """

	receivesocket = None
	controlsocket = None

	def __init__(self):
		self.calibration = []
		self.LED = False
		self.address = None
		self.buttonDown = False

		self.status = "Disconnected"
		self.lastEvent = BoardEvent(0,0,0,0,False,False)

	def isConnected(self):
		"""
        Checks if the Wiiboard is currently connected.

        Returns:
        bool: True if connected, False otherwise.
        """

		if self.status == "Connected":
			return True
		else:
			return False

	def connect(self, address):
		"""
        Connects to the Wiiboard at the specified Bluetooth address.

        Args:
        address (str): Bluetooth address of the Wiiboard.

        Raises:
        Exception: If an error occurs during connection.
        """

		global find
		if address is None:
			print("Non existant address")
			return
		try:
			self.receivesocket = bluetooth.BluetoothSocket(bluetooth.L2CAP)
			self.controlsocket = bluetooth.BluetoothSocket(bluetooth.L2CAP)
		except ValueError:
			raise Exception("Error: Bluetooth not found")
		
		self.receivesocket.connect((address, 0x13))
		self.receivesocket.settimeout(2)
		self.controlsocket.connect((address, 0x11))
		if self.receivesocket and self.controlsocket:
			print("Connected to Wiiboard at address " + address)
			self.status = "Connected"
			self.address = address
			thread = threading.Thread(target=self.receivethread, args=())
			thread.start()
			useExt = ["00", COMMAND_REGISTER, "04", "A4", "00", "40", "00"]
			self.send(useExt)
			
			pygame.event.post(pygame.event.Event(WIIBOARD_CONNECTED))
		else:
			print("Could not connect to Wiiboard at address " + address)

	def disconnect(self):
		"""
        Disconnects from the currently connected Wiiboard.
        """

		try:
			self.status = "Disconnected"
			self.receivesocket.close()
			self.controlsocket.close()
			self.receivesocket = None
			self.controlsocket = None
		except:
			pass
		print("WiiBoard disconnected")


	def discover(self):
		"""
        Attempts to discover a Wiiboard nearby.

        Returns:
        str or None: Bluetooth address of the discovered Wiiboard, or None if not found.
        """

		print ("Press the red sync button on the board now")
		address = None
		bluetoothdevices = bluetooth.discover_devices(duration = 3, lookup_names = True)
		for bluetoothdevice in bluetoothdevices:
			if bluetoothdevice[1] == BLUETOOTH_NAME:
				address = bluetoothdevice[0]
				print ("Found Wiiboard at address " + address)
		if address == None:
			print ("No Wiiboards discovered.")
		return address
	
	
	def wait(self,millis):
		"""
        Pauses execution for the specified milliseconds.

        Args:
        millis (int): Number of milliseconds to wait.
        """

		time.sleep(millis / 1000.0)
		
	def setLight(self, light):
		"""
        Controls the LED on the Wiiboard.

        Args:
        light (bool): True to turn on the LED, False to turn it off.
        """

		val = "00"
		if light == True:
			val = "10"

		message = ["00", COMMAND_LIGHT, val]
		self.send(message)
		self.LED = light
		
	def send(self,data):
		"""
        Sends data/command to the Wiiboard.

        Args:
        data (list): List of bytes representing the command to send.
        """

		if self.status != "Connected" :
			return
		data[0] = "52"
		senddata = b""
		for byte in data:
			byte = str(byte)
			senddata += bytes.fromhex(byte)
			a = self.controlsocket.send(senddata)
	
	def calibrate(self):
		"""
        Performs sensor calibration on the Wiiboard.
        """

		message = ["00", COMMAND_READ_REGISTER ,"04", "A4", "00", "24", "00", "18"]
		done = False
		while not done : 
			self.send(message)
			data = self.receivesocket.recv(25)
			if(data[1] == 33):
				data2 = self.receivesocket.recv(25)
				data = data[7:24]
				data2 = data2[7:15]
				data = data + data2
				i = 0
				for k in range(0,len(data),2):
					self.calibration.append((data[k] << 8) + data[k+1])
					i+=1
				done = True
			

	def receivethread(self):
		"""
        Continuously receives data from the Wiiboard and posts events.
        """

		self.calibrate()
		while self.status == "Connected":
			try : 
				message = ["00", COMMAND_READ_REGISTER, "04", "A4", "00", "00", "00", "08"]
				self.send(message)
				time.sleep(0.05)
				data = self.receivesocket.recv(25)
				if(data[1]==33):
					self.lastEvent = self.createBoardEvent(data[2:15])
					pygame.event.post(pygame.event.Event(WIIBOARD_MASS, mass=self.lastEvent))
			except : 
				pygame.event.post(pygame.event.Event(WIIBOARD_DISCONNECTED))
		
	def createBoardEvent(self, bytes):
		"""
        Creates a BoardEvent object from received bytes.

        Args:
        bytes (bytes): Bytes received from the Wiiboard.

        Returns:
        BoardEvent: BoardEvent object representing the event.
        """

		buttonBytes = bytes[0:2]
		bytes = bytes[5:13]
		buttonPressed = False
		buttonReleased = False
		state = (buttonBytes[0] << 8) | buttonBytes[1]

		if state == BUTTON_DOWN_MASK:
			buttonPressed = True
			if not self.buttonDown:
				pygame.event.post(pygame.event.Event(WIIBOARD_BUTTON_PRESS))
				self.buttonDown = True

		if buttonPressed == False:
			if self.lastEvent.buttonPressed == True:
				buttonReleased = True
				self.buttonDown = False
				pygame.event.post(pygame.event.Event(WIIBOARD_BUTTON_RELEASE))

		rawTR = (bytes[0] << 8) + bytes[1]
		rawBR = (bytes[2] << 8) + bytes[3]
		rawTL = (bytes[4] << 8) + bytes[5]
		rawBL = (bytes[6] << 8) + bytes[7]

		topRight = self.calcMass(rawTR,0)
		bottomRight = self.calcMass(rawBR,1)
		topLeft = self.calcMass(rawTL,2)
		bottomLeft = self.calcMass(rawBL,3)

		boardEvent = BoardEvent(topLeft,topRight,bottomLeft,bottomRight,buttonPressed,buttonReleased)
		return boardEvent

	def calcMass(self, raw, pos):
		"""
        Calculates mass from raw sensor data using calibration data.

        Args:
        raw (int): Raw sensor data value.
        pos (int): Position index for calibration data.

        Returns:
        float: Calculated mass.
        """
		
		val = 0.0
		
		if raw < self.calibration[pos]:
			return val
		elif raw < self.calibration[pos+4]:
			val = 17 * ((raw - self.calibration[pos]) / float((self.calibration[pos+4] - self.calibration[pos])))
		elif raw > self.calibration[pos+4]:
			val = 17 + 17 * ((raw - self.calibration[pos+4]) / float((self.calibration[pos+8] - self.calibration[pos+4])))

		return val

