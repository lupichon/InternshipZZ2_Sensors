/**
 * @fileoverview Manages post-training interface for orientation visualisation (indictors).
 * @author Lucas Pichon
 */

/**
 * @brief Represents the orientation sketch using p5.js.
 * 
 * This sketch visualizes yaw, pitch, and roll indicators based on quaternion values.
 * It utilizes p5.js for rendering in a WebGL context.
 * 
 * @param {p5} p - The p5.js instance.
 */
var orientationSketch = function(p) 
{
    let widthCanvas;
    let heightCanvas;
    let xCanvas;
    let yCanvas;

    var x_refIndRoll = 0, x_refIndYaw = 0, x_refIndPitch = 0;

    var x1_lineYaw, x2_lineYaw, y1_lineYaw, y2_lineYaw;
    var x_indicatorYaw, y1_indicatorYaw, y2_indicatorYaw; 

    var x1_linePitch, x2_linePitch, y1_linePitch, y2_linePitch;
    var x_indicatorPitch, y1_indicatorPitch, y2_indicatorPitch; 

    var x1_lineRoll, x2_lineRoll, y1_lineRoll, y2_lineRoll;
    var x_indicatorRoll, y1_indicatorRoll, y2_indicatorRoll;

    /**
     * @brief Waits for the visualization script to load before continuing.
     */
    function waitForScript1() 
    {
        if (window.visualisationRifleGraphOK) 
        {
            
        } 
        else 
        {
            setTimeout(waitForScript1, 50); 
        }
    }

    /**
     * @brief Sets up the initial environment for the sketch.
     */
    p.setup = function() 
    {
        waitForScript1();
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = window.innerHeight*0.25;
        xCanvas = window.innerWidth*0.75;
        yCanvas = 100;

        canvasOrientation = p.createCanvas(widthCanvas, heightCanvas,p.WEBGL);
        canvasOrientation.parent('container');
        canvasOrientation.position(xCanvas, yCanvas);

        CoordLines();

    }

    /**
     * @brief Defines coordinate lines for yaw, pitch, and roll indicators.
     */
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

    /**
     * @brief Main drawing function, updates and displays indicators.
     */
    p.draw = function() 
    {
        p.background(colorBackground);

        calculIndicators(); // Calculate coordinates of the indicators
        displayLine();      // Display indicators

    }

    /**
     * @brief Calculates yaw, pitch, and roll indicators based on quaternion values.
     */
    function calculIndicators()
    {
        var ind = sliderPlay.value();
        yaw = 180 / Math.PI * Math.atan2(2 * (q0[ind] * q3[ind] + q1[ind] * q2[ind]), 1 - 2 * (q2[ind] * q2[ind] + q3[ind] * q3[ind])) * sliderSensitivityValue;  
        pitch = 180 / Math.PI * Math.asin(2 * (q0[ind] * q1[ind] - q2[ind] * q3[ind])) * sliderSensitivityValue;
        roll = 180 / Math.PI * Math.atan2(2 * (q0[ind] * q2[ind] + q1[ind] * q3[ind]), 1 - 2 * (q1[ind] * q1[ind] + q2[ind] * q2[ind])) * sliderSensitivityValue;

        // Handle overruns
        var r = ypr(roll, 180);
        var y = ypr(yaw, 180);
        var pi = ypr(pitch, 90);

        roll = roll - r * 360;
        yaw = yaw - y * 360;
        pitch = pitch - pi * 180;
    
        x_indicatorYaw = yaw * x1_lineYaw / (-180);
        x_indicatorRoll = roll * x1_lineRoll / (-180);
        x_indicatorPitch = pitch * x1_linePitch / (-90);
    }

    /**
     * @brief Adjusts values to fit within a specified range.
     * @param {number} theta - The angle value to adjust.
     * @param {number} range - The maximum range for the angle.
     * @returns {number} Adjusted factor based on range.
     */
    function ypr(theta, range)
    {
        var fact = 0;

        if(theta > range)
        {
            fact = 1 + Math.floor((theta - range) / (2 * range));
        }
        else if (theta < - range)
        {
            fact = - 1 + Math.floor((theta + range) / (2 * range));
        }
        return fact;
    }

    /**
     * @brief Displays yaw, pitch, and roll indicators on the canvas.
     */
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

    /**
     * @brief Adjusts canvas size and repositions elements upon window resize.
     */
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = window.innerHeight*0.25;
        xCanvas = window.innerWidth*0.75;
        canvasOrientation.position(window.innerWidth*0.75,100);

        CoordLines();

        p.resizeCanvas(widthCanvas, heightCanvas);
    }
};

var orientation = new p5(orientationSketch,"c1");
