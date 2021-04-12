//--------------------------------------------------------//
//grading note: roundCone.js: logic for defining, updating and storing shapes
//--------------------------------------------------------//
class Twist{
    static initTwist(){
        /*
        grading note: below: create vertex array. Basically, the inner while loop is going to make a 3D "onion ring" shape.
        then, we're going to move up according to the sin value of an angle going from 0-90 and move in based on the cos of
        the same angle (uptheta). For each onion ring we're essentially drawing the lower circle outline and the upper circle
        outline and drawing in triangles around the surface of the Twist by pushing to a queue in the right order. Then we
        flip the whole mess and draw the bottom half.
        */

        let untypeVert = [];
        let colors = [];
        let theta = 5;

        function convTheta(angle){
            return angle* Math.PI/180.0;
        }

        function pushCol(){
            colors.push(0);
            colors.push(1);
            colors.push(1);
            colors.push(1);
        }


        //todo: make theta something you can set? or have at-compile time high/low poly setting?
        var upTheta = theta;
        var upInc = .90/theta;
        //then, draw two circles, alternating
        for(var j = 0; j<90/theta; j+=1) {
            for (var i = 0; i <= 360; i += theta) {
                //lower circle height decrement
                var upThetaL = Math.cos(convTheta(upTheta-theta));

                //upper circle height decrement
                var upThetaU = Math.cos(convTheta(upTheta));

                var upThetaL_S = Math.sin(convTheta(upTheta-theta));
                var upThetaU_S = Math.sin(convTheta(upTheta));

                untypeVert.push(upThetaL*Math.cos(convTheta(i)));
                untypeVert.push(j*upInc);
                untypeVert.push(upThetaL_S*Math.sin(convTheta(i)));
                pushCol();

                untypeVert.push(upThetaU * Math.cos(convTheta(i)));
                untypeVert.push((j+1)*upInc);
                untypeVert.push(upThetaU_S * Math.sin(convTheta(i)));
                pushCol();

                untypeVert.push(upThetaU * Math.cos(convTheta(i + theta)));
                untypeVert.push((j+1)*upInc);
                untypeVert.push(upThetaU_S * Math.sin(convTheta(i + theta)));
                pushCol();

                untypeVert.push(upThetaL*Math.cos(convTheta(i)));
                untypeVert.push(j*upInc);
                untypeVert.push(upThetaL_S*Math.sin(convTheta(i)));
                pushCol();

                untypeVert.push(upThetaU * Math.cos(convTheta(i + theta)));
                untypeVert.push((j+1)*upInc);
                untypeVert.push(upThetaU_S * Math.sin(convTheta(i + theta)));
                pushCol();

                untypeVert.push(upThetaL * Math.cos(convTheta(i + theta)));
                untypeVert.push(j*upInc);
                untypeVert.push(upThetaL_S * Math.sin(convTheta(i + theta)));
                pushCol();

            }
            upTheta+=theta;
        }
        //grading note: text output of vertices: >45000; >15000 triangles (at theta = 5); text file alone >900KB
        return [untypeVert, colors];
    }



    //grading note: make this a static class field; doesn't have to be initialized with each new object
    static returns = Twist.initTwist();
    static twistCoord = Twist.returns[0];
    static twistCols = Twist.returns[1];
    static twistCoordFloat = new Float32Array(Twist.twistCoord);
    static twistColsFloat = new Float32Array(Twist.twistCols);

    static initNorms(){
        //lines to be drawn; all start from center of twist and go outwards
        let normLines = [];
        //color array placeholder
        let normCol = [];
        //vertices for normals to send to vertext shader to be used for v_normal
        let normVerts = [];
        let i = 0;
        // for(var i = 0; i <Sphere.sphereCoord.length; i+=1){
        while(i < Twist.twistCoord.length){
            let scale = 1.5;

            normLines.push(0.0);
            // normLines.push(0.0);
            normLines.push(Twist.twistCoord[i+1]);
            normLines.push(0.0);

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

            normLines.push(scale*Twist.twistCoord[i]);
            normVerts.push(Twist.twistCoord[i]);
            i+=1;
            normLines.push(scale*Twist.twistCoord[i]);
            normVerts.push(0.0);
            i+=1;
            normLines.push(scale*Twist.twistCoord[i]);
            normVerts.push(Twist.twistCoord[i]);
            i+=1;

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

        }
        return [normLines, normCol, normVerts];
    }

    static returnNorms = Twist.initNorms();
    static lines= Twist.returnNorms[0];
    static normCol = Twist.returnNorms[1];
    static vertNorm = Twist.returnNorms[2];
    static linesFloat = new Float32Array(Twist.lines);
    static normColFloat = new Float32Array(Twist.normCol);
    static vertNormFloat = new Float32Array(Twist.vertNorm);



    constructor(){
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //coordMat: used to cache coordinates... not all shapes used, so uninitialized
        this.coordMat;
        this.rad;
        this.textureNum = -1;
    }

    render() {
        this.drawTwist();
        if(g_normOn){
            this.drawTwistNorms();
        }
    }

    cacheCoords(){
        this.coordMat = new Matrix4(this.matrix);
    }

    //grading note: drawCube function: draw 6 faces with different fake shading colors
    drawTwist(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //new for 3dUV:
        //for twist
        gl.bufferData(gl.ARRAY_BUFFER, Twist.twistCoordFloat, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        gl.disableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        //for twist
        gl.bufferData(gl.ARRAY_BUFFER, Twist.twistColsFloat, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        //for twist
        // gl.bufferData(gl.ARRAY_BUFFER, Twist.twistCoordFloat, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, Twist.vertNormFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for twist
        gl.drawArrays(gl.TRIANGLES, 0, Twist.twistCoordFloat.length/3);

    }

    drawTwistNorms(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //new for 3dUV:

        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Twist.linesFloat, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_TexCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);

        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Twist.normColFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);

        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Twist.linesFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for lines
        gl.drawArrays(gl.LINES, 0, Twist.linesFloat.length/3);
    }


}


