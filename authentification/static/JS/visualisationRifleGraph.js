/**
 * @fileoverview Manages post-training interface for orientation visualisation (rifle).
 * @author Lucas Pichon
 */

let colorBackground;

let sliderSensitivity;

let sliderPlay;

/**
 * @brief Main sketch for rifle visualization using p5.js.
 * @type {p5}
 */
var rifleSketch = function(p) 
{
    let widthCanvas;
    let heightCanvas;
    let xCanvas;
    let yCanvas;

    let shape; // 3D model

    let quat = new toxi.geom.Quaternion(1, 0, 0, 0); // Quaternion for orientation
    let r, v; // Rotation angle and axis
    let rotationMatrix; // Rotation matrix

    var cheminOBJ = document.getElementById('model3D').getAttribute('data'); // Path to 3D model

    let options = {
        normalize: true,
        successCallback: handleModel,
        failureCallback: handleError,
        fileType: '.obj'
    };

    var SIZE; // Size of the coordinate systems

    // Points for drawing coordinate axes
    let point_top;
    let point_bottom;
    let point_front; 
    let point_back; 
    let point_left; 
    let point_right; 

    // Toggle variables for displaying coordinate axes and rifle model
    let enableYaw = true;
    let enablePitch = true;
    let enableRoll = true;
    let enableRifle = false;

    colorBackground = p.color(0);
    colorBackground.setAlpha(50);

    let buttonWidth;
    let buttonHeight;
    let fontSize;

    // Mode and control variables for playback
    var mode = 0;
    var firstTime = true;
    var momentShot = true;

    /**
     * @brief Preloads the 3D model.
     */
    function preload()  
    {
        shape = p.loadModel(cheminOBJ, options);
    }

    /**
     * @brief Callback function when the model is successfully loaded.
     */
    function handleModel()
    {
        console.log("model loaded");
    }

    /**
     * @brief Callback function when there is an error loading the model.
     */
    function handleError()
    {
        console.log("fail to load the model");
    }

    /**
     * @brief Waits until script1 is ready before proceeding.
     */
    function waitForScript1() 
    {
        if (window.script1Ready) 
        {
            console.log("Je suis pret Rifle")
        } 
        else 
        {
            setTimeout(waitForScript1, 50); 
        }
    }
    
    /**
     * @brief Sets up the initial environment and elements.
     */
    p.setup = function() 
    {
        preload()
        waitForScript1();
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = (window.innerHeight - 100)*0.5;
        xCanvas = window.innerWidth/2;
        yCanvas = 100;
        SIZE = 0.2 * widthCanvas;

        buttonHeight = 0.08 * heightCanvas;
        fontSize = buttonHeight * 0.3;

        // Create WebGL canvas
        canvasRifleVisu = p.createCanvas(widthCanvas, heightCanvas, p.WEBGL);
        canvasRifleVisu.parent('container');
        canvasRifleVisu.position(xCanvas, yCanvas);
        cam = p.createCamera();

        p.lights();

        // Define points for coordinate axes
        point_top = p.createVector(0,-SIZE,0);
        point_bottom = p.createVector(0,SIZE,0);
        point_front = p.createVector(0,0,-SIZE);
        point_back = p.createVector(0,0,SIZE);
        point_left = p.createVector(-SIZE,0,0);
        point_right = p.createVector(SIZE,0,0);

        // Initialize interactive buttons and sliders
        initButtons();
        resetRotationsMouse();

        window.visualisationRifleGraph = true;
    }

    /**
     * @brief Initializes interactive buttons and sliders.
     */
    function initButtons()
    {
        initResetRotationsButton();
        initDrawPitchButton();
        initDrawYawButton();
        initDrawRollButton();
        initRifleButton();
        initPlayButton();
        initTargetButton();
        initPlaySlider();
    }

    /**
     * @brief Initializes the button to reset rotations.
     */
    function initResetRotationsButton()
    {
        resetButton = p.createButton('Reset rotations');
        resetButton.mousePressed(resetRotationsMouse);
        resetButton.class('oval-button');
        resetButton.parent('container');
        resetButton.position(xCanvas + widthCanvas*0.65,yCanvas + heightCanvas * 0.03);
        resetButton.style('font-size', `${fontSize}px`); 
    }
    
    /**
     * @brief Initializes the slider for controlling playback.
     */
    function initPlaySlider()
    {
        sliderPlay = p.createSlider(0, q0.length - 1, 0);
        sliderPlay.parent('container');
        var sliderSize =  0.25 *  widthCanvas;
        sliderPlay.style('width', `${sliderSize}px`);
        sliderPlay.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.95 );
    }

    /**
     * @brief Initializes the play/pause button.
     */
    function initPlayButton()
    {
        playButton = p.createButton('');
        playButton.mousePressed(() => {mode = !mode;});
        playButton.class('oval-button');
        playButton.parent('container');
        playButton.position(xCanvas + widthCanvas*0.04, yCanvas + heightCanvas * 0.84);
        playButton.size(40, 40);
        playButton.style('font-size', `17px`); 
        playButton.style('display', 'flex');
        playButton.style('align-items', 'center');
        playButton.style('justify-content', 'center');

        textDiv = p.createDiv('▶');
        textDiv.parent(playButton);
        textDiv.style('font-size', '23px');
        textDiv.style('position', 'relative');
        textDiv.style('top', '-2px'); 
        textDiv.style('left', '2px'); 
    }

    /**
     * @brief Initializes the button to set playback to a specific frame.
     */
    function initTargetButton()
    {
        targetButton = p.createButton('');
        targetButton.mousePressed(() => {sliderPlay.value(q0.length/2 - 1);});
        targetButton.class('oval-button');
        targetButton.parent('container');
        targetButton.position(xCanvas + widthCanvas*0.17, yCanvas + heightCanvas * 0.84);
        targetButton.size(40, 40);
        targetButton.style('font-size', `17px`); 
        targetButton.style('display', 'flex');
        targetButton.style('align-items', 'center');
        targetButton.style('justify-content', 'center')

        textDivTarget = p.createDiv('⌖');
        textDivTarget.parent(targetButton);
        textDivTarget.style('font-size', '50px');
        textDivTarget.style('position', 'relative');
        textDivTarget.style('top', '-1px'); 
        textDivTarget.style('left', '0px'); 
    }

    /**
     * @brief Initializes the checkbox to toggle display of yaw axis.
     */
    function initDrawYawButton()
    {
        yawCheckbox = p.createCheckbox('Display red axis', true);
        yawCheckbox.changed(() => {enableYaw = !enableYaw;});
        yawCheckbox.parent('container');
        yawCheckbox.position(xCanvas + widthCanvas*0.03,yCanvas + heightCanvas * 0.03);
    }

    /**
     * @brief Initializes the checkbox to toggle display of pitch axis.
     */
    function initDrawPitchButton()
    {
        pitchCheckbox = p.createCheckbox('Display blue axis', true);
        pitchCheckbox.changed(() => {enablePitch = !enablePitch;});
        pitchCheckbox.parent('container');
        pitchCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.07);
    }

    /**
     * @brief Initializes the checkbox to toggle display of roll axis.
     */
    function initDrawRollButton()
    {
        rollCheckbox = p.createCheckbox('Display green axis', true);
        rollCheckbox.changed(() => {enableRoll = !enableRoll;});
        rollCheckbox.parent('container');
        rollCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.11);
    }

    /**
     * @brief Initializes the checkbox to toggle display of the rifle model.
     */
    function initRifleButton()
    {
        rifleCheckbox = p.createCheckbox('Display rifle', false);
        rifleCheckbox.changed(() => {enableRifle = !enableRifle;});
        rifleCheckbox.parent('container');
        rifleCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.15);
    }
   
    /**
     * @brief Main draw function that is called continuously.
     */
    p.draw = function() 
    {
        p.background(colorBackground);

        if (p.mouseY < heightCanvas*0.8)
        {
            p.orbitControl();
        }

        handlePlayButton(); //Handle the browse of data
        
        p.push()
        drawCoordinatesSystem(); // Draw absolu coordinate system

        p.push();
        displayRifle();          // Display rifle if enabled
        drawCoordinatesSystem(); // Draw relative coordinate system
        p.pop();

        drawGaps(); // Draw gaps between axes                

        p.pop()
    }

    /**
     * @brief Draws coordinate axes based on toggle settings.
     */
    function drawCoordinatesSystem()
    {
        if(enablePitch)
        { 
            drawPitch();
        }

        if(enableRoll)
        {
            drawRoll();
        }

        if(enableYaw)
        {
            drawYaw();
        }
    }

    /**
     * @brief Draws gaps between rotated and original axes based on toggle settings.
     */
    function drawGaps()
    {
        if(v)
        {
            calculMatrixRotation(r, v);
            p.noStroke();

            if(enablePitch)
            {
                drawGapPitch();
            }

            if(enableRoll)
            {
                drawGapRoll();
            }

            if(enableYaw)
            {
                drawGapYaw();
            }
        }
    }

    /**
     * @brief Displays the rifle model if enabled.
     */
    function displayRifle()
    {
        if(window.script1Ready)
        {
            var ind = sliderPlay.value();
            quat.set(q0[ind], q1[ind] ,q2[ind], q3[ind]);
            normalizeQuaternion(quat);
            let axis = quat.toAxisAngle();
            r = axis[0] * sliderSensitivityValue;
            v = p.createVector(-axis[1], axis[3], axis[2]);

            p.rotate(r,v);

            if(enableRifle)
            {
                p.push();
                p.rotateX(p.radians(90));
                p.rotateZ(p.radians(-90));

                let c = p.color(0);
                c.setAlpha(100);
                p.stroke(c);
                p.model(shape);
                p.pop();
            }
        }
    }

    /**
     * @brief Draws the yaw axis (red).
     */
    function drawYaw()
    {
        p.stroke(255,0,0);
        p.line(point_top.x, point_top.y, point_top.z, point_bottom.x, point_bottom.y, point_bottom.z);
    }

    /**
     * @brief Draws the roll axis (green).
     */
    function drawRoll()
    {
        p.stroke(0,255,0);
        p.line(point_front.x, point_front.y, point_front.z, point_back.x, point_back.y, point_back.z);
    }

    /**
     * @brief Draws the pitch axis (blue).
     */
    function drawPitch()
    {
        p.stroke(0,0,255);
        p.line(point_left.x, point_left.y, point_left.z, point_right.x, point_right.y, point_right.z);
    }

    /**
     * @brief Draws the gap in the yaw axis after rotation.
     */
    function drawGapYaw()
    {
        let point_top_rotated = rotatePoint(point_top);
        let point_bottom_rotated = rotatePoint(point_bottom);

        p.fill(255,0,0,50);
        drawTriangle(point_top.x, point_top.y, point_top.z, point_top_rotated.x, point_top_rotated.y, point_top_rotated.z, 0, 0, 0);
        drawTriangle(point_bottom.x, point_bottom.y, point_bottom.z, point_bottom_rotated.x, point_bottom_rotated.y, point_bottom_rotated.z, 0, 0, 0);
    }

    /**
     * @brief Draws the gap in the roll axis after rotation.
     */
    function drawGapRoll()
    {
        let point_front_rotated = rotatePoint(point_front);
        let point_back_rotated = rotatePoint(point_back);

        p.fill(0,255,0,50);
        drawTriangle(point_front.x, point_front.y, point_front.z,point_front_rotated.x, point_front_rotated.y, point_front_rotated.z, 0, 0 , 0);
        drawTriangle(point_back.x, point_back.y, point_back.z, point_back_rotated.x, point_back_rotated.y, point_back_rotated.z, 0, 0, 0);
    }

    /**
     * @brief Draws the gap in the pitch axis after rotation.
     */
    function drawGapPitch()
    {
        let point_left_rotated = rotatePoint(point_left);
        let point_right_rotated = rotatePoint(point_right);

        p.fill(0,0,255,50);
        drawTriangle(point_left.x, point_left.y, point_left.z, point_left_rotated.x, point_left_rotated.y, point_left_rotated.z, 0, 0 , 0);
        drawTriangle(point_right.x, point_right.y, point_right.z, point_right_rotated.x, point_right_rotated.y, point_right_rotated.z, 0, 0 , 0);
    }

    /**
     * @brief Draws a triangle using specified vertices.
     */
    function drawTriangle(x1, y1, z1, x2, y2, z2, x3, y3, z3)
    {
        p.beginShape();
        p.vertex(x1, y1, z1);
        p.vertex(x2, y2, z2);
        p.vertex(x3, y3, z3);
        p.endShape(p.CLOSE);
    }

    /**
     * @brief Calculates the rotation matrix for a given angle and axis.
     * @param {number} angle - Rotation angle in radians.
     * @param {p5.Vector} axis - Rotation axis as a vector.
     */
    function calculMatrixRotation(angle, axis)
    {
        let cosTheta = p.cos(angle);
        let sinTheta = p.sin(angle);

        rotationMatrix = [
            cosTheta + (1 - cosTheta) * axis.x * axis.x,
            (1 - cosTheta) * axis.x * axis.y - sinTheta * axis.z,   
            (1 - cosTheta) * axis.x * axis.z + sinTheta * axis.y,

            (1 - cosTheta) * axis.x * axis.y + sinTheta * axis.z,
            cosTheta + (1 - cosTheta) * axis.y * axis.y,
            (1 - cosTheta) * axis.y * axis.z - sinTheta * axis.x,

            (1 - cosTheta) * axis.x * axis.z - sinTheta * axis.y,
            (1 - cosTheta) * axis.y * axis.z + sinTheta * axis.x,
            cosTheta + (1 - cosTheta) * axis.z * axis.z
        ];
    }

    /**
     * @brief Normalizes a quaternion to ensure its magnitude is 1.
     * @param {p5.Vector} q - Quaternion to normalize.
     */
    function normalizeQuaternion(q) 
    {
        let magnitudeSquared = q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z;
        if (magnitudeSquared > 1) 
        {
            let inverseMagnitude = 1 / Math.sqrt(magnitudeSquared);
            q.w *= inverseMagnitude;
            q.x *= inverseMagnitude;
            q.y *= inverseMagnitude;
            q.z *= inverseMagnitude;
        }
        if(magnitudeSquared == 1)
        {
            q.z = q.z + 0.000001;
        }
    }

    /**
     * @brief Rotates a point using the current rotation matrix.
     * @param {p5.Vector} point - Point to rotate.
     * @returns {p5.Vector} - Rotated point.
     */
    function rotatePoint(point) 
    {
        let x_rotated = rotationMatrix[0] * point.x + rotationMatrix[1] * point.y + rotationMatrix[2] * point.z;
        let y_rotated = rotationMatrix[3] * point.x + rotationMatrix[4] * point.y + rotationMatrix[5] * point.z;
        let z_rotated = rotationMatrix[6] * point.x + rotationMatrix[7] * point.y + rotationMatrix[8] * point.z;

        return p.createVector(x_rotated, y_rotated, z_rotated);
    }

    /**
     * @brief Handles play/pause button functionality.
     */
    function handlePlayButton()
    {
        if(mode == 0)
        {
            textDiv.style('font-size', '23px');
            textDiv.style('position', 'relative');
            textDiv.style('top', '-2px'); 
            textDiv.style('left', '2px'); 
            textDiv.html('▶');

            if(momentShot)
            {
                sliderPlay.value(q0.length/2 - 1);
                momentShot = false;
            }
        }
        else
        {
            textDiv.html('▐▐');
            textDiv.style('font-size', '17px');
            textDiv.style('position', 'relative');
            textDiv.style('top', '0px'); 
            textDiv.style('left', '-3px'); 
            if(firstTime)
            {
                sliderPlay.value(0);
                firstTime = false;
            }
            else
            {
                sliderPlay.value((sliderPlay.value() + 1) % q0.length);
            }
        }
    }

    /**
     * @brief Resets camera position and matrix.
     */
    function resetRotationsMouse()
    {
        p.resetMatrix();
        p.camera(0, 0, (p.height/2) / p.tan(p.PI/6), 0, 0, 0, 0, 1, 0);
    }

    /**
     * @brief Handles window resize event.
     */
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = (window.innerHeight - 100)*0.5;
        xCanvas = window.innerWidth/2;
        yCanvas = 100;

        SIZE = 0.2 * widthCanvas;
        point_top = p.createVector(0,-SIZE,0);
        point_bottom = p.createVector(0,SIZE,0);
        point_front = p.createVector(0,0,-SIZE);
        point_back = p.createVector(0,0,SIZE);
        point_left = p.createVector(-SIZE,0,0);
        point_right = p.createVector(SIZE,0,0);

        resetButton.position(xCanvas + widthCanvas*0.65,yCanvas + heightCanvas * 0.03);
        yawCheckbox.position(xCanvas + widthCanvas*0.03,yCanvas + heightCanvas * 0.03);
        pitchCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.07);
        rollCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.11);
        rifleCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.15);

        p.resizeCanvas(widthCanvas, heightCanvas);
        canvasRifleVisu.position(xCanvas, yCanvas);

        buttonHeight = 0.08 * heightCanvas;
        fontSize = buttonHeight * 0.3;
        resetButton.style('font-size', `${fontSize}px`); 

        targetButton.position(xCanvas + widthCanvas*0.17, yCanvas + heightCanvas * 0.84);
        playButton.position(xCanvas + widthCanvas*0.04, yCanvas + heightCanvas * 0.84);
        
        var sliderSize =  0.25 *  widthCanvas;
        sliderPlay.style('width', `${sliderSize}px`);
        sliderPlay.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.95 );
    }
};

var rifle = new p5(rifleSketch,'c1');