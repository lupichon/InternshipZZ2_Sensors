/**
 * @fileoverview Script for real-time orientation visualization interface (indicators).
 * @author Lucas Pichon
 */

let q0_ref = 0, q1_ref = 0, q2_ref = 0, q3_ref = 0;
let sliderSensitivityStability;
let x_refIndRoll = 0, x_refIndYaw = 0, x_refIndPitch = 0;

/**
 * P5 sketch definition for orientation visualization.
 */
var orientationSketch = function(p) 
{
    // Variables for canvas dimensions and positions
    let widthCanvas;
    let heightCanvas;
    let xCanvas;
    let yCanvas;

    // Variables for coordinate lines and indicators
    var x1_lineYaw, x2_lineYaw, y1_lineYaw, y2_lineYaw;
    var x_indicatorYaw, y1_indicatorYaw, y2_indicatorYaw; 

    var x1_linePitch, x2_linePitch, y1_linePitch, y2_linePitch;
    var x_indicatorPitch, y1_indicatorPitch, y2_indicatorPitch; 

    var x1_lineRoll, x2_lineRoll, y1_lineRoll, y2_lineRoll;
    var x_indicatorRoll, y1_indicatorRoll, y2_indicatorRoll;

    // Variables for yaw, roll, and pitch angles
    var yaw, roll, pitch;

    // Calibration button
    let calibrationButton;

    var y = 0, pi = 0, r = 0;


    function waitForScript1() 
    {
        if (window.script1Ready) 
        {
            
        } else 
        {
            setTimeout(waitForScript1, 50); 
        }
    }

    // Setup function for P5 sketch
    p.setup = function() 
    {
        waitForScript1();
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = window.innerHeight*0.25;
        xCanvas = window.innerWidth*0.75;
        yCanvas = 100;

        // Create P5 canvas and position
        canvasOrientation = p.createCanvas(widthCanvas, heightCanvas,p.WEBGL);
        canvasOrientation.parent('container');
        canvasOrientation.position(xCanvas, yCanvas);

        // Initialize coordinate lines
        CoordLines();

        // Initialize calibration button
        initCalibrationButton();

        // Initialize sensitivity stability slider
        initSensitivityStabilitySlider();
    }

    // Initialize calibration button
    function initCalibrationButton() 
    {
        calibrationButton = p.createButton('Calibrate');
        calibrationButton.mousePressed(calibrate);
        calibrationButton.class('oval-button');
        calibrationButton.parent('container');
        calibrationButton.position(xCanvas  - 0.31 * widthCanvas,yCanvas + 0.22 * heightCanvas);
    }

    // Initialize sensitivity stability slider
    function initSensitivityStabilitySlider()
    {
        sliderSensitivityStability = p.createSlider(10, 100, 10);
        sliderSensitivityStability.parent('container');
        var sliderSize =  0.2 *  widthCanvas;
        sliderSensitivityStability.style('width', `${sliderSize}px`);
        sliderSensitivityStability.position(xCanvas + 0.9 * widthCanvas - sliderSize, yCanvas + 1.02*heightCanvas);
    }


    // Define coordinate lines
    function CoordLines()
    {
        x1_lineYaw = - widthCanvas * 0.4;
        x2_lineYaw = widthCanvas * 0.4;
        y1_lineYaw = - heightCanvas * 0.25;
        y2_lineYaw = y1_lineYaw;
        y1_indicatorYaw = y1_lineYaw - (x2_lineYaw - x1_lineYaw)/25;
        y2_indicatorYaw = y1_lineYaw + (x2_lineYaw - x1_lineYaw)/25;

        x1_lineRoll = - widthCanvas * 0.4;
        x2_lineRoll = widthCanvas * 0.4;
        y1_lineRoll = 0;
        y2_lineRoll = y1_lineRoll;
        y1_indicatorRoll = y1_lineRoll - (x2_lineRoll - x1_lineRoll)/25;
        y2_indicatorRoll = y1_lineRoll + (x2_lineRoll - x1_lineRoll)/25;

        x1_linePitch = - widthCanvas * 0.4;
        x2_linePitch = widthCanvas * 0.4;
        y1_linePitch = heightCanvas * 0.25;
        y2_linePitch = y1_linePitch;
        y1_indicatorPitch = y1_linePitch - (x2_linePitch - x1_linePitch)/25;
        y2_indicatorPitch = y1_linePitch + (x2_linePitch - x1_linePitch)/25;
    }


    // Main draw function for P5 sketch
    p.draw = function() {
        p.background(colorBackground);

        // Calculate position indicators
        calculIndicators();

        // Display lines and indicators
        displayLine();

    }

    // Calibration function called when the calibration button is clicked
    function calibrate() 
    {
        q0_ref = q0 - 1;
        q1_ref = q1;
        q2_ref = q2;
        q3_ref = q3;
    }

    // Calculate position indicators based on quaternions and slider sensitivity
    function calculIndicators()
    {
        var w = q0 - q0_ref;
        var x = q1 - q1_ref;
        var yq = q2 - q2_ref;
        var z = q3 - q3_ref;
        
        yaw = 180 / Math.PI * Math.atan2(2 * (w * z + x * yq), 1 - 2 * (yq * yq + z * z)) * sliderSensitivity.value();
        pitch = 180 / Math.PI * Math.asin(2 * (w * x - yq * z)) * sliderSensitivity.value();
        roll = 180 / Math.PI * Math.atan2(2 * (w * yq + x * z), 1 - 2 * (x * x + yq * yq)) * sliderSensitivity.value();

        y = ypr(yaw, y, 180);
        pi = ypr(pitch, pi, 90);
        r = ypr(roll, r, 180);

        yaw = yaw - y * 360;
        pitch = pitch - pi * 180;
        roll = roll - r * 360;

        x_indicatorYaw = yaw * x1_lineYaw / (-180);
        x_indicatorRoll = roll * x1_lineRoll / (-180);
        x_indicatorPitch = pitch * x1_linePitch / (-90);
    }

    // Helper function to manage yaw, pitch, and roll factoring
    function ypr(theta, fact, range)
    {
        if(theta > range * (fact + 1) && fact == 0)
        {
            fact ++;
        }
        else if(theta > range + 2 * range * fact && fact!=0)
        {
            fact ++;
        }

        else if(theta < -range * (-fact + 1) && fact == 0)
        {
            fact --;
        }

        else if(theta < -range - 2 * range * (-fact) && fact!=0)
        {
            fact --;
        }
        return fact;
    }

    // Display lines and indicators on canvas
    function displayLine() 
    {
        p.strokeWeight(4);

        p.stroke(255, 0, 0);
        p.line(x1_lineYaw, y1_lineYaw, 0, x2_lineYaw, y2_lineYaw, 0);
        p.line(x_refIndYaw, y1_indicatorYaw, 0, x_refIndYaw,y2_indicatorYaw, 0);
        p.line(x_indicatorYaw, y1_indicatorYaw, 0, x_indicatorYaw, y2_indicatorYaw, 0);

        p.stroke(0, 0, 255);
        p.line(x1_lineRoll, y1_lineRoll, 0, x2_lineRoll, y2_lineRoll, 0);
        p.line(x_refIndRoll, y1_indicatorRoll, 0, x_refIndRoll,y2_indicatorRoll, 0);
        p.line(x_indicatorRoll, y1_indicatorRoll, 0, x_indicatorRoll, y2_indicatorRoll, 0);

        p.stroke(0, 255, 0);
        p.line(x1_linePitch, y1_linePitch, 0, x2_linePitch, y2_linePitch, 0);
        p.line(x_refIndPitch, y1_indicatorPitch, 0, x_refIndPitch, y2_indicatorPitch, 0);
        p.line(x_indicatorPitch, y1_indicatorPitch, 0, x_indicatorPitch, y2_indicatorPitch, 0);           
    }

    // Resize function for window resizing
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = window.innerHeight*0.25;
        xCanvas = window.innerWidth*0.75;
        canvasOrientation.position(window.innerWidth*0.75,100);
        calibrationButton.position(window.innerWidth*0.68,window.innerHeight * 0.15);

        var sliderSize =  0.2 *  widthCanvas;
        sliderSensitivityStability.style('width', `${sliderSize}px`);
        sliderSensitivityStability.position(xCanvas + 0.9 * widthCanvas - sliderSize, yCanvas + 1.02*heightCanvas);

        CoordLines();

        calibrationButton.position(xCanvas  - 0.31 * widthCanvas,yCanvas + 0.22 * heightCanvas);

        p.resizeCanvas(widthCanvas, heightCanvas);
    }
};

// Create a new instance of the orientation sketch
var orientation = new p5(orientationSketch,"c1");
