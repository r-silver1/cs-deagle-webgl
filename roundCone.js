//--------------------------------------------------------//
//grading note: Cube.js: logic for defining, updating and storing shapes
//--------------------------------------------------------//
class roundCone{
    static initCone(){
        /*
        grading note: below: create vertex array. Basically, the inner while loop is going to make a 3D "onion ring" shape.
        then, we're going to move up according to the sin value of an angle going from 0-90 and move in based on the cos of
        the same angle (uptheta). For each onion ring we're essentially drawing the lower circle outline and the upper circle
        outline and drawing in triangles around the surface of the sphere by pushing to a queue in the right order. Then we
        flip the whole mess and draw the bottom half.
        */

        let untypeVert = [];
        let colors = [];

        //theta=1: too slow when render each time?
        let theta = 5;
        function convTheta(angle){
            return angle* Math.PI/180.0;
        }

        //all vertices pushes: same operations, set x and z of ring based on ring theta, set y based on upTheta
        function push(thetaR, thetaS, cos, sin){
            untypeVert.push(thetaR*sin);
            untypeVert.push(thetaS);
            untypeVert.push(thetaR*cos);

            colors.push(0);
            colors.push(0);
            colors.push(1);
            colors.push(1);
        }

        //todo: make theta something you can set? or have at-compile time high/low poly setting?
        var upTheta = theta;
        //then, draw two circles, alternating
        for(var j = 0; j<180/theta; j+=1) {
            for (var i = 0; i <= 360; i += theta) {
                //lower circle height decrement
                var upThetaL = Math.cos(convTheta(upTheta-theta));
                //upper circle height decrement
                var upThetaU = Math.cos(convTheta(upTheta));
                //sin values for increasing onion ring height
                var upThetaL_S = -Math.cos(convTheta(upTheta-theta));
                var upThetaU_S = -Math.cos(convTheta(upTheta));

                //sin val inc with i for lower/upper onion ring
                var i_sin = Math.sin(convTheta(i));
                var i_sinU = Math.sin(convTheta(i + theta));
                //cos val inc with i for lower/upper onion ring
                var i_cos = Math.cos(convTheta(i));
                var i_cosU = Math.cos(convTheta(i + theta));

                push(upThetaL, upThetaL_S, i_cos, i_sin);
                push(upThetaU, upThetaU_S, i_cos, i_sin);
                push(upThetaU, upThetaU_S, i_cosU, i_sinU);
                push(upThetaL, upThetaL_S, i_cos, i_sin);
                push(upThetaU, upThetaU_S, i_cosU, i_sinU);
                push(upThetaL, upThetaL_S, i_cosU, i_sinU);

            }
            upTheta+=theta;
        }
        //grading note: text output of vertices: >45000; >15000 triangles (at theta = 5); text file alone >900KB
        return [untypeVert, colors];
    }

    //grading note: make this a static class field; doesn't have to be initialized with each new object
    static returns = roundCone.initCone();
    static coneCoord = roundCone.returns[0];
    static coneCol = roundCone.returns[1];
    static coneCoordFloat = new Float32Array(roundCone.coneCoord);
    static coneColFloat = new Float32Array(roundCone.coneCol);

    static initNorms(){
        //lines to be drawn; all start from center of twist and go outwards
        let normLines = [];
        //color array placeholder
        let normCol = [];
        //vertices for normals to send to vertext shader to be used for v_normal
        let normVerts = [];
        let i = 0;
        // for(var i = 0; i <Sphere.sphereCoord.length; i+=1){
        while(i < roundCone.coneCoord.length){
            let scale = 1.5;

            normLines.push(0.0);
            // normLines.push(0.0);
            normLines.push(roundCone.coneCoord[i+1]);
            normLines.push(0.0);

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);


            normLines.push(scale*roundCone.coneCoord[i]);
            //new fixed normals
            normVerts.push(roundCone.coneCoord[i]);
            i+=1;
            // normLines.push(scale*roundCone.coneCoord[i]);
            normLines.push(roundCone.coneCoord[i]);
            normVerts.push(0.0);
            i+=1;
            normLines.push(scale*roundCone.coneCoord[i]);
            normVerts.push(roundCone.coneCoord[i]);
            i+=1;

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

        }
        return [normLines, normCol, normVerts];
    }

    static normReturns = roundCone.initNorms();
    static lines = roundCone.normReturns[0];
    static cols = roundCone.normReturns[1];
    static vertNorm = roundCone.normReturns[2];
    static linesFloat = new Float32Array(roundCone.lines);
    static colsFloat = new Float32Array(roundCone.cols);
    static vertNormFloat = new Float32Array(roundCone.vertNorm);

    constructor(){
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //coordMat: used to cache coordinates... not all shapes used, so uninitialized
        this.coordMat;
        this.rad;
        this.textureNum = -1;
    }

    render() {
        this.drawCone();
        if(g_normOn){
            this.drawConeNorms();
        }
    }

    cacheCoords(){
        this.coordMat = new Matrix4(this.matrix);
    }

    //grading note: drawCube function: draw 6 faces with different fake shading colors
    drawCone() {
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

        //new for 3dUV:
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneCoordFloat, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //disable texture coord
        gl.disableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneColFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        // gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneCoordFloat, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.vertNormFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, roundCone.coneCoordFloat.length/3);
    }

    drawConeNorms(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

        //new for 3dUV:
        // gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneCoordFloat, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.linesFloat, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //disable texture coord
        gl.disableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        // gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneColFloat, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.colsFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        // gl.bufferData(gl.ARRAY_BUFFER, roundCone.coneCoordFloat, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, roundCone.linesFloat, gl.DYNAMIC_DRAW);
        // gl.bufferData(gl.ARRAY_BUFFER, roundCone.vertNormFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // gl.drawArrays(gl.TRIANGLES, 0, roundCone.coneCoordFloat.length/3);
        gl.drawArrays(gl.LINES, 0, roundCone.linesFloat.length/3);
    }


}

