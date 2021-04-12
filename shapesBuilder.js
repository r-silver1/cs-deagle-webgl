//--------------------------------------------------------//
//grading note: shapesBuilder.js: logic for defining, updating and storing shapes
//--------------------------------------------------------//
//global floor
let g_floor;

//global ceiling
let g_ceiling;

//global wall variables
let g_lWall1;
let g_lWall2;
let g_lWall3;

let g_rWall1;
let g_rWall2;
let g_rWall3;

let g_bWall1;
let g_bWall2;
let g_bWall3;
let g_fWall2;

let g_fWall1;
let g_fWall3;

// let g_map = g_checker;
let g_map = retBoard(20);
let g_cubeMap = CS_deagleTopo;



//initialize shapes seperately from define/update/render
function initShapes(){
    g_floor = new Cube();
    g_ceiling = new Cube();

    g_lWall1 = new Cube();
    g_lWall2 = new Cube();
    g_lWall3 = new Cube();

    g_rWall1 = new Cube();
    g_rWall2 = new Cube();
    g_rWall3 = new Cube();

    g_bWall1 = new Cube();
    g_bWall2 = new Cube();
    g_bWall3 = new Cube();

    g_fWall1 = new Cube();
    g_fWall2 = new Cube();
    g_fWall3 = new Cube();

}


//---------- handle shapes and rendering -----------------//
function defShapes(){
    //reinitialize global shapes list storage
    g_shapesList = [];

    if(!g_efficencyTest){
        //draw floor ceiling and walls
        drawWorld();
        //draw all the wood crates for level in map
        drawLevel();
        //draw sphere, cone, twist and cube on corners of level
        drawTestShapes();
    }else {
        //if efficiency test, draw 20x20 grid of random shapes (think this is over 2million triangles depending on random shape count)
        drawMap();
    }

}

function drawWorld(){
    drawFloor();
    drawCeiling();
    drawWalls();
}

function drawTestShapes(){

    let testCube1 = new Cube();
    //colors: hardcoded in to static definitions of shapes, didn't need multiple colors for this program so optimizing efficiency making color not dynamic. could easily make just color dynamic
    testCube1.color = [1, 0, 0, 1];
    //base locations off of copying floor locations
    copCoord(testCube1, g_floor);
    testCube1.matrix.translate(g_floor.w/3,2, g_floor.w/3);
    g_shapesList.push(testCube1);

    let testCone1 = new roundCone();
    testCone1.color = [0, 0, 1, 1];
    copCoord(testCone1, g_floor);
    testCone1.matrix.translate(-g_floor.w/3,2, g_floor.w/3);
    g_shapesList.push(testCone1);

    let testSphere1 = new Sphere();
    testSphere1.color = [0, 1, 0, 1];
    copCoord(testSphere1, g_floor);
    testSphere1.matrix.translate(-g_floor.w/3,2, -g_floor.w/3);
    g_shapesList.push(testSphere1);

    let testTwist1 = new Twist();
    testTwist1.color = [0,1, 1, 1];
    copCoord(testTwist1, g_floor);
    testTwist1.matrix.translate(g_floor.w/3,2, -g_floor.w/3);
    g_shapesList.push(testTwist1);
}

//grading_note: I predeclared all of the walls and floors because they're never going to change location, so calling new() every frame is a waste of runtime
function drawFloor(){
    g_floor.matrix.setIdentity();
    let scales = [36, .01, 36];
    g_floor.w = scales[0];
    g_floor.h = scales[1];
    g_floor.d = scales[2];
    g_floor.cacheCoords();
    //grading_note: cacheCoords: cache coordinate matrix before rotate/scale (or when most convenient)
    g_floor.matrix.scale(scales[0], scales[1], scales[2]);
    //toggle on and off texture floor
    g_floor.textureNum = 1;
    // g_floor.textureNum = -1;
    g_shapesList.push(g_floor);
}

function drawCeiling(){
    g_ceiling.matrix.setIdentity();
    let scales = [36, .01, 36];
    g_ceiling.w = scales[0];
    g_ceiling.h = scales[1];
    g_ceiling.d = scales[2];
    g_ceiling.matrix.translate(0,15,0);
    g_ceiling.cacheCoords();
    //grading_note: cacheCoords: cache coordinate matrix before rotate/scale (or when most convenient)
    g_ceiling.matrix.scale(scales[0], scales[1], scales[2]);
    g_ceiling.textureNum = 3;
    g_shapesList.push(g_ceiling);
}


function drawWalls(){
    g_lWall1.matrix.setIdentity();
    copCoord(g_lWall1, g_floor);
    let scales = [.25, g_floor.w/5.0, g_floor.d/3.0,];
    g_lWall1.w = scales[0];
    g_lWall1.h = scales[1];
    g_lWall1.d = scales[2];
    g_lWall1.matrix.scale(scales[0], scales[1], scales[2]);
    g_lWall1.matrix.translate(-2.0*g_floor.w, .5, 1);
    g_lWall1.cacheCoords();
    g_lWall1.textureNum = 2;
    g_shapesList.push(g_lWall1);

    g_lWall2.matrix.setIdentity();
    copCoord(g_lWall2, g_lWall1);
    g_lWall2.matrix.translate(0,0, -1.0);
    g_lWall2.cacheCoords();
    g_lWall2.textureNum = 2;
    g_shapesList.push(g_lWall2);

    g_lWall3.matrix.setIdentity();
    copCoord(g_lWall3, g_lWall2);
    g_lWall3.matrix.translate(0,0, -1.0);
    g_lWall3.cacheCoords();
    g_lWall3.textureNum = 2;
    g_shapesList.push(g_lWall3);

    //nudge wall
    let wallFix = 1.0;
    g_rWall1.matrix.setIdentity();
    copCoord(g_rWall1, g_lWall1);
    g_rWall1.matrix.translate((4*g_floor.w), 0, 0);
    g_rWall1.textureNum = 2;
    g_shapesList.push(g_rWall1);

    g_rWall2.matrix.setIdentity();
    copCoord(g_rWall2, g_lWall2);
    g_rWall2.matrix.translate((4*g_floor.w), 0, 0);
    g_rWall2.textureNum = 2;
    g_shapesList.push(g_rWall2);

    g_rWall3.matrix.setIdentity();
    copCoord(g_rWall3, g_lWall3);
    g_rWall3.matrix.translate((4*g_floor.w), 0, 0);
    g_rWall3.textureNum = 2;
    g_shapesList.push(g_rWall3);

    //back walls
    g_bWall1.matrix.setIdentity();
    copCoord(g_bWall1, g_floor);
    g_bWall1.w = scales[2];
    g_bWall1.h = scales[1];
    g_bWall1.d = scales[0];
    g_bWall1.matrix.scale(scales[2], scales[1], scales[0]);
    g_bWall1.matrix.translate(1, .5, -2.00*g_floor.w);
    g_bWall1.cacheCoords();
    g_bWall1.textureNum = 2;
    g_shapesList.push(g_bWall1);

    g_bWall2.matrix.setIdentity();
    copCoord(g_bWall2, g_bWall1);
    g_bWall2.matrix.translate(-1.0,0, 0);
    g_bWall2.cacheCoords();
    g_bWall2.textureNum = 2;
    g_bWall2.cacheCoords();
    g_shapesList.push(g_bWall2);

    g_bWall3.matrix.setIdentity();
    copCoord(g_bWall3, g_bWall2);
    g_bWall3.matrix.translate(-1.0,0, 0);
    g_bWall3.cacheCoords();
    g_bWall3.textureNum = 2;
    g_bWall3.cacheCoords();
    g_shapesList.push(g_bWall3);

    //front walls
    g_fWall1.matrix.setIdentity();
    copCoord(g_fWall1, g_bWall1);
    g_fWall1.matrix.translate(0, 0, 4*g_floor.w);
    g_fWall1.textureNum = 2;
    g_shapesList.push(g_fWall1);

    g_fWall2.matrix.setIdentity();
    copCoord(g_fWall2, g_bWall2);
    g_fWall2.matrix.translate(0, 0, 4*g_floor.w);
    g_fWall2.textureNum = 2;
    g_shapesList.push(g_fWall2);

    g_fWall3.matrix.setIdentity();
    copCoord(g_fWall3, g_bWall3);
    g_fWall3.matrix.translate(0, 0, 4*g_floor.w);
    g_fWall3.textureNum = 2;
    g_shapesList.push(g_fWall3);

}



function drawMap(){
    //inc: how many units translate relative to loop variable increment
    let inc = 2.0;
    //nudging shape grid to fit within walls and ceiling
    let nudge = -20.0;
    function nudgeMapObj(obj){
        obj.matrix.setIdentity();
        obj.matrix.translate(nudge + (i*inc), 0, -nudge-(j*inc));
        //box texture
        obj.textureNum = -1;
        g_shapesList.push(obj);
    }

    //for loop: draw map, length is defined at g_map using retBoard(); (default 20)
    for(var i = 0; i < g_map.length; i+=1){
        for(var j = 0; j < g_map.length; j+=1){
            //randomly choose a shape
            let varRan = Math.round(Math.random() * 4.0);
            let coordCube;
            switch(g_map[i][j]) {
                case 0:
                    coordCube = new Sphere();
                    nudgeMapObj(coordCube);
                    break;
                case 1:
                    coordCube = new Cube();
                    nudgeMapObj(coordCube);
                    break;
                case 2:
                    coordCube = new Twist();
                    nudgeMapObj(coordCube);
                    break;
                case 3:
                    coordCube = new roundCone();
                    nudgeMapObj(coordCube);
                    g_shapesList.push(coordCube);
                    break;
            }
        }
    }
}

function drawLevel(){
    let inc = 1.0;
    let nudge = -9.0;
    for(var i = 0; i < g_map.length; i+=1){
        for(var j = 0; j < g_map.length; j+=1){
            for(var k = 0; k<g_map[i][j]; k+=1){
                let coordCube = new Cube();
                coordCube.matrix.setIdentity();
                //snap to corner of floor
                copCoord(coordCube, g_floor);
                //translate per coordinate locale and height level
                coordCube.matrix.translate(nudge + (i*inc), .5+parseFloat(k), -nudge-(j*inc));
                //toggle on and off texture
                coordCube.cacheCoords();
                //box texture
                coordCube.textureNum = 0;
                g_shapesList.push(coordCube);
            }
        }
    }
}

//todo: move into cube class?
function copCoord(obNew, obOld){
    obNew.matrix.setIdentity();
    obNew.matrix.multiply(obOld.coordMat);
    obNew.w = obOld.w;
    obNew.h = obOld.h;
    obNew.d = obOld.d;
}
//--------------------------------------------------------//
