/**
 * @fileoverview Manages real-time interface for gravity center visualisation.
 * @author Lucas Pichon
 */

var Xcalibration = 0;
var Ycalibration = 0;

/**
 * Main sketch function using p5.js library for drawing on canvas.
 * @param {p5} p - p5.js instance.
 */
var wiiboardSketch = function(p) 
{
    // Variables for storing current and transformed coordinates
    var newX, newY;
    var _x, _y;

    // Canvas dimensions and factors for scaling elements
    var widthCanvas, heightCanvas;
    var xFactor, yFactor;

    // Rectangle dimensions and position within canvas
    var xRect;
    var yRect;
    var wRect;
    var hRect;

    // Number of tail coordinates to keep track of
    var NB_coordinates = 300;
    let xtail = new Array(NB_coordinates);
    let ytail = new Array(NB_coordinates);
    let Xtail = new Array(NB_coordinates);
    let Ytail = new Array(NB_coordinates);

    // Arrays to store old points for drawing and display
    let xOldPoints = new Array();
    let yOldPoints = new Array();
    let XOldPoints = new Array();
    let YOldPoints = new Array();

    // UI elements: sliders and buttons
    let sliderSquareSize;
    let clearButton;
    let calibrationButton;

    var shotIDText = document.getElementById("ShotID");
    var sessionIDText = document.getElementById("SessionID");

    // Variables for scaling and panning the canvas
    var scale = 1;
    var sensitivity = 0.02;
    var originX = 0; 
    var originY = 0;

    // Variables for drag interaction
    var dragStartX, dragStartY;
    var originStartX, originStartY;
    var maxX;
    var maxY;
    var minX;
    var minY;

    // UI constants for button and slider dimensions
    let buttonWidth = 0.12 * widthCanvas;
    let buttonHeight = 0.08 * heightCanvas;
    let fontSize = buttonHeight * 0.3;
    let sliderSize =  0.25 *  widthCanvas;
    
    /**
     * Setup function called once at the beginning.
     * Initializes canvas, UI elements, and sets initial parameters.
     */
    p.setup = function() 
    {
        // Initialize canvas dimensions and factors
        widthCanvas = window.innerWidth / 2;
        heightCanvas = window.innerHeight / 2 - 50;
        xFactor = 0.98 * widthCanvas;
        yFactor = 0.85 * heightCanvas;

        // Calculate rectangle dimensions and position
        xRect = (widthCanvas - xFactor) / 2;
        yRect = (heightCanvas - yFactor) * 0.1;
        wRect = xFactor;
        hRect = yFactor;

        // Create canvas and position it
        canvas = p.createCanvas(widthCanvas, heightCanvas);
        canvas.parent('container');
        canvas.position(0, 100);

        // Initialize tail arrays with default values
        for (var i = 0; i < NB_coordinates; i++) 
        {
            xtail[i] = xRect + wRect/2;
            ytail[i] = yRect + hRect/2;
        }

        // Initialize UI elements
        initSliderSquareSize();
        initClearButton();
        initCalibrationButton();

        // Set constraints for panning the canvas
        maxX = -widthCanvas * (scale - 1);
        maxY = -heightCanvas * (scale - 1);
        minX = 0;
        minY = 0;
    };

    /**
     * @brief Calculates the stability change based on quaternion values.
     * @param {number} i - Index for quaternion array.
     * @returns {number} - Stability change value.
     */

    /**
     * @brief Initializes the slider for adjusting square size.
     */
    function initSliderSquareSize() 
    {
        sliderSquareSize = p.createSlider(10, 50, 20);
        sliderSquareSize.parent('container');
        sliderSquareSize.position(widthCanvas * 0.75, 100 + heightCanvas * 0.91);
        var sliderSize =  0.17 *  widthCanvas;
        sliderSquareSize.style('width', `${sliderSize}px`);
    }
    
    /**
     * @brief Initializes the button for clearing old points.
     */
    function initClearButton() 
    {
        clearButton = p.createButton('Clear points');
        clearButton.mousePressed(() => {
            xOldPoints = [];
            yOldPoints = [];
        });
        clearButton.parent('container');
        clearButton.class('oval-button');
        clearButton.position(widthCanvas * 0.1, 100 + xRect + hRect + 0.02 * heightCanvas);
        clearButton.style('font-size', `${fontSize}px`); 
    }

    /**
     * @brief Initializes the button for calibration.
     */
    function initCalibrationButton()
    {
        calibrationButton = p.createButton('Calibrate');
        calibrationButton.mousePressed(() =>
        {
            Xcalibration = X;
            Ycalibration = Y;
        });
        calibrationButton.parent('container');
        calibrationButton.class('oval-button');
        calibrationButton.position(widthCanvas * 0.45, 100 + heightCanvas*0.89);
        calibrationButton.style('font-size', `${fontSize}px`);
    }

    /**
     * Main draw function called continuously to update canvas.
     * Draws grid, points, and manages user interaction.
     */
    p.draw = function() 
    {
        p.background(255);

        // Translate and scale canvas based on user interaction
        p.translate(originX, originY);
        p.scale(scale);

        // Display shot and session IDs
        displayIDs();

        // Draw rectangle border
        drawRectangle();

        // Draw grid inside rectangle
        drawGrid(xRect, yRect, wRect, hRect, sliderSquareSize.value());
        
        // Draw old points
        drawOdlPoint();

        // Calculate new X and Y coordinates based on calibration
        calculXY();

        // Draw current point
        drawPoint();

        // Draw tail of connected points
        drawTail();
    };

    /**
     * @brief Draws the rectangle border around the main area.
     */
    function drawRectangle() 
    {
        p.push();

        p.strokeWeight(2);
        p.stroke(0, 0, 255);
        p.rect(xRect, yRect, wRect, hRect);

        p.pop();
    }

    /**
     * @brief Draws the grid within the specified area.
     * @param {number} x - X-coordinate of the top-left corner of the grid area.
     * @param {number} y - Y-coordinate of the top-left corner of the grid area.
     * @param {number} w - Width of the grid area.
     * @param {number} h - Height of the grid area.
     * @param {number} squareSize - Size of each square in the grid.
     */
    function drawGrid(x, y, w, h, squareSize) 
    {
        p.push();

        let centerX = x + w / 2;
        let centerY = y + h / 2;

        p.push();
        let c = p.color(0);
        c.setAlpha(50);
        p.stroke(c);

        for (let yPos = centerY; yPos <= y + h; yPos += squareSize) 
        {
            p.line(x, yPos, x + w, yPos);
        }
        for (let yPos = centerY; yPos >= y; yPos -= squareSize) 
        {
            p.line(x, yPos, x + w, yPos);
        }
        for (let xPos = centerX; xPos <= x + w; xPos += squareSize) 
        {
            p.line(xPos, y, xPos, y + h);
        }
        for (let xPos = centerX; xPos >= x; xPos -= squareSize) 
        {
            p.line(xPos, y, xPos, y + h);
        }
        p.pop();

        p.stroke(0,0,0);
        p.line(x, centerY, x + w, centerY);
        p.line(centerX, y, centerX, y + h);

        p.pop();
    }

    /**
     * @brief Calculates the transformed X and Y coordinates based on calibration values.
     */
    function calculXY() 
    {
        newX = X - Xcalibration;
        newY = Y - Ycalibration;
        _x = xRect + wRect / 2 + Math.round(xFactor / 2 * newX);
        _y = yRect + hRect / 2 - Math.round(yFactor / 2 * newY);

        if (CoG) 
        {
            xOldPoints.push(_x);
            yOldPoints.push(_y);
            XOldPoints.push(newX);
            YOldPoints.push(newY);
            CoG = 0;
        }
    }

    /**
     * @brief Draws the current point on the canvas.
     */
    function drawPoint() 
    {
        p.push();

        p.noStroke();
        p.fill(255, 0, 0);
        p.circle(_x, _y, 10);

        p.pop();

        // Update tail arrays with current point
        xtail.shift();
        ytail.shift();
        xtail.push(_x);
        ytail.push(_y);

        Xtail.shift();
        Ytail.shift();
        Xtail.push(newX);
        Ytail.push(newY);

    }

    /**
     * @brief Draws the trail of old points on the canvas.
     */
    function drawTail() {
        p.push();
        p.stroke(0, 0, 255);
        for (var i = 0; i < NB_coordinates - 1; i++) {
            p.line(xtail[i], ytail[i], xtail[i + 1], ytail[i + 1]);
        }
        p.pop();
    }

    /**
     * @brief Draws old points for display.
     */
    function drawOdlPoint() 
    {
        p.push();
        let c = p.color(0, 255, 0);
        c.setAlpha(255);
        p.fill(c);
        p.noStroke();

        p.textSize(8);
        p.textStyle(p.BOLD);

        for (var i = 0; i < xOldPoints.length; i++) 
        {
            p.circle(xOldPoints[i], yOldPoints[i], 10);
            p.push();
            p.fill(0);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(shotID - xOldPoints.length + i, xOldPoints[i], yOldPoints[i]);
            p.pop();
        }
        p.pop();
    }

    /**
     * @brief Displays shot and session IDs.
     */
    function displayIDs() {
        shotIDText.innerText = "Shot number " + shotID;
        sessionIDText.innerText = "Session ID : " + sessionID;
    }

    /**
     * @brief Handles mouse wheel events for zooming in and out.
     * @param event Mouse wheel event.
     */
    p.mouseWheel = function(event) 
    {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) 
        {
            let zoom = 1;
    
            if (event.delta < 0) 
            { 
                zoom = 1 + sensitivity;
            } 
            else if (event.delta > 0) 
            {
                zoom = 1 - sensitivity;
            }

            interval = scale * zoom;
            if (interval >= 1 && interval <= 2) 
            {
                scale *= zoom;
                let mouseXRelatif = (p.mouseX - originX) / scale;
                let mouseYRelatif = (p.mouseY - originY) / scale;
    
                originX -= mouseXRelatif * (zoom - 1) * scale;
                originY -= mouseYRelatif * (zoom - 1) * scale;
            } 
            else 
            {
                if(interval <1)
                {
                    scale = 1;
                    originX = 0;
                    originY = 0;
                }
                else
                {
                    scale = 2;
                }
            }

            minX = -widthCanvas * (scale - 1);
            minY = -heightCanvas * (scale - 1);
            originX = p.constrain(originX, minX, maxX);
            originY = p.constrain(originY, minY, maxY);
    
            event.preventDefault();
        }
    };

    /**
     * @brief Handles mouse press events for dragging and selecting points.
     */
    p.mousePressed = function() 
    {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) 
        {
            dragging = true;

            dragStartX = p.mouseX;
            dragStartY = p.mouseY;

            originStartX = originX;
            originStartY = originY;
        }
    };

    /**
     * @brief Handles mouse release events to stop dragging.
     */
    p.mouseReleased = function() 
    {
        dragging = false;
    };

    /**
     * @brief Handles mouse drag events for panning.
     */
    p.mouseDragged = function() 
    {
        if (dragging) 
        {

            let dx = p.mouseX - dragStartX;
            let dy = p.mouseY - dragStartY;
            originX = originStartX + dx;
            originY = originStartY + dy;

            originX = p.constrain(originX, minX, maxX);
            originY = p.constrain(originY, minY, maxY);

        }
    };
    
    /**
     * @brief Handles window resize events to adjust canvas and elements.
     */
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth / 2;
        heightCanvas = window.innerHeight / 2 - 50;

        xFactor = 0.98 * widthCanvas;
        yFactor = 0.85 * heightCanvas;

        xRect = (widthCanvas - xFactor) / 2;
        yRect = (heightCanvas - yFactor) * 0.1;

        wRect = xFactor;
        hRect = yFactor;

        minX = -widthCanvas * (scale - 1);
        minY = -heightCanvas * (scale - 1);

        for (var i = 0; i < xOldPoints.length; i++) 
        {
            xOldPoints[i] = xRect + wRect / 2 + Math.round(xFactor / 2 * XOldPoints[i]);
            yOldPoints[i] = yRect + hRect / 2 - Math.round(yFactor / 2 * YOldPoints[i]);
        }

        for (var i = 0; i < NB_coordinates; i++) 
        {
            xtail[i] = xRect + wRect / 2 + Math.round(xFactor / 2 * Xtail[i]);
            ytail[i] = yRect + hRect / 2 - Math.round(yFactor / 2 * Ytail[i]);
        }

        sliderSquareSize.position(widthCanvas * 0.75, heightCanvas * 1.09);

        p.resizeCanvas(widthCanvas, heightCanvas);

        
        clearButton.position(widthCanvas * 0.1, 100 + xRect + hRect + 0.02 * heightCanvas);
        calibrationButton.position(widthCanvas * 0.45, 100 + heightCanvas*0.89);
        sliderSquareSize.position(widthCanvas * 0.75, 100 + heightCanvas * 0.91);

        buttonWidth = 0.12 * widthCanvas;
        buttonHeight = 0.08 * heightCanvas;
        fontSize = buttonHeight * 0.3;
        sliderSize =  0.17 *  widthCanvas;
 
        clearButton.style('font-size', `${fontSize}px`); 
        calibrationButton.style('font-size', `${fontSize}px`); 
        sliderSquareSize.style('width', `${sliderSize}px`);
    };
};

var wiiboard = new p5(wiiboardSketch, 'c1');
