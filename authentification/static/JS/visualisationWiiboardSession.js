/**
 * @fileoverview Manages post-training interface for gravity center visualisation (all the points of the session).
 * @author Lucas Pichon
 */

var wiiboardSketch = function(p) 
{
    // Canvas dimensions
    var widthCanvas, heightCanvas;
    var xFactor, yFactor;

    // Rectangle dimensions
    var xRect;
    var yRect;
    var wRect;
    var hRect;

    // Zoom and pan variables
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

    // Array to store all the points 
    let totalPointsX = new Array();
    let totalPointsY = new Array();

    var coveredPoint = -1;

    var inputSelectPoint;
    
    /**
     * @brief Setup function to initialize the canvas and variables.
     */
    p.setup = function() 
    {
        xCanvas = 0;
        yCanvas = 100 + (window.innerHeight - 100)/2;
        widthCanvas = window.innerWidth / 2;
        heightCanvas = (window.innerHeight - 100 ) / 2;

        xFactor = 0.98 * widthCanvas;
        yFactor = 0.9 * heightCanvas;

        xRect = (widthCanvas - xFactor) / 2;
        yRect = (heightCanvas - yFactor) *0.7;
        wRect = xFactor;
        hRect = yFactor;

        canvasSession = p.createCanvas(widthCanvas, heightCanvas);
        canvasSession.parent('container');
        canvasSession.position(xCanvas, yCanvas);

        maxX = -widthCanvas * (scale - 1);
        maxY = -heightCanvas * (scale - 1);
        minX = 0;
        minY = 0;

        for (var i = 0; i < X_total_points.length; i++)
        {
            totalPointsX.push(xRect + wRect / 2 + Math.round(xFactor / 2 * X_total_points[i]));
            totalPointsY.push(yRect + hRect / 2 - Math.round(yFactor / 2 * Y_total_points[i]));
        }
        
        inputSelectPoint = p.createInput('');
        inputSelectPoint.parent('container');
        inputSelectPoint.size(25,20);
        inputSelectPoint.position(xRect + (wRect - 25)/2, yCanvas);
        inputSelectPoint.style('background-color', 'lightgray');
    }
   
    /**
     * @brief Draw function to render the canvas content.
     */
    p.draw = function() 
    {
        if(totalPointsX.length == 0)
        {
            for (var i = 0; i < X_total_points.length; i++)
            {
                totalPointsX.push(xRect + wRect / 2 + Math.round(xFactor / 2 * X_total_points[i]));
                totalPointsY.push(yRect + hRect / 2 - Math.round(yFactor / 2 * Y_total_points[i]));
            }
        }

        p.background(255);

        p.push();
        p.noStroke();
        p.textSize(10);
        p.text('Enter a point number or click directly on the points to compare', xRect, 10);

        p.pop();

        p.translate(originX, originY);
        p.scale(scale);

        drawRectangle();
        drawGrid(xRect, yRect, wRect, hRect, 20);
        drawPoint();
    };

    /**
     * @brief Draws the main rectangle on the canvas.
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
     * @brief Draws the points on the canvas.
     */
    function drawPoint()
    {   
        p.push();
        p.textSize(8);
        p.textStyle(p.BOLD);
        p.noStroke();

        var l = X_total_points.length;
        for (var i = 0; i < l; i ++)
        {
            if(!comparePointsInd.includes(i+1))
            {
                if(coveredPoint == l - i - 1)
                {
                    p.fill(150, 150, 150);
                }
                else
                {
                    p.fill(0, 0, 0);
                }
                p.circle(totalPointsX[l - i - 1], totalPointsY[l - i - 1], 15);

                p.push();
                p.fill(255,255,255);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(i + 1, totalPointsX[l - i - 1], totalPointsY[l - i - 1]);
                p.pop();
            }
        }
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

            var ind = 0;
            let mouseXRelatif = (p.mouseX - originX) / scale;
            let mouseYRelatif = (p.mouseY - originY) / scale;

            while(ind < totalPointsX.length)
            {
                if(isClickInCircle(mouseXRelatif, mouseYRelatif, totalPointsX[ind], totalPointsY[ind], 15) && !comparePointsInd.includes(totalPointsX.length - ind) && totalPointsX.length - ind!= shotID)
                {
                    addTail(ind);
                    break;
                }
                ind ++;
            }
        }
    };

    /**
     * @brief Adds a tail to the selected point.
     * @param ind Index of the selected point.
     */
    function addTail(ind)
    {
        $.ajax({
            url: `/data_visualisation/addTail/?ind=${ind}`,
            type: 'GET',

            success: function(data)
            {
                let tempTailX = new Array();
                let tempTailY = new Array();
                for (var i = 0; i < data.X_tail.length; i++)
                {
                    tempTailX.push(data.X_tail[i]);
                    tempTailY.push(data.Y_tail[i]);
                }
                saveComparePointsX.push(tempTailX);          
                saveComparePointsY.push(tempTailY);
       
                let tempX = data.X_tail;
                let tempY = data.Y_tail;

                for (var i = 0; i < tempX.length; i++)
                {
                    tempX[i] = xRectVW + wRectVW / 2 + Math.round(xFactorVW / 2 * tempX[i]);
                    tempY[i] = yRectVW + hRectVW / 2 - Math.round(yFactorVW / 2 * tempY[i]);
                }
                
                comparePointsX.push(tempX);
                comparePointsY.push(tempY);
                comparePointsInd.push(totalPointsX.length - ind);
            },
            
            error: function(xhr, status, error) {
                console.error("Erreur AJAX :", error);
            }
        });
    }

    /**
     * @brief Handles the mouse released event to stop dragging.
     */
    p.mouseReleased = function() 
    {
        dragging = false;
    };

    /**
     * @brief Handles the mouse moved event to detect hover over points.
     */
    p.mouseMoved = function()
    {
        var ind = 0;
        let mouseXRelatif = (p.mouseX - originX) / scale;
        let mouseYRelatif = (p.mouseY - originY) / scale;
        while(ind < totalPointsX.length)
        {
            if(isClickInCircle(mouseXRelatif, mouseYRelatif, totalPointsX[ind], totalPointsY[ind], 15) && !comparePointsInd.includes(totalPointsX.length - ind) && totalPointsX.length - ind!= shotID)
            {
                coveredPoint = ind;
                break;
            }
            coveredPoint = -1;
            ind ++;
        }
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
     * @brief Handles key press events to add points by pressing Enter.
     */
    p.keyPressed = function()
    {
        if (p.keyCode === p.ENTER)
        {
            var selectPoint = inputSelectPoint.value();
            if(!isNaN(selectPoint) && selectPoint>=1 && selectPoint<= totalPointsX.length && selectPoint!=shotID)
            {
                inputSelectPoint.value('');
                var i = 0;
                while(i < comparePointsInd.length && comparePointsInd[i]!= selectPoint)
                {
                    i++;
                }
                if (i==comparePointsInd.length)
                {
                    addTail(totalPointsX.length - selectPoint);
                }
            }
        }
    }

    /**
     * @brief Handles window resize events to adjust the canvas.
     */
    p.windowResized = function() 
    {
        xCanvas = 0;
        yCanvas = 100 + (window.innerHeight - 100)/2;
        widthCanvas = window.innerWidth / 2;
        heightCanvas = (window.innerHeight - 100 ) / 2;

        xFactor = 0.98 * widthCanvas;
        yFactor = 0.9 * heightCanvas;

        xRect = (widthCanvas - xFactor) / 2;
        yRect = (heightCanvas - yFactor) *0.7;
        wRect = xFactor;
        hRect = yFactor;

        minX = -widthCanvas * (scale - 1);
        minY = -heightCanvas * (scale - 1);

        inputSelectPoint.position(xRect + (wRect - 25)/2, yCanvas);

        canvasSession.position(xCanvas, yCanvas);
        p.resizeCanvas(widthCanvas, heightCanvas);

        for (var i = 0; i < X_tab.length; i++) 
        {
            totalPointsX[i] = xRect + wRect / 2 + Math.round(xFactor / 2 * X_total_points[i]);
            totalPointsY[i] = yRect + hRect / 2 - Math.round(yFactor / 2 * Y_total_points[i]);
        }
    };
};

var wiiboardSession = new p5(wiiboardSketch, 'c1');
