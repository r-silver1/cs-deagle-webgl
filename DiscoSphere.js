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
        let normalVert = [];
        let colors = [];

        //theta=1: too slow when render each time?
        let theta = 5;
        // let theta = 45;
        //todo: make pyramid class or extended class? just theta=90
        //

        function convTheta(angle){
            return angle* Math.PI/180.0;
        }

        //all vertices pushes: same operations, set x and z of ring based on ring theta, set y based on upTheta
        function push(thetaR, thetaS, cos, sin){
            untypeVert.push(thetaR*sin);
            untypeVert.push(thetaS);
            untypeVert.push(thetaR*cos);
            //todo: can't use this.color in static function (i think), find diff way to push

            colors.push(0);
            colors.push(1);
            colors.push(0);
            colors.push(1);
        }

        function getNorm(){
            //peek last three elements untypeVert
            var vert1 = new Vector3([untypeVert[untypeVert.length-9], untypeVert[untypeVert.length-8], untypeVert[untypeVert.length-7]]);
            var vert2 = new Vector3([untypeVert[untypeVert.length-6], untypeVert[untypeVert.length-5], untypeVert[untypeVert.length-4]]);
            var vert3 = new Vector3([untypeVert[untypeVert.length-3], untypeVert[untypeVert.length-2], untypeVert[untypeVert.length-1]]);

            let vec1 = vert2;
            vec1 = vec1.sub(vert1);
            vec1 = vec1.normalize();
            let vec2 = vert3;
            vec2 = vec2.sub(vert2);
            vec2 = vec2.normalize();
            let vec3 = vert1;
            vec3 = vec3.sub(vert3);
            vec3 = vec3.normalize();

            // var cross1 = Vector3.cross(vert2, vert1).normalize();
            var cross1 = Vector3.cross(vec1, vec2);
            cross1 = cross1.normalize();
            normalVert.push(cross1.elements[0]);
            normalVert.push(cross1.elements[1]);
            normalVert.push(cross1.elements[2]);

            // var cross2 = Vector3.cross(vert3, vert2).normalize();
            var cross2 = Vector3.cross(vec2, vec3);
            cross2 = cross2.normalize();
            normalVert.push(cross2.elements[0]);
            normalVert.push(cross2.elements[1]);
            normalVert.push(cross2.elements[2]);

            // var cross3 = Vector3.cross(vert1, vert3).normalize();
            var cross3 = Vector3.cross(vec3, vec1);
            cross3 = cross3.normalize();
            normalVert.push(cross3.elements[0]);
            normalVert.push(cross3.elements[1]);
            normalVert.push(cross3.elements[2]);



            // console.log(`vert1: ${vert1.elements}, vert2: ${vert2.elements}, vert3: ${vert3.elements});`);
            // console.log(`cross: ${cross1.elements}`);

            // var verTest = new Vector3([untypeVert[untypeVert.length-1], untypeVert[untypeVert.length-1], untypeVert[untypeVert.length-1]]);
            // console.log(verTest.elements);


        }

        //todo: every vertex pushed needs to have a normal: in the beginning, could just be push three of the same normal after three vertices pushed, find normal with cross prod?


        //todo: make theta something you can set? or have at-compile time high/low poly setting?
        var upTheta = theta;
        //then, draw two circles, alternating
        for(var j = 0; j<450/theta; j+=theta) {
            // for(var j = 0; j<=theta; j+=theta) {
            for (var i = 0; i <= 360; i += theta) {
                // for (var i = 0; i <= theta; i += theta) {
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

                getNorm();

                //bottom right "square" (again)
                push(upThetaL, upThetaL_S, i_cos, i_sin);
                //top left "square" (again)
                push(upThetaU, upThetaU_S, i_cosU, i_sinU);
                //bottom left "square"
                push(upThetaL, upThetaL_S, i_cosU, i_sinU);

                getNorm();

                //~~~~~~~~~~~~~~~~~~~~~bottom sphere!!!!!!!!!!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                push(upThetaL, -upThetaL_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cosU, i_sinU);

                getNorm();

                push(upThetaL, -upThetaL_S, i_cos, i_sin);
                push(upThetaU, -upThetaU_S, i_cosU, i_sinU);
                push(upThetaL, -upThetaL_S, i_cosU, i_sinU);

                getNorm();

            }
            upTheta+=theta;
        }
        //grading note: text output of vertices: >45000; >15000 triangles (at theta = 5); text file alone >900KB
        // console.log(`untypeVert: length: ${untypeVert.length}, triangles: ${untypeVert.length/3}\n${untypeVert}`);
        console.log(`normal: ${normalVert}`);
        return [untypeVert, normalVert, colors];
    }

    //grading note: make this a static class field; doesn't have to be initialized with each new object
    static returns = Sphere.initSphere();
    // static sphereCoord = Sphere.initSphere()[0];
    static sphereCoord = Sphere.returns[0];
    static sphereNorm = Sphere.returns[1];
    static sphereCol = Sphere.returns[2];




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

        //call static field sphere coordinates
        let vertices = new Float32Array(Sphere.sphereCoord);

        //new for 3dUV:
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        //assign buffer obj to position variable; 2nd arg = 3: 3D coord, 3 values/vertex x y z
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_UVbuff);

        //TODO: this is just BS UV data to match length of vertex inputs, either just get rid of or do conditional logic or something else?
        var UVarr = [];
        // for(var i = 0; i < untypeVert.length; i+=1){
        for(var i = 0; i < Sphere.sphereCoord.length; i+=1){
            UVarr.push(0.0);
        }

        let coordUV = new Float32Array(UVarr);

        // let coordUV = new Float32Array([
        //     //front face
        //     0.0, 0.0,  1.0, 0.0,  0.0, 1.0,
        //     0.0, 1.0,  1.0, 1.0,  1.0, 0.0,
        //     //rear face
        //     0.0, 0.0,  1.0, 0.0,  0.0, 1.0,
        //     0.0, 1.0,  1.0, 1.0,  1.0, 0.0,
        //     //right face (or is it left?)
        //     0.0, 0.0,  0.0, 1.0,  1.0, 0.0,
        //     0.0, 1.0,  1.0, 0.0,  1.0, 1.0,
        //     //left
        //     0.0, 0.0,  0.0, 1.0,  1.0, 0.0,
        //     0.0, 1.0,  1.0, 0.0,  1.0, 1.0,
        //     //top
        //     0.0, 1.0,  0.0, 0.0,  1.0, 1.0,
        //     0.0, 0.0,  1.0, 1.0,  1.0, 0.0,
        //     //bottom
        //     0.0, 1.0,  1.0, 1.0,  0.0, 0.0,
        //     1.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // ]);

        gl.bufferData(gl.ARRAY_BUFFER, coordUV, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        //enable assignment to a_pos var
        gl.enableVertexAttribArray(a_TexCoord);

        //todo: remove below call once start shading these
        // gl.disableVertexAttribArray(a_Color);
        // gl.disableVertexAttribArray(a_Normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_ColBuff);
        let colorFloat = new Float32Array(Sphere.sphereCol);
        gl.bufferData(gl.ARRAY_BUFFER, colorFloat, gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        //normal array
        gl.bindBuffer(gl.ARRAY_BUFFER, g_NormBuff);
        let normArr = new Float32Array(Sphere.sphereNorm);
        gl.bufferData(gl.ARRAY_BUFFER, normArr, gl.DYNAMIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        //normal (inverse transpose) matrix
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        console.log(`vertices: ${vertices.length}, colorFloat: ${colorFloat.length}, normArr: ${normArr.length}, normalMat: ${normalMatrix}`);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
        //grading note: trippy bit, triangle fan still draws a sphere, just a weird strange one if you fly inside
        // gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/3);



    }


}


