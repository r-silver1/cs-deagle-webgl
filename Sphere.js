//--------------------------------------------------------//
//grading note: roundCone.js: logic for defining, updating and storing shapes
//--------------------------------------------------------//
class Sphere{

    static initSphere(){
        /*
        grading note: below: create vertex array. Basically, the inner while loop is going to make a 3D "onion ring" shape.
        then, we're going to move up according to the sin value of an angle going from 0-90 and move in based on the cos of
        the same angle (uptheta). For each onion ring we're essentially drawing the lower circle outline and the upper circle
        outline and drawing in triangles around the surface of the sphere by pushing to a queue in the right order. Then we
        flip the whole mess and draw the bottom half.
        */

        //untype vertices: initialize sphere coordinates in dynamic list, create Float32Array list using this data
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
            colors.push(1);
            colors.push(0);
            colors.push(1);
        }



        var upTheta = theta;
        //todo: what is the right ending j value? 450 is kinda just hardcoded, doesn't work for other thetas, must be higher..
        for(var j = 0; j<450/theta; j+=theta) {
            for (var i = 0; i <= 360; i += theta) {
                //lower circle height decrement
                var upThetaL = Math.cos(convTheta(upTheta-theta));
                //upper circle height decrement
                var upThetaU = Math.cos(convTheta(upTheta));
                //sin values for increasing onion ring height
                var upThetaL_S = Math.sin(convTheta(upTheta-theta));
                var upThetaU_S = Math.sin(convTheta(upTheta));

                //sin val inc with i for lower/upper onion ring
                var i_sin = Math.sin(convTheta(i));
                var i_sinU = Math.sin(convTheta(i + theta));
                //cos val inc with i for lower/upper onion ring
                var i_cos = Math.cos(convTheta(i));
                var i_cosU = Math.cos(convTheta(i + theta));

                //orders: need to be clockwise, front:
                //bottom right "square"
                push(upThetaL, upThetaL_S, i_cos, i_sin);
                //top right "square"
                push(upThetaU, upThetaU_S, i_cos, i_sin);
                //top left "square"
                push(upThetaU, upThetaU_S, i_cosU, i_sinU);

                //bottom right "square" (again)
                push(upThetaL, upThetaL_S, i_cos, i_sin);
                //top left "square" (again)
                push(upThetaU, upThetaU_S, i_cosU, i_sinU);
                //bottom left "square"
                push(upThetaL, upThetaL_S, i_cosU, i_sinU);

                //~~~~~~~~~~~~~~~~~~~~~bottom sphere!!!!!!!!!!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                push(upThetaL, -upThetaL_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cosU, i_sinU);


                push(upThetaL, -upThetaL_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cosU, i_sinU);
                push(upThetaL, -upThetaL_S, i_cosU, i_sinU);


            }
            upTheta+=theta;
        }
        //grading note: text output of vertices: >45000; >15000 triangles (at theta = 5); text file alone >900KB
        return [untypeVert, colors];
    }

    static initNorms(){
        let normLines = [];
        let normCol = [];
        let i = 0;
        // for(var i = 0; i <Sphere.sphereCoord.length; i+=1){
        while(i < Sphere.sphereCoord.length){
            normLines.push(0.0);
            normLines.push(0.0);
            normLines.push(0.0);

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

            let scale = 1.5;
            normLines.push(scale*Sphere.sphereCoord[i]);
            i+=1;
            normLines.push(scale*Sphere.sphereCoord[i]);
            i+=1;
            normLines.push(scale*Sphere.sphereCoord[i]);
            i+=1;

            normCol.push(0);
            normCol.push(.8);
            normCol.push(.8);
            normCol.push(.8);

        }
        return [normLines, normCol];
    }

    //grading note: make this a static class field; doesn't have to be initialized with each new object
    static returns = Sphere.initSphere();
    static sphereCoord = Sphere.returns[0];
    static sphereCol = Sphere.returns[1];
    static sphereVertFloat = new Float32Array(Sphere.sphereCoord);
    static sphereColFloat = new Float32Array(Sphere.sphereCol);
    static normReturns = Sphere.initNorms();
    static sphereNorms = Sphere.normReturns[0];
    static sphereNormsFloat = new Float32Array(Sphere.sphereNorms);
    static sphereNormCol = Sphere.normReturns[1];
    static sphereNormColFloat = new Float32Array(Sphere.sphereNormCol);

    constructor(){
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //coordMat: used to cache coordinates... not all shapes used, so uninitialized
        this.coordMat;
        this.rad;
        //todo: fix or remove textures
        this.textureNum = -1;
    }

    render() {
        this.drawSphere();
        if(g_normOn){
            this.drawSphereNorm();
        }
    }

    cacheCoords(){
        this.coordMat = new Matrix4(this.matrix);
    }

    //grading note: drawCube function: draw 6 faces with different fake shading colors
    drawSphere(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        //todo: fix or remove textures
        //set texture
        gl.uniform1i(u_whichTexture, this.textureNum);


        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

        //new for 3dUV:
        //for sphere
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereVertFloat, gl.DYNAMIC_DRAW);

        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //unless really using uv data just delete BS data, disable a_texcoord array when calling sphere to prevent error
        gl.disableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        //for sphere
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereColFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        //for sphere
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereVertFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for sphere
        gl.drawArrays(gl.TRIANGLES, 0, Sphere.sphereVertFloat.length/3);

        //grading note: trippy bit, triangle fan still draws a sphere, just a weird strange one if you fly inside
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/3);

    }

    //draw sphere normal lines
    drawSphereNorm(){
        //pass matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //pass color of point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

        //set texture (could remove but leaving in in case i add textures later)
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //new for 3dUV:
        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereNormsFloat, gl.DYNAMIC_DRAW);

        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);

        //todo: unless really using uv data just delete BS data, disable a_texcoord array when calling sphere to prevent error
        gl.disableVertexAttribArray(a_TexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereNormColFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        //for lines
        gl.bufferData(gl.ARRAY_BUFFER, Sphere.sphereNormsFloat, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        //for lines
        gl.drawArrays(gl.LINES, 0, Sphere.sphereNormsFloat.length/3);
        //grading note: trippy bit, triangle fan still draws a sphere, just a weird strange one if you fly inside
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/3);

    }


}


