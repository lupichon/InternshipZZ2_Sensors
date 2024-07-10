import bluetooth
import time
import struct

find = True
finish = False
trigger = False

data_microphone = 0
q0 = 0
q1 = 0
q2 = 0
q3 = 0
CoG = 0

class BluetoothReader:
    """
    Class for handling Bluetooth connection and data reading.

    Attributes:
    BLUETOOTH_NAME (str): The name of the Bluetooth device to connect to.
    socket (bluetooth.BluetoothSocket or None): The Bluetooth socket object for communication.
    connected (bool): Indicates if the device is currently connected.

    Methods:
    connect(): Tries to connect to the Bluetooth device with the specified name.
    read(): Reads data continuously from the Bluetooth device when connected.
    getData(data): Processes the raw data received from Bluetooth and updates global variables.
    disconnect(): Closes the Bluetooth connection.
    """

    def __init__(self, bluetooth_name):
        self.BLUETOOTH_NAME = bluetooth_name
        self.socket = None
        self.connected = False

    def connect(self):
        """
        Connects to the Bluetooth device with the specified name.

        Raises:
        Exception: If an error occurs while connecting to the Bluetooth device.
        """
         
        global find
        try:
            devices = bluetooth.discover_devices(duration=3,lookup_names=True)
            for addr, name in devices:
                if name == self.BLUETOOTH_NAME:
                    self.socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
                    self.socket.connect((addr, 1))
                    self.socket.settimeout(2)
                    self.connected = True
                    break
            find = False
        except Exception as e:
            find = False
            print("Error connecting to Bluetooth device:", e)

    def read(self):
        """
        Reads data continuously from the Bluetooth device.

        This method continuously reads data from the Bluetooth socket 
        and updates global variables based on the received data.

        Raises:
        Exception: If an error occurs while reading from the Bluetooth device.
        """

        global target, trigger, CoG, data_microphone, finish, q0, q1, q2, q3
        time_before = 0
        i = 0
        try:
            while self.connected and not finish:
                
                data = self.socket.recv(20)

                try : 
                    self.getData(data)

                    if(data_microphone > 1000 and time.time() - time_before > 10):
                        trigger = True
                        CoG = 1
                        time_before = time.time()
                        
                except Exception as e : 
                    print(e)

        except Exception as e:
            print("Error reading from Bluetooth device:", e)
            self.connected = False
        
    def getData(self, data):
        """
        Processes the raw data received from Bluetooth.

        Args:
        data (bytes): Raw data received from Bluetooth.

        Updates:
        global variables data_microphone, q0, q1, q2, q3 based on the processed data.
        """

        global data_microphone, q0, q1, q2, q3

        data_microphone = data[0] + 16**2*data[1]

        q0 = struct.unpack('f', data[4:8])[0]
        q1 = struct.unpack('f', data[8:12])[0]
        q2 = struct.unpack('f', data[12:16])[0]
        q3 = struct.unpack('f', data[16:20])[0]


    def disconnect(self):
        """
        Closes the Bluetooth connection.
        """

        if self.socket:
            self.socket.close()
            self.socket = None
            self.connected = False
            print("Disconnected from Bluetooth device")

bluetooth_name = "ESP32"
reader = BluetoothReader(bluetooth_name)


def main():
    """
    Main function to connect to and read data from a Bluetooth device.

    Connects to the Bluetooth device using reader.connect().
    If connected (reader.connected is True), starts reading data (reader.read()).
    After reading, disconnects from the Bluetooth device (reader.disconnect()).
    """
    
    reader.connect()
    if reader.connected:
        reader.read()
        reader.disconnect()
