/**
 * @fileoverview Script for WebSocket communication and data handling.
 * @author Lucas Pichon 
 */

// Global variables
var q0=1, q1=0, q2=0, q3=0; //Quaternion components 
var X = 0, Y = 0, CoG = 0, shotID = -1, sessionID;  // Variables for data storage

// WebSocket connection setup
const socket = new WebSocket('ws://localhost:8765');

/**
 * Function called when WebSocket connection is successfully established.
 * Sends data periodically to the server.
 * @param {Event} event - The event object for WebSocket connection open.
 */
socket.onopen = function(event) 
{
    console.log('WebSocket is connected.');

    // Send data at regular intervals
    setInterval(() => 
    {
        const dataToSend = {
            q0_ref: q0_ref, // Reference quaternion component 0
            q1_ref: q1_ref, // Reference quaternion component 1
            q2_ref: q2_ref, // Reference quaternion component 2
            q3_ref: q3_ref, // Reference quaternion component 3
            sliderSensitivityStabilityValue: sliderSensitivityStability.value(), // Slider valueu for sensitivity stability 
            sliderSensitivityValue: sliderSensitivity.value(), // Slider value for sensitivity orientation 
            Xcalibration: Xcalibration, // Calibration value for X-axis
            Ycalibration: Ycalibration, // Calibration value for Y-axis
        }; 
        const jsonData = JSON.stringify(dataToSend);
        if (socket.readyState === WebSocket.OPEN) 
        {
            socket.send(jsonData);
        }
    }, 1000); // Interval: 1 second
}

/**
 * Function called when a message is received from the WebSocket server.
 * Updates variables with received data.
 * @param {MessageEvent} event - The event object containing received data.
 */
socket.onmessage = function(event) 
{
    const receivedData = JSON.parse(event.data);
    X = receivedData.x; // Update X coordinate 
    Y = receivedData.y; // Update Y coordinate 
    if(receivedData.CoG == 1)
    {
        CoG = 1 // Update center of gravity flag
    }
    q0 = receivedData.q0;   // Update quaternion component 0
    q1 = receivedData.q1;   // Update quaternion component 1
    q2 = receivedData.q2;   // update quaternion component 2
    q3 = receivedData.q3;   // Update quarernion component 3
    sessionID = receivedData.sessionID; // Update session ID
    shotID = receivedData.shotID; // Update shot ID
};

/**
 * Function called when a WebSocket error occurs.
 * Logs the error to the console.
 * @param {ErrorEvent} error - The error event containing WebSocket error information.
 */
socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};

/**
 * Function called when the WebSocket connection is closed.
 * Logs the event to the console.
 * @param {CloseEvent} event - The close event containing WebSocket close information.
 */
socket.onclose = function(event) {
    console.log('WebSocket is closed.', event);
};