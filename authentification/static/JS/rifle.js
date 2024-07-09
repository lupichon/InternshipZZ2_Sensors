/**
 * @fileoverview This file manages the real-time interface for orientation visualization (coordinate systems).
 * @author Lucas Pichon
 */

let colorBackground;

let sliderSensitivity;

// P5.js sketch definition for the rifle visualization
var rifleSketch = function(p) 
{
    // Variables for canvas dimensions and positions
    let widthCanvas;
    let heightCanvas;
    let xCanvas;
    let yCanvas;

    let shape; // 3D model 

    let quat = new toxi.geom.Quaternion(1, 0, 0, 0); // Quaternion for variable
    let r, v; // Rotation angle and axis vector
    let rotationMatrix; // Rotation matrix for transformations

    // OBJ file path and loading options
    var cheminOBJ = document.getElementById('model3D').getAttribute('data');
    let options = {
        normalize: true,
        successCallback: handleModel,
        failureCallback: handleError,
        fileType: '.obj'
    };

    var SIZE; // Size of the coordinate systems

    // Points to draw the coordinate systems
    let point_top;
    let point_bottom;
    let point_front; 
    let point_back; 
    let point_left; 
    let point_right; 

    // Checkbox flags for displaying axes and rifle model
    let enableYaw = true;
    let enablePitch = true;
    let enableRoll = true;
    let enableRifle = false;

    colorBackground = p.color(0);
    colorBackground.setAlpha(50);

    // Preload function to load the 3D model
    function preload()  
    {
        shape = p.loadModel(cheminOBJ, options);
    }

    // Callback function when model is successfully loaded
    function handleModel()
    {
        console.log("model loaded");
    }

    // Callback function when model loading fails
    function handleError()
    {
        console.log("fail to load the model");
    }

    // Setup function for P5.js sketch
    p.setup = function() 
    {
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = (window.innerHeight*0.5 - 50);
        xCanvas = window.innerWidth/2;
        yCanvas = 100;
        SIZE = 0.17 * widthCanvas;

        preload() // Load the 3D model (rifle)

        // Create P5.js canvas and position it
        canvasRifle = p.createCanvas(widthCanvas, heightCanvas, p.WEBGL);
        canvasRifle.parent('container');
        canvasRifle.position(xCanvas, yCanvas);
        cam = p.createCamera();

        p.lights();

        // Define points for the coordinate systems
        point_top = p.createVector(0,-SIZE,0);
        point_bottom = p.createVector(0,SIZE,0);
        point_front = p.createVector(0,0,-SIZE);
        point_back = p.createVector(0,0,SIZE);
        point_left = p.createVector(-SIZE,0,0);
        point_right = p.createVector(SIZE,0,0);

        initButtons(); // Initialize interactive buttons and sliders

        resetRotationsMouse(); // Reset rotation angles
    }

    // Initialize interactive buttons and checkboxes
    function initButtons() 
    {
        initResetRotationsButton();     // Button to reset rotations
        initDrawPitchButton();          // Checkbox to toggle pitch axis
        initDrawYawButton();            // Checkbox to toggle yaw axis
        initDrawRollButton();           // Checkbox to toggle roll axis
        initRifleButton();              // Checkbox to toggle rifle model visibility
        initSensitivitySlider();        // Slider to adjust sensitivity
    }

    // Initialize button to reset rotations
    function initResetRotationsButton()
    {
        resetButton = p.createButton('Reset rotations');
        resetButton.mousePressed(resetRotationsMouse);
        resetButton.class('oval-button');
        resetButton.parent('container');
        resetButton.position(xCanvas + widthCanvas*0.65,yCanvas + heightCanvas * 0.03);
    }
    
    // Initialize checkbox to toggle yaw axis
    function initDrawYawButton()
    {
        yawCheckbox = p.createCheckbox('Display red axis', true);
        yawCheckbox.changed(() => {enableYaw = !enableYaw;});
        yawCheckbox.parent('container');
        yawCheckbox.position(xCanvas + widthCanvas*0.03,yCanvas + heightCanvas * 0.03);
    }

    // Initialize checkbox to toggle pitch axis
    function initDrawPitchButton()
    {
        pitchCheckbox = p.createCheckbox('Display blue axis', true);
        pitchCheckbox.changed(() => {enablePitch = !enablePitch;});
        pitchCheckbox.parent('container');
        pitchCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.07);
    }

    // Initialize checkbox to toggle roll axis
    function initDrawRollButton()
    {
        rollCheckbox = p.createCheckbox('Display green axis', true);
        rollCheckbox.changed(() => {enableRoll = !enableRoll;});
        rollCheckbox.parent('container');
        rollCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.11);
    }

    // Initialize checkbox to toggle rifle model visibility
    function initRifleButton()
    {
        rifleCheckbox = p.createCheckbox('Display rifle', false);
        rifleCheckbox.changed(() => {enableRifle = !enableRifle;});
        rifleCheckbox.parent('container');
        rifleCheckbox.position(xCanvas + widthCanvas*0.03, yCanvas + heightCanvas * 0.15);
    }

    // Initialize slider to adjust sensitivity
    function initSensitivitySlider()
    {
        sliderSensitivity = p.createSlider(1, 20, 1, 1);
        sliderSensitivity.style('width', '200px');
        sliderSensitivity.parent('container');
        var sliderSize =  0.5 *  widthCanvas;
        sliderSensitivity.style('width', `${sliderSize}px`);
        sliderSensitivity.position(xCanvas + widthCanvas * 0.5 - sliderSize/2, yCanvas + heightCanvas * 0.9);
    }

    // Main draw function for P5.js sketch
    p.draw = function() 
    {
        p.background(colorBackground); // Set background color

        // Enable orbit control if mouse is within specific area
        if (p.mouseY< heightCanvas*0.8)
        {
            p.orbitControl();
        }

        p.push()
        drawCoordinatesSystem();    // Display the absolu coordinate system axes and rifle model

        p.push();
        displayRifle();             //Calcul rotations using quaternions and display rifle if available 
        drawCoordinatesSystem();    //Display the relative coordinate system
        p.pop();

        drawGaps();                 //Fill the gaps between the axes of the coordinate systems

        p.pop()
    }

    //Function to draw coordinate system axes 
    function drawCoordinatesSystem()
    {
        if(enablePitch)
        { 
            drawPitch(); //Draw blue axis
        }

        if(enableRoll)
        {
            drawRoll(); // Draw green axis
        }

        if(enableYaw)
        {
            drawYaw();  //Draw red axis
        }
    }

    // Function to draw gaps between the axes of the coordinate systems
    function drawGaps()
    {
        calculMatrixRotation(r, v); // Calculate rotation matrix
        p.noStroke();

        // Draw gaps if the axis is enabled
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

    // Function to display the 3D rifle model and calculate rotation
    function displayRifle()
    {
        quat.set(q0 - q0_ref, q1 - q1_ref, q2 - q2_ref, q3 - q3_ref); // Update quaternion with current rotation 
        normalizeQuaternion(quat);  // Normalize quaternion
        let axis = quat.toAxisAngle();  // Convert quaternion to axis 
        r = axis[0] * sliderSensitivity.value(); // Rotation angle
        v = p.createVector(-axis[1], axis[3], axis[2]); // Axis of rotation 

        p.rotate(r,v); // Apply rotation to p5.js environment

        //Display the rifle model if enabled
        if(enableRifle)
        {
            p.push();

            // Rotation to put the 3D object in a good orientation 
            p.rotateX(p.radians(90));   
            p.rotateZ(p.radians(-90));

            // Display rifle
            let c = p.color(0);
            c.setAlpha(100);
            p.stroke(c);
            p.model(shape);

            p.pop();
        }
    }

    // Function to draw red yaw axis
    function drawYaw()
    {
        p.stroke(255,0,0);
        p.line(point_top.x, point_top.y, point_top.z, point_bottom.x, point_bottom.y, point_bottom.z);
    }

    // Function to draw green rool axis
    function drawRoll()
    {
        p.stroke(0,255,0);
        p.line(point_front.x, point_front.y, point_front.z, point_back.x, point_back.y, point_back.z);
    }

    // Function to draw blue pitch axis
    function drawPitch()
    {
        p.stroke(0,0,255);
        p.line(point_left.x, point_left.y, point_left.z, point_right.x, point_right.y, point_right.z);
    }

    // Function to draw gap between the two yaw axis
    function drawGapYaw()
    {
        let point_top_rotated = rotatePoint(point_top);
        let point_bottom_rotated = rotatePoint(point_bottom);

        p.fill(255,0,0,50);
        drawTriangle(point_top.x, point_top.y, point_top.z, point_top_rotated.x, point_top_rotated.y, point_top_rotated.z, 0, 0, 0);
        drawTriangle(point_bottom.x, point_bottom.y, point_bottom.z, point_bottom_rotated.x, point_bottom_rotated.y, point_bottom_rotated.z, 0, 0, 0);
    }

    // Function to draw gap between the two roll axis
    function drawGapRoll()
    {
        let point_front_rotated = rotatePoint(point_front);
        let point_back_rotated = rotatePoint(point_back);

        p.fill(0,255,0,50);
        drawTriangle(point_front.x, point_front.y, point_front.z,point_front_rotated.x, point_front_rotated.y, point_front_rotated.z, 0, 0 , 0);
        drawTriangle(point_back.x, point_back.y, point_back.z, point_back_rotated.x, point_back_rotated.y, point_back_rotated.z, 0, 0, 0);
    }

    //Function to draw gap between the tewo pitch axis
    function drawGapPitch()
    {
        let point_left_rotated = rotatePoint(point_left);
        let point_right_rotated = rotatePoint(point_right);

        p.fill(0,0,255,50);
        drawTriangle(point_left.x, point_left.y, point_left.z, point_left_rotated.x, point_left_rotated.y, point_left_rotated.z, 0, 0 , 0);
        drawTriangle(point_right.x, point_right.y, point_right.z, point_right_rotated.x, point_right_rotated.y, point_right_rotated.z, 0, 0 , 0);
    }

    // Function to draw a triangle in 3D space
    function drawTriangle(x1, y1, z1, x2, y2, z2, x3, y3, z3)
    {
        p.beginShape();
        p.vertex(x1, y1, z1);
        p.vertex(x2, y2, z2);
        p.vertex(x3, y3, z3);
        p.endShape(p.CLOSE);
    }

    // Function to calculate rotation matrix from angle and axis
    function calculMatrixRotation(angle, axis)
    {
        let cosTheta = p.cos(angle);    //cosinus of rotation angle
        let sinTheta = p.sin(angle);    //sinus of rotation angle

        //define rotation matrix based on angle and axis 
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

    // Function to normalize quaternion 
    function normalizeQuaternion(q) 
    {
        let magnitudeSquared = q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z;

        //Normalize quaternion if magnitude is geater than 1
        if (magnitudeSquared > 1) 
        {
            let inverseMagnitude = 1 / Math.sqrt(magnitudeSquared);
            q.w *= inverseMagnitude;
            q.x *= inverseMagnitude;
            q.y *= inverseMagnitude;
            q.z *= inverseMagnitude;
        }

        // Problem if the quaternion's norm is equal to one with the rifle displaying
        if(magnitudeSquared == 1)
        {
            q.z = q.z + 0.000001;   // Add a small value to solve the problem
        }
    }

    // Function to rotate a point using rotation matrix
    function rotatePoint(point) 
    {
        let x_rotated = rotationMatrix[0] * point.x + rotationMatrix[1] * point.y + rotationMatrix[2] * point.z;
        let y_rotated = rotationMatrix[3] * point.x + rotationMatrix[4] * point.y + rotationMatrix[5] * point.z;
        let z_rotated = rotationMatrix[6] * point.x + rotationMatrix[7] * point.y + rotationMatrix[8] * point.z;

        return p.createVector(x_rotated, y_rotated, z_rotated); // Return rotated vector
    }

    // Function to reset the camera view 
    function resetRotationsMouse()
    {
        p.resetMatrix();
        p.camera(0, 0, (p.height/2) / p.tan(p.PI/6), 0, 0, 0, 0, 1, 0);
    }

    // Function to handle window resize event
    p.windowResized = function() 
    {
        widthCanvas = window.innerWidth*0.25;
        heightCanvas = (window.innerHeight*0.5 - 50);
        xCanvas = window.innerWidth/2;
        canvasRifle.position(xCanvas, yCanvas);

        SIZE = 0.17 * widthCanvas;
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
        
        var sliderSize =  0.5 *  widthCanvas;
        sliderSensitivity.style('width', `${sliderSize}px`);
        sliderSensitivity.position(xCanvas + widthCanvas * 0.5 - sliderSize/2, yCanvas + heightCanvas * 0.9);

        p.resizeCanvas(widthCanvas, heightCanvas);
    }
};

var rifle = new p5(rifleSketch,'c1');