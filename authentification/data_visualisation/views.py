from django.shortcuts import render
from real_time.models import Data
import json
from django.contrib import messages
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.db.models import Max
from real_time.models import Data

def data_visualisation(request):
    """
    Display the data visualization main page.

    This function retrieves the maximum session ID associated with the 
    logged-in user from the Data model and renders the main page for 
    data visualization.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response rendering the data visualization main 
                  page with the context containing the last session ID.
    """

    lastID = Data.objects.filter(user=request.user).aggregate(Max('session_id'))['session_id__max']
    return render(request,"data_visualisation/main_page.html",{'lastID': lastID})

data = None
gravity_center = []

qua = []
sliders_value = []

globalData = []

shotID = 0
SessionID = 0


def get_visualisation(request):
    """
    Handle the data visualization request.

    This function processes a POST request to retrieve visualization data
    based on the provided session ID and shot ID. It fetches the corresponding
    data from the Data model and prepares it for rendering the visualization page.
    If the session ID and shot ID do not match, it displays an error message.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    HttpResponse: The HTTP response rendering the visualization page if the data
                  is successfully retrieved or redirecting back to the main page
                  with an error message if the session ID and shot ID do not match.
    """

    global data, gravity_center, qua, shotID, sessionID, globalData, sliders_value

    if request.method == "POST" : 
        shotID = request.POST['shotID']
        sessionID = request.POST['sessionID']

    try : 

        globalData = []
        gdata = Data.objects.filter(user=request.user, session_id= sessionID)
        for elem in gdata : 
            globalData.append(elem.gravity_center)

        data = Data.objects.get(user=request.user, session_id=sessionID, shot_id=shotID)
        gravity_center = data.gravity_center

        qua = data.quaternion

        sliders_value = data.sliders_value

        return render(request,"data_visualisation/visu.html")

    except Exception as e:
        print(e)
        messages.error(request,"The session ID and the shot ID do not match")

    return render(request,"data_visualisation/main_page.html")


def visu_gravityCenter(request):
    """
    Handle the request for visualizing the gravity center data.

    This function processes the gravity center data and prepares it for 
    visualization by extracting the X and Y coordinates of the gravity centers 
    and the midpoints of the global data. It then returns this data as a JSON response.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    JsonResponse: A JSON response containing the following data:
                  - X_tab: List of X coordinates of the gravity centers.
                  - Y_tab: List of Y coordinates of the gravity centers.
                  - X_total_points: List of X coordinates of the midpoints of the global data.
                  - Y_total_points: List of Y coordinates of the midpoints of the global data.
                  - sessionID: The current session ID.
                  - shotID: The current shot ID.
    """

    X_tab = []
    Y_tab = []
    X_total_points = []
    Y_total_points = []

    for elem in gravity_center : 
        X_tab.append(elem[0])
        Y_tab.append(elem[1])

    LEN_globalData_DIV2 =len(globalData[0])//2 - 1

    for elem in globalData : 
        X_total_points.append(elem[LEN_globalData_DIV2][0])
        Y_total_points.append(elem[LEN_globalData_DIV2][1])

    
    return JsonResponse({'X_tab': X_tab, 'Y_tab': Y_tab, 'X_total_points': X_total_points, 'Y_total_points': Y_total_points, 'sessionID': sessionID, 'shotID': shotID})
        

def visu_rifle(request):
    """
    Handle the request for visualizing rifle data.

    This function processes the quaternion data (representing orientation) 
    and slider values related to sensitivity. It extracts the quaternion 
    components (q0, q1, q2, q3) and the slider values, and returns them as a 
    JSON response.

    Parameters:
    request (HttpRequest): The HTTP request received by the server.

    Returns:
    JsonResponse: A JSON response containing the following data:
                  - q0: List of q0 components from the quaternion data.
                  - q1: List of q1 components from the quaternion data.
                  - q2: List of q2 components from the quaternion data.
                  - q3: List of q3 components from the quaternion data.
                  - sliderSensitivityStabilityValue: Value of the first slider related to sensitivity.
                  - sliderSensitivityValue: Value of the second slider related to sensitivity.
    """
    
    q0 = []
    q1 = []
    q2 = []
    q3 = []

    for elem in qua : 

        q0.append(elem[0])
        q1.append(elem[1])
        q2.append(elem[2])
        q3.append(elem[3])

    return JsonResponse({'q0':q0, 'q1': q1, 'q2': q2, 'q3': q3, 'sliderSensitivityStabilityValue': sliders_value[0], 'sliderSensitivityValue': sliders_value[1]})
       
def addTail(request):
    """
    Handle the request to add tail coordinates.

    This function retrieves coordinates from the globalData based on the index 
    provided in the request GET parameters. It extracts X and Y coordinates 
    from the specified index of globalData and returns them as a JSON response.

    Parameters:
    request (HttpRequest): The HTTP request received by the server. It should 
                           contain a 'ind' parameter in the GET request to specify 
                           the index of globalData to retrieve coordinates from.

    Returns:
    JsonResponse: A JSON response containing the following data:
                  - X_tail: List of X coordinates from the specified index of globalData.
                  - Y_tail: List of Y coordinates from the specified index of globalData.
    """
    
    X_tail = []
    Y_tail = []
    ind = int(request.GET.get('ind'))

    for coordinates in globalData[ind]:
        X_tail.append(coordinates[0])
        Y_tail.append(coordinates[1])

    return JsonResponse({'X_tail' : X_tail, 'Y_tail': Y_tail})