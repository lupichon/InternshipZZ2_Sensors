/**
 * @fileoverview Manages post-training interface for gravity center visualisation.
 * @author Lucas Pichon
 */

// Array to store points
let comparePointsX = new Array();
let comparePointsY = new Array();
let comparePointsInd = new Array();
let saveComparePointsX = new Array();
let saveComparePointsY = new Array();

// Rectangle dimension 
var xFactorVW, yFactorVW;
var xRectVW;
var yRectVW;
var wRectVW;
var hRectVW;

/**
 * @brief Main sketch function for the canvas drawing.
 */
var wiiboardSketch = function(p) 
{
    // Canvas dimension 
    var widthCanvas, heightCanvas;
    var xCanvas, yCanvas;

    // Array to store tail points
    let xtail = new Array();
    let ytail = new Array();

    // To number the points 
    var shotIDText = document.getElementById("ShotID");
    var sessionIDText = document.getElementById("SessionID");

    // Scale and sansitivity for zooming
    var scale = 1;
    var sensitivity = 0.02;
    var originX = 0; 
    var originY = 0;

    var dragStartX, dragStartY;
    var originStartX, originStartY;
    var maxX;
    var maxY;
    var minX;
    var minY;
    var dragging = false;

    // Index of the point covered by the mouse 
    var coveredPoint = -1;
    
    /**
     * @brief Initializes the canvas and sets up initial values.
     */
    p.setup = function() 
    {
        xCanvas = 0;
        yCanvas = 100;
        widthCanvas = window.innerWidth / 2;
        heightCanvas = (window.innerHeight - yCanvas )/ 2;

        xFactorVW = 0.98 * widthCanvas;
        yFactorVW = 0.9 * heightCanvas;

        xRectVW = (widthCanvas - xFactorVW) / 2;
        yRectVW = (heightCanvas - yFactorVW) * 0.7;
        wRectVW = xFactorVW;
        hRectVW = yFactorVW;


        canvas = p.createCanvas(widthCanvas, heightCanvas);
        canvas.parent('container');
        canvas.position(xCanvas, yCanvas);

        for (var i = 0; i < X_tab.length; i++) 
        {
            xtail.push(xRectVW + wRectVW / 2 + Math.round(xFactorVW / 2 * X_tab[i]));
            ytail.push(yRectVW + hRectVW / 2 - Math.round(yFactorVW / 2 * Y_tab[i]));
        }

        maxX = -widthCanvas * (scale - 1);
        maxY = -heightCanvas * (scale - 1);
        minX = 0;
        minY = 0;
    };

    /**
     * @brief Draws the content on the canvas.
     */
    p.draw = function() 
    {
        if (xtail.length == 0)
        {
            for (var i = 0; i < X_tab.length; i++) 
            {
                xtail.push(xRectVW + wRectVW / 2 + Math.round(xFactorVW / 2 * X_tab[i]));
                ytail.push(yRectVW + hRectVW / 2 - Math.round(yFactorVW / 2 * Y_tab[i]));
            }
        }

        p.background(255);

        p.translate(originX, originY);
        p.scale(scale);

        displayIDs();
        displayLegend();

        drawRectangle();
        drawGrid(xRectVW, yRectVW, wRectVW, hRectVW, 20);
        drawPoint();
        drawTail();
        drawOtherPoints();
    };

    /**
     * @brief Draws the main rectangle on the canvas.
     */
    function drawRectangle() 
    {
        p.push();

        p.strokeWeight(2);
        p.stroke(0, 0, 255);
        p.rect(xRectVW, yRectVW, wRectVW, hRectVW);

        p.pop();
    }

    /**
     * @brief Draws the grid inside the main rectangle.
     * @param {number} x - X-coordinate of the grid's origin.
     * @param {number} y - Y-coordinate of the grid's origin.
     * @param {number} w - Width of the grid.
     * @param {number} h - Height of the grid.
     * @param {number} squareSize - Size of each grid square.
     */
    function drawGrid(x, y, w, h, squareSize) 
    {
        p.push();

        let centerX = x + w / 2;
        let centerY = y + h / 2;

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

        p.stroke(0,0,0);
        p.line(x, centerY, x + w, centerY);
        p.line(centerX, y, centerX, y + h);

        p.pop();
    }

    /**
     * @brief Draws the main point on the canvas.
     */
    function drawPoint()
    {
        p.push();

        p.noStroke();
        p.fill(0, 0, 0);
        p.circle(xtail[xtail.length/2 - 1], ytail[ytail.length/2 - 1], 15);

        p.pop();
    }

    /**
     * @brief Draws the tail points on the canvas.
     */
    function drawTail() 
    {
        p.push();
        p.strokeWeight(2);
        for (var i = 0; i < X_tab.length - 1; i++)
        {
            if(i < X_tab.length/2 - 200)
            {
                p.stroke(0, 200, 0);
            }
            else if(i>= X_tab.length/2 - 200 && i<= X_tab.length/2 - 25)
            {
                p.stroke(255, 130, 0);
            }
            else if(i> X_tab.length/2 - 25 && i<= X_tab.length/2 -1)
            {
                p.stroke(0, 0, 255);
            }
            else
            {
                p.stroke(255, 0, 0);
            }
            p.line(xtail[i], ytail[i], xtail[i + 1], ytail[i + 1]);
        }

        p.pop();
    }

    /**
     * @brief Draws the other comparison points on the canvas.
     */
    function drawOtherPoints()
    {
        p.push();
        p.strokeWeight(2);
        p.textSize(8);
        p.textStyle(p.BOLD);
       
        for(var i = 0; i < comparePointsX.length; i++)
        {
            for(var j = 0; j < comparePointsX[0].length - 1; j++)
            {
                if(j < comparePointsX[0].length/2 - 200)
                {
                    p.stroke(0, 200, 0);
                }
                else if(j>= comparePointsX[0].length/2 - 200 && j<= comparePointsX[0].length/2 - 25)
                {
                    p.stroke(255, 130, 0);
                }
                else if(j> comparePointsX[0].length/2 - 25 && j<= comparePointsX[0].length/2 -1)
                {
                    p.stroke(0, 0, 255);
                }
                else
                {
                    p.stroke(255, 0, 0);
                }
                p.line(comparePointsX[i][j], comparePointsY[i][j], comparePointsX[i][j+1], comparePointsY[i][j+1]);
            }
            
            p.push();
            
            if(comparePointsInd[i] == coveredPoint)
            {
                p.fill(150, 150, 150);
            }
            else
            {
                p.fill(0 ,0 ,0);
            }

            p.noStroke();
            p.circle(comparePointsX[i][comparePointsX[i].length/2 - 1], comparePointsY[i][comparePointsY[i].length/2 - 1], 15)

            p.fill(255,255,255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(comparePointsInd[i], comparePointsX[i][comparePointsX[i].length/2 - 1], comparePointsY[i][comparePointsY[i].length/2 - 1]);
            
            p.pop();
        }
        p.pop();
    }

    /**
     * @brief Displays the shot and session IDs on the canvas.
     */
    function displayIDs() 
    {
        shotIDText.innerText = "Shot number " + shotID;
        sessionIDText.innerText = "Session ID : " + sessionID;
    }

    /**
     * @brief Displays the legend on the canvas.
     */
    function displayLegend()
    {
        var offsetX = wRectVW/4.9;
        var offsetY = yRectVW * 0.3
        var size = 0.25 * (offsetX - xRectVW)/2;
        var textSize = 10;

        p.push();

        p.strokeWeight(4)

        p.stroke(0,200,0);
        p.line(offsetX - size, offsetY, offsetX + size, offsetY);

        p.stroke(255,130,0);
        p.line(2 * offsetX - size, offsetY, 2 * offsetX  + size, offsetY);

        p.stroke(0,0,255);
        p.line(3 * offsetX- size, offsetY, 3 * offsetX + size, offsetY);

        p.stroke(255,0,0);
        p.line(4 * offsetX - size, offsetY, 4 * offsetX + size, offsetY);

        p.noStroke();
        p.textSize(textSize);
        p.textAlign(p.CENTER, p.CENTER); 
        p.text('3 seconds before the shot', offsetX, 2.5 * offsetY);
        p.text('1 second before the shot', 2 * offsetX, 2.5 * offsetY);
        p.text('0.25 second before the shot', 3 * offsetX, 2.5 * offsetY);
        p.text('Follow-through', 4 * offsetX, 2.5 * offsetY);

        p.pop();
    }

    /**
     * @brief Handles zooming in and out with the mouse wheel.
     * @param {Object} event - Mouse wheel event
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
     * @brief Checks if a click is within a circle.
     * @param {number} clickX - X-coordinate of the click
     * @param {number} clickY - Y-coordinate of the click
     * @param {number} circleX - X-coordinate of the circle
     * @param {number} circleY - Y-coordinate of the circle
     * @param {number} radius - Radius of the circle
     * @return {boolean} True if the click is inside the circle, false otherwise.
     */
    function isClickInCircle(clickX, clickY, circleX, circleY, radius) 
    {
        const distance = Math.sqrt((clickX - circleX) ** 2 + (clickY - circleY) ** 2);
        return distance <= radius;
    }

    /**
     * @brief Handles the mouse pressed event for dragging and removing points.
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

        var ind = comparePointsX.length - 1;
        let mouseXRelatif = (p.mouseX - originX) / scale;
        let mouseYRelatif = (p.mouseY - originY) / scale;

        while(ind >= 0)
        {
            if(isClickInCircle(mouseXRelatif, mouseYRelatif, comparePointsX[ind][comparePointsX[ind].length/2 - 1], comparePointsY[ind][comparePointsY[ind].length/2 - 1], 15))
            {
                comparePointsX.splice(ind, 1);
                comparePointsY.splice(ind,1);
                comparePointsInd.splice(ind,1);
                saveComparePointsX.splice(ind,1);
                saveComparePointsY.splice(ind,1);
                break;
            }
            ind --;
        }
    };

    /**
     * @brief Handles the mouse released event to stop dragging.
     */
    p.mouseReleased = function() 
    {
        dragging = false;
    };

    /**
     * @brief Handles the mouse dragged event for panning the canvas.
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
     * @brief Handles the mouse moved event to detect hover over points.
     */
    p.mouseMoved = function()
    {
        var ind = comparePointsInd.length - 1;
        let mouseXRelatif = (p.mouseX - originX) / scale;
        let mouseYRelatif = (p.mouseY - originY) / scale;

        while(ind >=0)
        {
            if(isClickInCircle(mouseXRelatif, mouseYRelatif, comparePointsX[ind][comparePointsX[ind].length/2 - 1], comparePointsY[ind][comparePointsY[ind].length/2 - 1], 15))
            {
                coveredPoint = comparePointsInd[ind];
                break;
            }
            coveredPoint = -1;
            ind --;
        }
    };
    
    /**
     * @brief Handles window resize events to adjust the canvas.
     */
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth / 2;
        heightCanvas = (window.innerHeight - yCanvas)/ 2;

        xFactorVW = 0.98 * widthCanvas;
        yFactorVW = 0.9 * heightCanvas;

        xRectVW = (widthCanvas - xFactorVW) / 2;
        yRectVW = (heightCanvas - yFactorVW) *0.7;
        wRectVW = xFactorVW;
        hRectVW = yFactorVW;

        minX = -widthCanvas * (scale - 1);
        minY = -heightCanvas * (scale - 1);

        for (var i = 0; i < X_tab.length; i++) 
        {
            xtail[i] = xRectVW + wRectVW / 2 + Math.round(xFactorVW / 2 * X_tab[i]);
            ytail[i] = yRectVW + hRectVW / 2 - Math.round(yFactorVW / 2 * Y_tab[i]);
        }

        for (var i = 0; i < comparePointsInd.length; i++)
        {
            for(var j = 0; j < comparePointsX[i].length; j++)
            {
                comparePointsX[i][j] = xRectVW + wRectVW / 2 + Math.round(xFactorVW / 2 * saveComparePointsX[i][j]);
                comparePointsY[i][j] = yRectVW + hRectVW / 2 - Math.round(yFactorVW / 2 * saveComparePointsY[i][j]);
            }
        }

        p.resizeCanvas(widthCanvas, heightCanvas);
    };
};

var wiiboard = new p5(wiiboardSketch, 'c1');