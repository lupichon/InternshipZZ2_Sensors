from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpRequest
import real_time.scripts.main as w
import real_time.scripts.dataSensors as m
from django.contrib import messages
import threading
from .models import Data
import copy
import time
from django.db.models import Max
import asyncio
import websockets
import json

new_session = True
shot_id = 1
session_id = None
first_connexion = True

measure_thread = None
update_thread = None
stop_measure = False

def wbb(request):
    """
    View function for handling the real-time endpoint.

    This function manages the interaction with Wiiboard and sensor data. It checks the status
    of the Wiiboard and sensor connections, starts measurement and update threads if necessary,
    manages session IDs for data aggregation, and renders appropriate templates based on the
    connection status.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A response object based on whether the Wiiboard and sensors are connected.
            Renders 'real_time/main.html' if connected; otherwise, renders 'app/index.html' with
            an error message.

    Raises:
        None

    Note:
        - This function assumes the presence of global variables: session_id, new_session,
          first_connexion, stop_measure, measure_thread, and update_thread.
        - It requires the Wiiboard (`w.board`) and sensor reader (`m.reader`) to be connected
          for proper functionality.
        - The function starts measurement and update threads (`measure_thread` and `update_thread`)
          if they are not already running.
        - Manages session IDs (`session_id`) for data aggregation purposes.

    """

    global session_id, new_session, first_connexion, stop_measure, measure_thread, update_thread
    
    if w.board.status == "Connected" and m.reader.connected==True:  

        if not measure_thread or not measure_thread.is_alive():
            stop_measure = False
            measure_thread = threading.Thread(target=save_Measure, args=(request,))     
            measure_thread.start()
            update_thread = threading.Thread(target=update_Measure)     
            update_thread.start()
 
        if first_connexion : 
            session_id = Data.objects.filter(user=request.user).aggregate(Max('session_id'))['session_id__max']
            first_connexion = False

        if session_id is None :
            session_id = 0
        
        if new_session : 
            session_id = session_id + 1
            new_session = False

        return render(request,"real_time/main.html")
    
    else:
        messages.error(request, "The sensors and the wiiboard must be connected before start")
        return render(request,"app/index.html")

@csrf_exempt
def stop_measure_view(request):
    """
    View function for stopping measurement threads.

    This function stops the ongoing measurement and update threads by setting global flags
    (`stop_measure`) and joining the threads (`measure_thread` and `update_thread`).

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A plain text response indicating that the measurement has been stopped.

    Raises:
        None

    Note:
        - This function assumes the presence of global variables: stop_measure, measure_thread,
          and update_thread.
        - It stops the measurement thread (`measure_thread`) if it exists by joining it.
        - It stops the update thread (`update_thread`) if it exists by joining it.

    """

    global stop_measure, measure_thread, update_thread

    stop_measure = True

    if measure_thread is not None:
        measure_thread.join()
        measure_thread = None

    if update_thread is not None:
        update_thread.join()
        update_thread = None

    return HttpResponse("Mesure arrêtée")

@csrf_exempt
def start_measure_view(request):
    """
    View function for starting measurement threads.

    This function starts the measurement and update threads if they are not already running.
    It sets the global flag (`stop_measure`) to False to ensure the measurement continues.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A plain text response indicating that the measurement has been started.

    Raises:
        None

    Note:
        - This function assumes the presence of global variables: stop_measure, measure_thread,
          and update_thread.
        - It starts the measurement thread (`measure_thread`) if it is not already running.
        - It starts the update thread (`update_thread`) if it is not already running.
        - The global flag `stop_measure` is set to False to allow the measurement to continue.

    """

    global stop_measure, measure_thread, update_thread

    stop_measure = False

    if measure_thread is None:
        measure_thread = threading.Thread(target=save_Measure, args=(request,))     
        measure_thread.start()

    if update_thread is None:
        update_thread = threading.Thread(target=update_Measure)
        update_thread.start()

    return HttpResponse("Mesure arrêtée")
    
def connectWiiboard(request):
    """
    View function for connecting to Wiiboard.

    This function attempts to connect to the Wiiboard using a separate thread (`Wiiboard_thread`).
    It checks if the Wiiboard is already connected or if it needs to be connected.
    Displays appropriate messages based on the connection status.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A rendered HTML page with success or error messages based on the Wiiboard connection status.

    Raises:
        None

    Note:
        - This function assumes the presence of global variables or objects: w (Wiiboard instance).
        - It starts a new thread (`Wiiboard_thread`) to attempt Wiiboard connection.
        - Uses a while loop to wait until the Wiiboard is connected or found.
        - Displays success or error messages based on the connection status.

    """

    if(w.board.status == "Disconnected"):
        Wiiboard_thread = threading.Thread(target=w.main)
        Wiiboard_thread.daemon = True  
        Wiiboard_thread.start()

        while w.board.status!="Connected" and w.find == True:
            time.sleep(1)

        if w.board.status == "Disconnected":
            messages.error(request,"Wiiboard not connected, please try again")
        else : 
            messages.success(request, "Wiiboard connected")

        w.find = True
        return render(request,"app/index.html")
    
    else : 
        w.find = True
        messages.error(request,"The Wiiboard is already connected")
        return render(request,"app/index.html")

def connectSensors(request):
    """
    View function for connecting to sensors.

    This function attempts to connect to the microphone and accelerometer using a separate thread (`Sensors_thread`).
    It checks if the sensors are already connected or if they need to be connected.
    Displays appropriate messages based on the connection status.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A rendered HTML page with success or error messages based on the sensors connection status.

    Raises:
        None

    Note:
        - This function assumes the presence of global variables or objects: m (Sensors instance).
        - It starts a new thread (`Sensors_thread`) to attempt sensors connection.
        - Uses a while loop to wait until both microphone and accelerometer are connected or found.
        - Displays success or error messages based on the connection status.

    """
     
    if(m.reader.connected == False):
         
        m.finish = False
        Sensors_thread = threading.Thread(target=m.main)
        Sensors_thread.daemon = True  
        Sensors_thread.start()

        while m.reader.connected == False and m.find == True:
            time.sleep(1)

        if m.reader.connected == False:
            messages.error(request, "Microphone and accelerometer not connected, please try again")
        else : 
            messages.success(request, "Microphone and accelerometer connected")
    
        m.find = True
        return render(request,"app/index.html")
    
    else:
        m.find = True
        messages.error(request,"The sensors are already connected")
        return render(request,"app/index.html")

   
LEN_GC = 500
before_gc = True
measure_gc_after = []
measure_gc_before = [[0,0] for _ in range(LEN_GC)]
ind_gc = 0

LEN_QUA = 150
before_qua = True
measure_qua_after = []
measure_qua_before = [[0,0,0,0] for _ in range(LEN_QUA)]
ind_qua = 0

def get_point_position(X, Y):
    """
    Updates the position of a point and manages lists of positions before and after a gravity center.

    This function updates the position of a point (X, Y) and manages two lists (`measure_gc_before` and `measure_gc_after`)
    that store positions before and after a gravity center respectively. It uses a global index (`ind_gc`) to track the 
    current position index in `measure_gc_after`.

    Args:
        X (float): X-coordinate of the point.
        Y (float): Y-coordinate of the point.

    Returns:
        None

    Raises:
        None

    Note:
        - This function assumes the presence of global variables or objects: ind_gc, measure_gc_before, measure_gc_after, before_gc.
        - If `before_gc` is True, it updates `measure_gc_before`.
        - If `before_gc` is False, it updates `measure_gc_after` and manages the index `ind_gc`.

    """
    global ind_gc, measure_gc_after, measure_gc_before

    if before_gc : 
        measure_gc_before.pop(0)
        measure_gc_before.append([X, Y])
        ind_gc = 0
    
    else :
        if ind_gc < LEN_GC :
            measure_gc_after.append([X, Y])
            ind_gc = ind_gc + 1

def get_Quaternion(q0, q1, q2, q3):
    """
    Updates the quaternion values and manages lists of values before and after a quaternion measurement.

    This function updates the quaternion values (q0, q1, q2, q3) and manages two lists (`measure_qua_before` and `measure_qua_after`)
    that store quaternion values before and after a measurement respectively. It uses a global index (`ind_qua`) to track the 
    current index in `measure_qua_after`.

    Args:
        q0 (float): Quaternion value.
        q1 (float): Quaternion value.
        q2 (float): Quaternion value.
        q3 (float): Quaternion value.

    Returns:
        None

    Raises:
        None

    Note:
        - This function assumes the presence of global variables or objects: ind_qua, measure_qua_before, measure_qua_after, before_qua.
        - If `before_qua` is True, it updates `measure_qua_before`.
        - If `before_qua` is False, it updates `measure_qua_after` and manages the index `ind_qua`.

    """
    global ind_qua, measure_qua_after, measure_qua_before

    if before_qua : 
        measure_qua_before.pop(0)
        measure_qua_before.append([q0,q1,q2,q3])
        ind_qua = 0

    else:
        if ind_qua < LEN_QUA:
            measure_qua_after.append([q0,q1,q2,q3])
            ind_qua = ind_qua +1

clients = set()
class WebSocketServer:
    """
    Class to manage a WebSocket server for communicating with multiple clients concurrently.
    """

    def __init__(self):
        """
        Initializes the attributes of the WebSocketServer class.

        Attributes:
        - quat_ref (list): Reference for quaternions [q0, q1, q2, q3].
        - slidersValues (list): Values of sliders [sliderSensitivityStabilityValue, sliderSensitivityValue].
        - centerGravity_ref (list): Reference for center of gravity [Xcalibration, Ycalibration].
        """

        self.quat_ref = [0,0,0,0]
        self.slidersValues = [10,1]
        self.centerGravity_ref = [0,0]

    async def handler(self, websocket, path):
        """
        Handles WebSocket connection with a client.

        Args:
        - websocket (WebSocketServerProtocol): WebSocket object to communicate with the client.
        - path (str): WebSocket URL path.

        Actions:
        - Adds the client to the global set of connected clients.
        - Waits for messages from the client, updates quat_ref, slidersValues, and centerGravity_ref
          from received JSON data.
        - Handles connection closed exceptions.

        Raises:
        - websockets.exceptions.ConnectionClosed: If the connection is closed abruptly.
        """

        clients.add(websocket)
        try:
            async for message in websocket:
                latest_value = json.loads(message)  
                self.quat_ref = [latest_value.get('q0_ref'), latest_value.get('q1_ref'), latest_value.get('q2_ref'), latest_value.get('q3_ref')]
                self.slidersValues = [latest_value.get('sliderSensitivityStabilityValue'), latest_value.get('sliderSensitivityValue')]
                self.centerGravity_ref = [latest_value.get('Xcalibration'), latest_value.get('Ycalibration')]

        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed: {e}")
        finally:
            clients.remove(websocket)

    def start_server(self):
        """
        Starts the WebSocket server.

        Action:
        - Sets up and starts the WebSocket server on 'localhost:8765' using websockets.serve.
        - Uses asyncio.get_event_loop().run_until_complete to start the server and
          asyncio.get_event_loop().run_forever to keep it running indefinitely.
        """

        start_server = websockets.serve(self.handler, 'localhost', 8765)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    async def send_to_all_clients(self, data):
        """
        Sends data to all connected clients.

        Args:
        - data (dict): Dictionary containing data to be sent to clients.

        Action:
        - Converts the data to JSON format.
        - Asynchronously sends the message to each client in the clients set.
        """

        if clients:
            message = json.dumps(data)
            await asyncio.wait([client.send(message) for client in clients])

ws_server = WebSocketServer()

def run_websocket_server():
    """
    Runs the WebSocket server in a separate thread.
    """
    asyncio.set_event_loop(asyncio.new_event_loop())
    ws_server.start_server()

websocket_thread = threading.Thread(target=run_websocket_server)
websocket_thread.daemon = True
websocket_thread.start()

CoG = 0
def save_Measure(request):
    """
    Continuously collects sensor measurements and saves them to the database when triggered.

    Args:
    - request (HttpRequest): The HTTP request object from Django.

    Global Variables Used:
    - measure_gc_before (list): List to store gravity center measurements before a trigger event.
    - shot_id (int): ID for each shot measurement.
    - session_id (int): ID for each session of measurements.
    - before_gc (bool): Flag indicating if gravity center measurements are before a trigger event.
    - measure_gc_after (list): List to store gravity center measurements after a trigger event.
    - measure_qua_after (list): List to store quaternion measurements after a trigger event.
    - measure_qua_before (list): List to store quaternion measurements before a trigger event.
    - before_qua (bool): Flag indicating if quaternion measurements are before a trigger event.
    - CoG (int): Flag indicating the state of the center of gravity.
    - ws_server (WebSocketServer): Instance of WebSocketServer for managing WebSocket connections.

    Actions:
    - Continuously loops to collect gravity center and quaternion measurements.
    - Adjusts measurements based on reference values from WebSocketServer instance.
    - Triggers a measurement save when m.trigger is True:
        - Sets CoG to 1.
        - Increments shot_id and prepares data_gc and data_qua for saving.
        - Waits until sufficient data is collected in measure_gc_after and measure_qua_after.
        - Prepares final data_gc and data_qua for database storage.
        - Resets relevant flags and clears measure_gc_after and measure_qua_after.
        - Creates and saves a Data object with user, session_id, shot_id, gravity_center, quaternion, and sliders_value.
        - Prints a message indicating successful data saving.
    - Sleeps for 0.01 seconds between iterations to control loop frequency.

    Notes:
    - This function assumes a continuous sensor data acquisition loop with occasional triggers for data saving.
    - Requires properly initialized and running instances of sensors and WebSocketServer.
    """

    global measure_gc_before, shot_id, session_id, before_gc, measure_gc_after, measure_qua_after, measure_qua_before, before_qua, CoG

    while not stop_measure : 
        
        # Adjust measurements based on WebSocketServer reference values
        get_point_position(w.x - ws_server.centerGravity_ref[0], w.y - ws_server.centerGravity_ref[1])
        get_Quaternion(m.q0 - ws_server.quat_ref[0], m.q1 - ws_server.quat_ref[1], m.q2 - ws_server.quat_ref[2], m.q3 - ws_server.quat_ref[3])
        
        if m.trigger : 

            m.trigger = False
            CoG = 1
            shot_id = shot_id + 1

            # Copy measurements before trigger
            data_gc = copy.deepcopy(measure_gc_before)
            data_qua = copy.deepcopy(measure_qua_before)

            before_gc = False
            before_qua = False

            # Wait until enough measurements are collected after trigger
            while (len(measure_gc_after) < LEN_GC or len(measure_qua_after) < LEN_QUA) :
                get_point_position(w.x - ws_server.centerGravity_ref[0],w.y - ws_server.centerGravity_ref[1])
                get_Quaternion(m.q0 - ws_server.quat_ref[0], m.q1 -  ws_server.quat_ref[1], m.q2 -  ws_server.quat_ref[2], m.q3 -  ws_server.quat_ref[3])
                time.sleep(0.01)

            # Combine measurements after trigger
            data_gc = data_gc + measure_gc_after
            data_qua = data_qua + measure_qua_after

            before_gc = True
            before_qua = True

            # Clear after-trigger measurement lists
            measure_gc_after = []
            measure_qua_after = []

            measurement = Data.objects.create(user=request.user,session_id = session_id, shot_id = shot_id - 1, gravity_center = data_gc, quaternion = data_qua, sliders_value = ws_server.slidersValues)
            measurement.save()  
            print("data save")
        
        time.sleep(0.01)

def update_Measure():
    """
    Continuously updates and sends sensor measurements to all connected clients via WebSocket.

    Global Variables Used:
    - CoG (int): Flag indicating the state of the center of gravity.
    - stop_measure (bool): Flag to control the loop termination.
    - w.x (float): Current x-coordinate from the Wiiboard sensor.
    - w.y (float): Current y-coordinate from the Wiiboard sensor.
    - m.q0, m.q1, m.q2, m.q3 (float): Quaternion values from the sensor.
    - session_id (int): ID for each session of measurements.
    - shot_id (int): ID for each shot measurement.
    - ws_server (WebSocketServer): Instance of WebSocketServer for managing WebSocket connections.

    Actions:
    - Continuously loops to gather current sensor measurements.
    - Prepares a dictionary `data_to_send` containing current sensor data, including x, y, quaternions, CoG,
      sessionID, and shotID.
    - Resets CoG to 0 after preparing data for transmission.
    - Uses asyncio to send `data_to_send` to all connected clients via WebSocketServer's `send_to_all_clients` method.
    - Sleeps briefly before repeating the loop.

    Notes:
    - This function assumes a continuous sensor data update loop running in a separate thread.
    - Requires properly initialized and running instances of sensors and WebSocketServer.
    """

    global CoG
    while not stop_measure : 
        data_to_send = {
                'x': w.x,
                'y': w.y,
                'q0': m.q0,
                'q1': m.q1,
                'q2': m.q2,
                'q3': m.q3,
                'CoG' : CoG,
                'sessionID' : session_id,
                'shotID' : shot_id, 
            }
        CoG = 0
        asyncio.run(ws_server.send_to_all_clients(data_to_send))


