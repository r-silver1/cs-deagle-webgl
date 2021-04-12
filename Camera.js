//--------------------------------------------------------//
//grading_note: putting camera in separate class as recommended by Professor Davis
//--------------------------------------------------------//

function updateSpot(){
    //grading_note: update spotlight location and direction... set behind viewer, but in eye direction. make it look like you're
    //holding a flashlight by setting theta of light cone really small in shader
    var viewDir = new Vector3();
    viewDir.set(g_cam.at);
    viewDir.sub(g_cam.eye);
    viewDir.normalize();
    viewDir.mul(10);
    var eyeCopy = new Vector3();
    eyeCopy.set(g_cam.eye);
    eyeCopy.sub(viewDir);
    // console.log(`viewDir: ${viewDir.elements}`);
    gl.uniform3f(u_SpotPosition, eyeCopy.elements[0], eyeCopy.elements[1], eyeCopy.elements[2]);
    gl.uniform3f(u_SpotDirection, g_cam.at.elements[0]-g_cam.eye.elements[0], g_cam.at.elements[1]-g_cam.eye.elements[1], g_cam.at.elements[2]-g_cam.eye.elements[2]);
}

function mouseMove(ev){

    if(ev.movementX > 0){
        g_cam.rRight();
    }else if(ev.movementX<0){
        g_cam.rLeft();
    }

    //todo: add inverted option?
    if(ev.movementY > 0){
        g_cam.rDown();
    }else if(ev.movementY <0){
        g_cam.rUp();
    }
    setView();
    setPro();
    updateSpot();

}

//handle keydown input
function keydown(ev){
    switch(ev.keyCode){
        case 87: //w
            g_cam.forward();
            break;
        case 83: //s
            g_cam.back();
            break;
        case 65: //a
            g_cam.left();
            break;
        case 68: //d
            g_cam.right();
            break;
        case 38: //up arrow
            g_cam.goUp();
            break;
        case 40: //down arrow
            g_cam.down();
            break;
        case 81: //q
            g_cam.rLeft();
            break;
        case 69: //e
            g_cam.rRight();
            break;
        case 84: //t
            g_cam.rUp();
            break;
        case 71: //g
            g_cam.rDown();
            break;
        case 70:
            if(g_FlashLight==1){
                gl.uniform1i(u_FlashLight, 0);
                g_FlashLight = 0;
            }else{
                gl.uniform1i(u_FlashLight, 1);
                g_FlashLight = 1;
            }
            break;
        default:
            break;
    }
    setView();
    setPro();
    updateSpot();

}


//camera class for global camera
class Camera{

    constructor(){
        this.eye = new Vector3([7, 5, 0]);
        this.at = new Vector3([-100, -100, -100]);
        this.up = new Vector3([0, 1, 0]);
        //store direction vector
        this.dir = new Vector3();
        this.cross = new Vector3();

        //set incremental step for movement when keypressed
        this.step = .20;
        //compensate for speed perceived speed difference rotate vs translate
        //todo: sensitivity slider?
        this.rotAng = 5.0;


    }

    //get normalized direction vector (direction: at-eye)
    #getDir(){
        this.dir.set(this.at);
        this.dir.sub(this.eye);
        this.dir.div(this.dir.magnitude());
    }

    forward(){
        this.#getDir();
        this.dir.mul(this.step);
        let transMatrix = new Matrix4();
        transMatrix.translate(this.dir.elements[0], this.dir.elements[1], this.dir.elements[2]);
        this.at = transMatrix.multiplyVector3(this.at);
        this.eye = transMatrix.multiplyVector3(this.eye);

    }

    back(){
        this.#getDir();
        this.dir.mul(this.step);
        let transMatrix = new Matrix4();
        transMatrix.translate(-this.dir.elements[0], -this.dir.elements[1], -this.dir.elements[2]);
        this.at = transMatrix.multiplyVector3(this.at);
        this.eye = transMatrix.multiplyVector3(this.eye);
    }

    left(){
        this.#getDir();
        this.cross = Vector3.cross(this.dir, this.up);
        this.cross.mul(this.step);
        let transMatrix = new Matrix4();
        transMatrix.translate(this.cross.elements[0], this.cross.elements[1], this.cross.elements[2]);
        this.at = transMatrix.multiplyVector3(this.at);
        this.eye = transMatrix.multiplyVector3(this.eye);
    }

    right(){
        this.#getDir();
        this.cross = Vector3.cross(this.dir, this.up);
        this.cross.mul(this.step);
        let transMatrix = new Matrix4();
        transMatrix.translate(-this.cross.elements[0], 0, -this.cross.elements[2]);
        this.at = transMatrix.multiplyVector3(this.at);
        this.eye = transMatrix.multiplyVector3(this.eye);
    }

    goUp(){
        let tempUp = new Vector3();
        tempUp.set(this.up);
        tempUp.mul(this.step);
        this.eye = this.eye.add(tempUp);
        this.at = this.at.add(tempUp);
    }

    down(){
        let tempUp = new Vector3();
        tempUp.set(this.up);
        tempUp.mul(this.step);
        this.eye = this.eye.sub(tempUp);
        this.at = this.at.sub(tempUp);
    }



    //http://learnwebgl.brown37.net/07_cameras/camera_movement.html
    rRight(){
        //grading_note: psuedo code adapted from Lucas, thank you!!! : )
        //in this case: dir is treated like at_point, can't use getDir which normalizes
        this.#getDir();
        let panMatrix = new Matrix4();
        let angle = this.rotAng;
        // panMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        panMatrix.setRotate(angle, 0, 1, 0);
        this.at = panMatrix.multiplyVector3(this.at);
        this.up = panMatrix.multiplyVector3(this.up);
    }

    rLeft(){
        //grading_note: psuedo code adapted from Lucas, thank you!!! : )
        //in this case: dir is treated like at_point, can't use getDir which normalizes
        this.#getDir();
        let panMatrix = new Matrix4();
        let angle = -this.rotAng;
        // panMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        panMatrix.setRotate(angle, 0, 1, 0);
        this.at = panMatrix.multiplyVector3(this.at);
        this.up = panMatrix.multiplyVector3(this.up);
    }

    rUp(){
        //grading_note: psuedo code adapted from Lucas, thank you!!! : )
        //in this case: dir is treated like at_point, can't use getDir which normalizes
        this.#getDir();
        this.cross = Vector3.cross(this.dir, this.up);
        let tiltMatrix = new Matrix4();
        let angle = this.rotAng;
        tiltMatrix.setRotate(angle, this.cross.elements[0], this.cross.elements[1], this.cross.elements[2]);
        this.at = tiltMatrix.multiplyVector3(this.at);
        this.up = tiltMatrix.multiplyVector3(this.up);
    }



    rDown(){
        this.#getDir();
        this.cross = Vector3.cross(this.dir, this.up);
        let tiltMatrix = new Matrix4();
        let angle = -this.rotAng;
        tiltMatrix.setRotate(angle, this.cross.elements[0], this.cross.elements[1], this.cross.elements[2]);
        this.at = tiltMatrix.multiplyVector3(this.at);
        this.up = tiltMatrix.multiplyVector3(this.up);
    }

}

//grading_note: failed collision testing :/
// function checkCol(cam){
//     eyes = [cam.eye.elements[0], cam.eye.elements[2]];
//     eyes[0] += .75;
//     eyes[1] -= .75;
//     eyes[0] = parseInt(Math.round(eyes[0]));
//     eyes[1] = parseInt(Math.round(eyes[1]));
//     //forward:
//     //cam.dir.mul(.01);
//
//     // eyes = eyes + [mag, mag];
//     // roundVect(eyes);
//     //eyes[0] += (.5*g_floor.w);
//     eyes[0] += 16;
//     // eyes[1] += (.5*g_floor.w);
//     eyes[1] += 16;
//
//     // console.log(`gmap: ${g_map[eyes.elements[0]][-1*eyes.elements[2]]}`);
//     // console.log(`gmap: ${g_map[0][1]}`);
//
//     //dealing with 32x32 inside 36x36
//     //console.log(`eye2: ${eyes.elements[0]}, ${eyes.elements[2]}`);
//
//     // if((2<eyes.elements[0]<34) && (2<eyes.elements[2]<34)){
//     if((-1<eyes[0] && eyes[0]<32) && (-1<eyes[1] && eyes[1]<32)){
//         console.log(`eye2: ${eyes[0]}, ${eyes[1]}`);
//         console.log(`gmap: ${g_map[eyes[0]][eyes[1]]}`)
//
//         if(g_map[eyes[0]][eyes[1]] == 0){
//             return true;
//         }else{
//             return false;
//         }
//         //console.log(`${g_map[eyes[0]-2][eyes[1]-2]}`);
//         // if(g_map[eyes[0]-2][eyes[1]-2] == 0){
//         //     return true;
//         // }else{
//         //     return false;
//         // }
//     }
//     return true;
//
// }