//main .js file for assignment 2 blocky animal
`
Link: https://people.ucsc.edu/~roesilve/CSE160/3dExample/asg2.html
grading_notes: search for keyword "grading_notes" for inline comments
overall this is a 3D rendering of Github's Octocat. I kept the shapes pretty basic and tried to focus on the rotating 
joints as well as the overall project structure, mouse input, and transparent bubble environment. Hope you enjoy!
`


//--------------------------------------------------------//

//grading_note: global variable for points objects array
var g_shapesList = [];
var g_normOn = false;

let g_cam = new Camera();

var g_start = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_start;

//switch variable for efficiency test mode
var g_efficencyTest = 0;

//-----------------------------------------------//
function main() {
    //in file webGLInit.js
    setupWebGL();
    connectVariablesToGLSL();
    //setup environment
    inputUI();
    //in shapesBuilder.js
    //initialize shape variables
    initShapes();
    defShapes();
    //set initial global rotation
    setAngle();
    //set view matrix
    setView();
    //set projection matrix
    setPro();
    renderScene();
    //animation
    tick();
}

//--------------------------------------------//
//grading note: used to be named renderAllShapes, now it's named renderScene
function renderScene(){
    var renderStart = performance.now();
    //actual rendering logic
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //color
    var len = g_shapesList.length;
    //determine what to draw
    for(var i = 0; i<len; i+=1){
        g_shapesList[i].render();
    }
    var renderTime = performance.now() - renderStart;

    var dispString = `milliseconds: ${Math.floor(renderTime)}, fps: ${Math.floor(1000/renderTime)}`;
    //console.log(`milliseconds: ${Math.floor(renderTime)}, fps: ${Math.floor(1000/renderTime)}`);
    sendTextToHTML(dispString, 'perform');

}

//todo: still need this? we could add defShapes, renderSCene to onKeyDown event to reanimate movement...
//skeleton code for animation tick()
function tick(){
    g_seconds = performance.now()/1000.0-g_start;
    defShapes();
    setLight();
    renderScene();
    requestAnimationFrame(tick);

}


//--------------handle UI input-----------------------//
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("failed to get ", htmlID);
        return;
    }
    htmlElm.innerText = text;
}

function inputUI(){
    //keydown: in Camera.js
    document.onkeydown = function(ev) {
        keydown(ev);
    };

    document.getElementById("LightOn").onclick = function(){gl.uniform1i(u_LightOn, 1);};
    document.getElementById("LightOff").onclick = function(){gl.uniform1i(u_LightOn, 0);};
    document.getElementById("normOn").onclick = function(){g_normOn = true;};
    document.getElementById("normOff").onclick = function(){g_normOn = false;};
    document.getElementById("normColOn").onclick = function(){gl.uniform1i(u_NormCols, 1);};
    document.getElementById("normColOff").onclick = function(){gl.uniform1i(u_NormCols, 0);};
    document.getElementById("effTest").onclick = function(){
        if(g_efficencyTest == 0){
            g_efficencyTest = 1;
        }else{
            g_efficencyTest = 0;
        }
    }

    //https://www.homeandlearn.co.uk/javascript/html5_canvas_mouse_events.html
    //mouse movements for view movement
    canvas.onmousemove = function(ev){mouseMove(ev);};

}



//----------------------------------------------------//
//grading_note: set angle, view and projection matrices
//--------handle camera angle with clicks-----------------//

//global variables for rotation
//update angle from slider change or mousemove
function setAngle(){
    //rotation angle about set axis by global degrees
    var rotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotation, false, rotMat.elements);
}

//update view matrix
function setView(){
    let g_viewMat = new Matrix4();
    g_viewMat.setLookAt(g_cam.eye.elements[0], g_cam.eye.elements[1], g_cam.eye.elements[2], g_cam.at.elements[0], g_cam.at.elements[1], g_cam.at.elements[2], g_cam.up.elements[0], g_cam.up.elements[1], g_cam.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_viewMat.elements);
}

//grading note: this is the camera sphere
let g_LightTheta = 0.0;
function setLight(){
    //sun-like sphere rotating around world
    let lightCube = new Sphere();
    //init with invalid texture number to force default coloring
    lightCube.textureNum = -2;
    //radius: how big of a circle drawn (for light rotation path)
    let radius = 30.0;
    //use constantly updated theta and sin/cos to rotate light
    let newX = radius*Math.cos(g_LightTheta*180/Math.PI);
    let newY = radius*Math.sin(g_LightTheta*180/Math.PI);
    lightCube.matrix.translate(newX, 10.0, newY);
    //update light position in shader
    gl.uniform3f(u_LightPosition, newX, 10.0, newY);
    // g_LightTheta = (g_LightTheta + .0005) % 360;
    g_LightTheta = (g_LightTheta + .0002) % 360;
    lightCube.matrix.scale(.6, .6, .6);
    //push light sphere
    g_shapesList.push(lightCube);
}

function setPro(){
    let projMat = new Matrix4();
    projMat.setPerspective(90, -canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMat.elements);
}



//-----------------------------------------------//

//This space intentionally left blank

//-----------------------------------------------//